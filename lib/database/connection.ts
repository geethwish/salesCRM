import mongoose from "mongoose";

// Connection state interface
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastConnectionAttempt: Date | null;
  lastError: Error | null;
}

// Global connection state
const connectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  connectionAttempts: 0,
  lastConnectionAttempt: null,
  lastError: null,
};

// Configuration constants
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;
const CONNECTION_TIMEOUT_MS = 10000;

// Get MongoDB URI from environment variables
function getMongoURI(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }
  return uri;
}

// Get database name from environment variables
function getDBName(): string {
  return process.env.MONGODB_DB_NAME || "sales-crm";
}

// Connection options for production-ready setup
const connectionOptions: mongoose.ConnectOptions = {
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity

  // Timeout settings
  serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
  socketTimeoutMS: 45000,
  connectTimeoutMS: CONNECTION_TIMEOUT_MS,

  // Retry settings
  retryWrites: true,
  retryReads: true,

  // Buffer settings
  bufferCommands: false, // Disable mongoose buffering

  // Other settings
  autoIndex: process.env.NODE_ENV !== "production", // Build indexes in development only
  autoCreate: true, // Automatically create collections
};

// Sleep utility for retry delays
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Connect to MongoDB with retry logic
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (connectionState.isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionState.isConnecting) {
    // Wait for the current connection attempt to complete
    while (connectionState.isConnecting) {
      await sleep(100);
    }

    if (connectionState.isConnected) {
      return mongoose;
    }
  }

  connectionState.isConnecting = true;

  try {
    const uri = getMongoURI();
    const dbName = getDBName();

    console.log(`🔄 Connecting to MongoDB: ${dbName}`);

    // Attempt connection with retry logic
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        connectionState.connectionAttempts++;
        connectionState.lastConnectionAttempt = new Date();

        // Connect to MongoDB
        await mongoose.connect(uri, {
          ...connectionOptions,
          dbName,
        });

        // Verify connection
        if (mongoose.connection.readyState === 1) {
          connectionState.isConnected = true;
          connectionState.lastError = null;

          console.log(`✅ Connected to MongoDB: ${dbName}`);
          console.log(
            `📊 Connection pool size: ${connectionOptions.maxPoolSize}`
          );

          // Set up connection event listeners
          setupConnectionEventListeners();

          return mongoose;
        }
      } catch (error) {
        lastError = error as Error;
        connectionState.lastError = lastError;

        console.error(
          `❌ MongoDB connection attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`,
          error
        );

        if (attempt < MAX_RETRY_ATTEMPTS) {
          console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    // All retry attempts failed
    throw new Error(
      `Failed to connect to MongoDB after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`
    );
  } catch (error) {
    connectionState.lastError = error as Error;
    console.error("🚨 MongoDB connection failed:", error);
    throw error;
  } finally {
    connectionState.isConnecting = false;
  }
}

// Set up connection event listeners
function setupConnectionEventListeners(): void {
  // Connection successful
  mongoose.connection.on("connected", () => {
    connectionState.isConnected = true;
    console.log("📡 MongoDB connection established");
  });

  // Connection error
  mongoose.connection.on("error", (error) => {
    connectionState.lastError = error;
    console.error("🚨 MongoDB connection error:", error);
  });

  // Connection disconnected
  mongoose.connection.on("disconnected", () => {
    connectionState.isConnected = false;
    console.warn("⚠️ MongoDB connection lost");
  });

  // Connection reconnected
  mongoose.connection.on("reconnected", () => {
    connectionState.isConnected = true;
    console.log("🔄 MongoDB reconnected");
  });

  // Graceful shutdown handling
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

// Graceful shutdown function
async function gracefulShutdown(): Promise<void> {
  console.log("🔄 Gracefully shutting down MongoDB connection...");

  try {
    await mongoose.connection.close();
    connectionState.isConnected = false;
    console.log("✅ MongoDB connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during MongoDB shutdown:", error);
    process.exit(1);
  }
}

// Disconnect from MongoDB
export async function disconnectFromDatabase(): Promise<void> {
  if (!connectionState.isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    connectionState.isConnected = false;
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
}

// Get connection status
export function getConnectionStatus(): ConnectionState {
  return {
    ...connectionState,
    isConnected:
      connectionState.isConnected && mongoose.connection.readyState === 1,
  };
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  details: {
    connected: boolean;
    readyState: number;
    host?: string;
    name?: string;
    collections?: number;
    lastError?: string;
  };
}> {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return {
        status: "unhealthy",
        details: {
          connected: false,
          readyState: mongoose.connection.readyState,
          lastError: connectionState.lastError?.message,
        },
      };
    }

    // Perform a simple database operation to verify health
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database instance is not available");
    }

    await db.admin().ping();

    const collections = await db.listCollections().toArray();

    return {
      status: "healthy",
      details: {
        connected: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: collections.length,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      details: {
        connected: false,
        readyState: mongoose.connection.readyState,
        lastError: (error as Error).message,
      },
    };
  }
}

// Utility function to ensure database connection
export async function ensureConnection(): Promise<void> {
  if (!connectionState.isConnected || mongoose.connection.readyState !== 1) {
    await connectToDatabase();
  }
}

// Export connection state for monitoring
export { connectionState };
