// Load environment variables from .env.local FIRST
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file before importing any modules that use env vars
config({ path: resolve(process.cwd(), ".env.local") });

import { OrderCategory, OrderSource } from "@/lib/types/order";

/**
 * Sample order data for seeding
 */
const sampleOrders = [
  {
    customer: "Alice Smith",
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-01",
    source: OrderSource.ONLINE,
    geo: "New York",
    amount: 1299.99,
    status: "delivered" as const,
  },
  {
    customer: "Bob Johnson",
    category: OrderCategory.CLOTHING,
    date: "2025-09-02",
    source: OrderSource.STORE,
    geo: "California",
    amount: 89.5,
    status: "shipped" as const,
  },
  {
    customer: "Carol Williams",
    category: OrderCategory.BOOKS,
    date: "2025-09-03",
    source: OrderSource.ONLINE,
    geo: "Texas",
    amount: 24.99,
    status: "delivered" as const,
  },
  {
    customer: "David Brown",
    category: OrderCategory.HOME_GARDEN,
    date: "2025-09-04",
    source: OrderSource.PHONE,
    geo: "Florida",
    amount: 156.75,
    status: "processing" as const,
  },
  {
    customer: "Emma Davis",
    category: OrderCategory.SPORTS,
    date: "2025-09-05",
    source: OrderSource.MOBILE_APP,
    geo: "Illinois",
    amount: 299.99,
    status: "pending" as const,
  },
  {
    customer: "Frank Miller",
    category: OrderCategory.AUTOMOTIVE,
    date: "2025-08-28",
    source: OrderSource.ONLINE,
    geo: "Michigan",
    amount: 89.99,
    status: "delivered" as const,
  },
  {
    customer: "Grace Wilson",
    category: OrderCategory.HEALTH_BEAUTY,
    date: "2025-08-29",
    source: OrderSource.STORE,
    geo: "Washington",
    amount: 45.5,
    status: "shipped" as const,
  },
  {
    customer: "Henry Moore",
    category: OrderCategory.TOYS_GAMES,
    date: "2025-08-30",
    source: OrderSource.SOCIAL_MEDIA,
    geo: "Oregon",
    amount: 67.99,
    status: "delivered" as const,
  },
  {
    customer: "Ivy Taylor",
    category: OrderCategory.ELECTRONICS,
    date: "2025-08-31",
    source: OrderSource.ONLINE,
    geo: "Nevada",
    amount: 899.99,
    status: "processing" as const,
  },
  {
    customer: "Jack Anderson",
    category: OrderCategory.CLOTHING,
    date: "2025-09-06",
    source: OrderSource.MOBILE_APP,
    geo: "Arizona",
    amount: 125.0,
    status: "pending" as const,
  },
  {
    customer: "Kate Thomas",
    category: OrderCategory.BOOKS,
    date: "2025-09-07",
    source: OrderSource.ONLINE,
    geo: "Colorado",
    amount: 19.99,
    status: "delivered" as const,
  },
  {
    customer: "Liam Jackson",
    category: OrderCategory.HOME_GARDEN,
    date: "2025-09-08",
    source: OrderSource.STORE,
    geo: "Utah",
    amount: 234.5,
    status: "shipped" as const,
  },
  {
    customer: "Mia White",
    category: OrderCategory.SPORTS,
    date: "2025-09-09",
    source: OrderSource.PHONE,
    geo: "New Mexico",
    amount: 178.99,
    status: "processing" as const,
  },
  {
    customer: "Noah Harris",
    category: OrderCategory.AUTOMOTIVE,
    date: "2025-09-10",
    source: OrderSource.ONLINE,
    geo: "Idaho",
    amount: 456.75,
    status: "pending" as const,
  },
  {
    customer: "Olivia Martin",
    category: OrderCategory.HEALTH_BEAUTY,
    date: "2025-09-11",
    source: OrderSource.MOBILE_APP,
    geo: "Montana",
    amount: 78.25,
    status: "delivered" as const,
  },
  {
    customer: "Paul Thompson",
    category: OrderCategory.TOYS_GAMES,
    date: "2025-09-12",
    source: OrderSource.SOCIAL_MEDIA,
    geo: "Wyoming",
    amount: 92.5,
    status: "shipped" as const,
  },
  {
    customer: "Quinn Garcia",
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-13",
    source: OrderSource.STORE,
    geo: "North Dakota",
    amount: 1599.99,
    status: "processing" as const,
  },
  {
    customer: "Ruby Martinez",
    category: OrderCategory.CLOTHING,
    date: "2025-09-14",
    source: OrderSource.ONLINE,
    geo: "South Dakota",
    amount: 67.99,
    status: "pending" as const,
  },
  {
    customer: "Sam Robinson",
    category: OrderCategory.BOOKS,
    date: "2025-09-15",
    source: OrderSource.PHONE,
    geo: "Nebraska",
    amount: 34.99,
    status: "delivered" as const,
  },
  {
    customer: "Tina Clark",
    category: OrderCategory.HOME_GARDEN,
    date: "2025-09-16",
    source: OrderSource.MOBILE_APP,
    geo: "Kansas",
    amount: 189.75,
    status: "shipped" as const,
  },
  {
    customer: "Uma Rodriguez",
    category: OrderCategory.SPORTS,
    date: "2025-08-25",
    source: OrderSource.ONLINE,
    geo: "Oklahoma",
    amount: 245.5,
    status: "delivered" as const,
  },
  {
    customer: "Victor Lewis",
    category: OrderCategory.AUTOMOTIVE,
    date: "2025-08-26",
    source: OrderSource.STORE,
    geo: "Arkansas",
    amount: 123.99,
    status: "processing" as const,
  },
  {
    customer: "Wendy Lee",
    category: OrderCategory.HEALTH_BEAUTY,
    date: "2025-08-27",
    source: OrderSource.SOCIAL_MEDIA,
    geo: "Louisiana",
    amount: 56.75,
    status: "shipped" as const,
  },
  {
    customer: "Xavier Walker",
    category: OrderCategory.TOYS_GAMES,
    date: "2025-08-24",
    source: OrderSource.PHONE,
    geo: "Mississippi",
    amount: 87.25,
    status: "delivered" as const,
  },
  {
    customer: "Yara Hall",
    category: OrderCategory.ELECTRONICS,
    date: "2025-08-23",
    source: OrderSource.MOBILE_APP,
    geo: "Alabama",
    amount: 799.99,
    status: "pending" as const,
  },
];

