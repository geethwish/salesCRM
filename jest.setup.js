import "@testing-library/jest-dom";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location - only if needed by specific tests
// Tests can mock window.location individually if needed

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => {
  const urlParts = url.split("?");
  const search = urlParts.length > 1 ? "?" + urlParts[1] : "";
  const searchParams = new URLSearchParams(
    urlParts.length > 1 ? urlParts[1] : ""
  );

  return {
    href: url,
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: urlParts[0].replace(/^https?:\/\/[^\/]+/, "") || "/",
    search: search,
    hash: "",
    searchParams: searchParams,
  };
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn();

// Mock Blob
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: content ? content.length : 0,
  type: options?.type || "",
}));

// Mock File
global.File = jest.fn().mockImplementation((content, name, options) => ({
  content,
  name,
  options,
  size: content ? content.length : 0,
  type: options?.type || "",
  lastModified: Date.now(),
}));

// Mock Request for Next.js API routes
global.Request = jest.fn().mockImplementation((url, options = {}) => {
  const headers = new Map(Object.entries(options.headers || {}));
  const cookies = new Map();

  return {
    url,
    method: options.method || "GET",
    headers: {
      get: (key) => headers.get(key.toLowerCase()),
      set: (key, value) => headers.set(key.toLowerCase(), value),
      has: (key) => headers.has(key.toLowerCase()),
      delete: (key) => headers.delete(key.toLowerCase()),
      entries: () => headers.entries(),
      keys: () => headers.keys(),
      values: () => headers.values(),
      forEach: (callback) => headers.forEach(callback),
    },
    cookies: {
      get: (key) => ({ value: cookies.get(key) }),
      set: (key, value) => cookies.set(key, value),
      has: (key) => cookies.has(key),
      delete: (key) => cookies.delete(key),
      getAll: () =>
        Array.from(cookies.entries()).map(([name, value]) => ({ name, value })),
    },
    body: options.body,
    json: jest.fn().mockResolvedValue(JSON.parse(options.body || "{}")),
    text: jest.fn().mockResolvedValue(options.body || ""),
    formData: jest.fn().mockResolvedValue(new FormData()),
    nextUrl: {
      searchParams: new URLSearchParams(url.split("?")[1] || ""),
    },
  };
});

// Mock Response for Next.js API routes
global.Response = jest.fn().mockImplementation((body, options = {}) => ({
  body,
  status: options.status || 200,
  statusText: options.statusText || "OK",
  headers: new Map(Object.entries(options.headers || {})),
  ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
  json: jest.fn().mockResolvedValue(body),
  text: jest.fn().mockResolvedValue(body),
}));

// Add static json method to Response
global.Response.json = jest.fn().mockImplementation((data, options = {}) => ({
  body: JSON.stringify(data),
  status: options.status || 200,
  statusText: options.statusText || "OK",
  headers: new Map(
    Object.entries({
      "content-type": "application/json",
      ...(options.headers || {}),
    })
  ),
  ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
}));

// Mock NextResponse and NextRequest for Next.js API routes
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options = {}) => ({
      body: JSON.stringify(data),
      status: options.status || 200,
      statusText: options.statusText || "OK",
      headers: new Map(
        Object.entries({
          "content-type": "application/json",
          ...(options.headers || {}),
        })
      ),
      ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
      json: jest.fn().mockResolvedValue(data),
      text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    })),
    redirect: jest.fn().mockImplementation((url, status = 302) => ({
      status,
      headers: new Map([["location", url]]),
      body: null,
    })),
  },
  NextRequest: jest.fn().mockImplementation((url, options = {}) => {
    const headers = new Map();
    // Convert header keys to lowercase when setting them
    Object.entries(options.headers || {}).forEach(([key, value]) => {
      headers.set(key.toLowerCase(), value);
    });
    const cookies = new Map();

    // Parse cookies from Cookie header
    const cookieHeader = headers.get("cookie");
    if (cookieHeader) {
      cookieHeader.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
          cookies.set(name, value);
        }
      });
    }

    return {
      url,
      method: options.method || "GET",
      headers: {
        get: (key) => headers.get(key.toLowerCase()),
        set: (key, value) => headers.set(key.toLowerCase(), value),
        has: (key) => headers.has(key.toLowerCase()),
        delete: (key) => headers.delete(key.toLowerCase()),
        entries: () => headers.entries(),
        keys: () => headers.keys(),
        values: () => headers.values(),
        forEach: (callback) => headers.forEach(callback),
      },
      cookies: {
        get: (key) => ({ value: cookies.get(key) }),
        set: (key, value) => cookies.set(key, value),
        has: (key) => cookies.has(key),
        delete: (key) => cookies.delete(key),
        getAll: () =>
          Array.from(cookies.entries()).map(([name, value]) => ({
            name,
            value,
          })),
      },
      body: options.body,
      json: jest.fn().mockResolvedValue(JSON.parse(options.body || "{}")),
      text: jest.fn().mockResolvedValue(options.body || ""),
      formData: jest.fn().mockResolvedValue(new FormData()),
      nextUrl: {
        searchParams: new URLSearchParams(
          url.includes("?") ? url.split("?")[1] : ""
        ),
      },
    };
  }),
}));

// Mock Headers
global.Headers = jest.fn().mockImplementation((init) => {
  const headers = new Map();
  if (init) {
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => headers.set(key.toLowerCase(), value));
    } else if (typeof init === "object") {
      Object.entries(init).forEach(([key, value]) =>
        headers.set(key.toLowerCase(), value)
      );
    }
  }
  return {
    get: (key) => headers.get(key.toLowerCase()),
    set: (key, value) => headers.set(key.toLowerCase(), value),
    has: (key) => headers.has(key.toLowerCase()),
    delete: (key) => headers.delete(key.toLowerCase()),
    entries: () => headers.entries(),
    keys: () => headers.keys(),
    values: () => headers.values(),
    forEach: (callback) => headers.forEach(callback),
  };
});

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => {
  const data = new Map();
  return {
    append: (key, value) => data.set(key, value),
    get: (key) => data.get(key),
    has: (key) => data.has(key),
    delete: (key) => data.delete(key),
    entries: () => data.entries(),
    keys: () => data.keys(),
    values: () => data.values(),
    forEach: (callback) => data.forEach(callback),
  };
});

// Mock crypto for Node.js environment
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: jest.fn(() => "mocked-uuid"),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock Next.js navigation globally
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock TextEncoder/TextDecoder
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn(
    (str) => new Uint8Array(str.split("").map((c) => c.charCodeAt(0)))
  ),
}));

global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn((arr) => String.fromCharCode(...arr)),
}));

// Suppress console warnings for tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes("React does not recognize") ||
      message.includes("validateDOMNesting") ||
      message.includes("Warning: Failed prop type"))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