/**
 * Seed the database with sample orders
 */
async function seedDatabase() {
  let mongoServer: import("mongodb-memory-server").MongoMemoryServer | null =
    null;

  try {
    console.log("🌱 Starting database seeding...");

    // Import required modules after env vars are loaded
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const { connectToDatabase } = await import("@/lib/database/connection");
    const { orderService } = await import("@/lib/services/orderService");
    const UserModel = (await import("@/lib/models/User")).default;
    const OrderModel = (await import("@/lib/models/Order")).default;

    // Check if we should use MongoDB Memory Server or real MongoDB
    const existingUri = process.env.MONGODB_URI;
    const useMemoryServer =
      !existingUri || existingUri.includes("localhost:27017");

    if (useMemoryServer) {
      // Start MongoDB Memory Server for development
      console.log("🚀 Starting MongoDB Memory Server...");
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: "sales-crm",
          port: 27017,
        },
      });

      const mongoUri = mongoServer.getUri();
      console.log(`📡 MongoDB Memory Server started at: ${mongoUri}`);

      // Override the MONGODB_URI environment variable
      process.env.MONGODB_URI = mongoUri;
    } else {
      console.log(`📡 Using existing MongoDB connection: ${existingUri}`);
    }

    // Ensure database connection
    await connectToDatabase();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log("🗑️  Cleared existing orders and users");

    // Create superadmin account
    console.log("👤 Creating superadmin account...");
    const superadminData = {
      email: "admin@crm.com",
      password: "password", // Will be hashed by pre-save middleware
      name: "Super Admin",
      role: "admin" as const,
      isActive: true,
      emailVerified: true,
    };

    const superadmin = new UserModel(superadminData);
    const savedSuperadmin = await superadmin.save();
    console.log(`✅ Created superadmin account: ${savedSuperadmin.email}`);

    // Create sample orders associated with superadmin
    console.log("📦 Creating sample orders...");
    let createdCount = 0;
    for (const orderData of sampleOrders) {
      try {
        await orderService.createOrder(
          orderData,
          savedSuperadmin._id.toString()
        );
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Failed to create order for ${orderData.customer}:`,
          error
        );
      }
    }

    console.log(`✅ Successfully created ${createdCount} orders`);

    // Display statistics
    const stats = await orderService.getOrderStats(
      savedSuperadmin._id.toString()
    );
    console.log("\n📊 Database Statistics:");
    console.log(`Total Orders: ${stats.total}`);
    console.log(`Total Amount: $${stats.totalAmount.toFixed(2)}`);
    console.log(`Average Amount: $${stats.averageAmount.toFixed(2)}`);

    console.log("\n📈 Orders by Category:");
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    console.log("\n🛒 Orders by Source:");
    Object.entries(stats.bySource).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`);
    });

    console.log("\n🌍 Top Locations:");
    const topLocations = Object.entries(stats.byLocation)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
    topLocations.forEach(([location, count]) => {
      console.log(`  ${location}: ${count}`);
    });

    console.log(`\n👤 Superadmin Account:`);
    console.log(`  Email: ${savedSuperadmin.email}`);
    console.log(`  Password: password`);
    console.log(`  Role: ${savedSuperadmin.role}`);

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    // Clean up MongoDB Memory Server if it was started
    if (mongoServer) {
      console.log("🧹 Stopping MongoDB Memory Server...");
      await mongoServer.stop();
      console.log("✅ MongoDB Memory Server stopped");
    }
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase, sampleOrders };
