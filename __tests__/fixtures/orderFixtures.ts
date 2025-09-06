/**
 * Test fixtures for orders
 */

import { OrderCategory, OrderSource } from "@/lib/types/order";

/**
 * Sample order data for testing
 */
export const sampleOrderData = [
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
];

/**
 * Large dataset for performance testing
 */
export const generateLargeOrderDataset = (count: number = 1000) => {
  const orders: Array<{
    customer: string;
    category: string;
    date: string;
    source: string;
    geo: string;
    amount: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  }> = [];
  const categories = Object.values(OrderCategory);
  const sources = Object.values(OrderSource);
  const locations = [
    "New York",
    "California",
    "Texas",
    "Florida",
    "Illinois",
    "Pennsylvania",
    "Ohio",
    "Georgia",
    "North Carolina",
    "Michigan",
    "New Jersey",
    "Virginia",
    "Washington",
    "Arizona",
    "Massachusetts",
    "Tennessee",
    "Indiana",
    "Missouri",
    "Maryland",
    "Wisconsin",
  ];
  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ] as const;

  for (let i = 0; i < count; i++) {
    const year = 2025;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    orders.push({
      customer: `Customer ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      date,
      source: sources[Math.floor(Math.random() * sources.length)],
      geo: locations[Math.floor(Math.random() * locations.length)],
      amount: Math.round((Math.random() * 2000 + 10) * 100) / 100, // $10 - $2010
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return orders;
};

/**
 * Edge case test data
 */
export const edgeCaseOrderData = [
  // Minimum values
  {
    customer: "A",
    category: OrderCategory.BOOKS,
    date: "2025-01-01",
    source: OrderSource.PHONE,
    geo: "NY",
    amount: 0.01,
    status: "pending" as const,
  },
  // Maximum values
  {
    customer: "A".repeat(100), // Max length customer name
    category: OrderCategory.HEALTH_BEAUTY,
    date: "2025-12-31",
    source: OrderSource.SOCIAL_MEDIA,
    geo: "A".repeat(100), // Max length location
    amount: 999999.99,
    status: "delivered" as const,
  },
  // Special characters
  {
    customer: "José María O'Connor-Smith",
    category: OrderCategory.TOYS_GAMES,
    date: "2025-06-15",
    source: OrderSource.ONLINE,
    geo: "São Paulo",
    amount: 123.45,
    status: "shipped" as const,
  },
  // No amount (optional field)
  {
    customer: "No Amount Customer",
    category: OrderCategory.AUTOMOTIVE,
    date: "2025-03-20",
    source: OrderSource.STORE,
    geo: "Detroit",
    status: "processing" as const,
  },
];

/**
 * Invalid order data for validation testing
 */
export const invalidOrderData = [
  // Missing required fields
  {
    customer: "Missing Fields Customer",
    // Missing category, date, source, geo
  },
  // Invalid enum values
  {
    customer: "Invalid Enum Customer",
    category: "InvalidCategory",
    date: "2025-09-01",
    source: "InvalidSource",
    geo: "Test Location",
  },
  // Invalid date format
  {
    customer: "Invalid Date Customer",
    category: OrderCategory.ELECTRONICS,
    date: "invalid-date",
    source: OrderSource.ONLINE,
    geo: "Test Location",
  },
  // Empty required fields
  {
    customer: "",
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-01",
    source: OrderSource.ONLINE,
    geo: "",
  },
  // Too long fields
  {
    customer: "A".repeat(101), // Too long
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-01",
    source: OrderSource.ONLINE,
    geo: "A".repeat(101), // Too long
  },
  // Negative amount
  {
    customer: "Negative Amount Customer",
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-01",
    source: OrderSource.ONLINE,
    geo: "Test Location",
    amount: -100,
  },
];

/**
 * Test data for specific scenarios
 */
export const scenarioTestData = {
  // Orders for pagination testing
  paginationTest: Array.from({ length: 25 }, (_, i) => ({
    customer: `Pagination Customer ${i + 1}`,
    category: OrderCategory.ELECTRONICS,
    date: `2025-09-${String((i % 30) + 1).padStart(2, "0")}`,
    source: OrderSource.ONLINE,
    geo: "Test Location",
    amount: (i + 1) * 10,
    status: "pending" as const,
  })),

  // Orders for filtering testing
  filteringTest: [
    {
      customer: "Electronics Customer 1",
      category: OrderCategory.ELECTRONICS,
      date: "2025-09-01",
      source: OrderSource.ONLINE,
      geo: "New York",
      amount: 1000,
      status: "delivered" as const,
    },
    {
      customer: "Electronics Customer 2",
      category: OrderCategory.ELECTRONICS,
      date: "2025-09-02",
      source: OrderSource.STORE,
      geo: "California",
      amount: 1500,
      status: "shipped" as const,
    },
    {
      customer: "Clothing Customer 1",
      category: OrderCategory.CLOTHING,
      date: "2025-09-03",
      source: OrderSource.ONLINE,
      geo: "New York",
      amount: 500,
      status: "pending" as const,
    },
    {
      customer: "Books Customer 1",
      category: OrderCategory.BOOKS,
      date: "2025-09-04",
      source: OrderSource.PHONE,
      geo: "Texas",
      amount: 250,
      status: "processing" as const,
    },
  ],

  // Orders for sorting testing
  sortingTest: [
    {
      customer: "Charlie",
      category: OrderCategory.ELECTRONICS,
      date: "2025-09-03",
      source: OrderSource.ONLINE,
      geo: "Location C",
      amount: 300,
      status: "pending" as const,
    },
    {
      customer: "Alice",
      category: OrderCategory.CLOTHING,
      date: "2025-09-01",
      source: OrderSource.STORE,
      geo: "Location A",
      amount: 100,
      status: "delivered" as const,
    },
    {
      customer: "Bob",
      category: OrderCategory.BOOKS,
      date: "2025-09-02",
      source: OrderSource.PHONE,
      geo: "Location B",
      amount: 200,
      status: "shipped" as const,
    },
  ],

  // Orders for date range testing
  dateRangeTest: [
    {
      customer: "January Customer",
      category: OrderCategory.ELECTRONICS,
      date: "2025-01-15",
      source: OrderSource.ONLINE,
      geo: "Test Location",
      amount: 1000,
      status: "delivered" as const,
    },
    {
      customer: "June Customer",
      category: OrderCategory.CLOTHING,
      date: "2025-06-15",
      source: OrderSource.STORE,
      geo: "Test Location",
      amount: 500,
      status: "shipped" as const,
    },
    {
      customer: "December Customer",
      category: OrderCategory.BOOKS,
      date: "2025-12-15",
      source: OrderSource.PHONE,
      geo: "Test Location",
      amount: 250,
      status: "pending" as const,
    },
  ],

  // Orders for search testing
  searchTest: [
    {
      customer: "Alice Smith",
      category: OrderCategory.ELECTRONICS,
      date: "2025-09-01",
      source: OrderSource.ONLINE,
      geo: "New York",
      amount: 1000,
      status: "delivered" as const,
    },
    {
      customer: "Bob Johnson",
      category: OrderCategory.CLOTHING,
      date: "2025-09-02",
      source: OrderSource.STORE,
      geo: "California",
      amount: 500,
      status: "shipped" as const,
    },
    {
      customer: "Carol Williams",
      category: OrderCategory.BOOKS,
      date: "2025-09-03",
      source: OrderSource.PHONE,
      geo: "Texas",
      amount: 250,
      status: "pending" as const,
    },
  ],
};

/**
 * Expected statistics for test data
 */
export const expectedStatistics = {
  sampleData: {
    total: 5,
    totalAmount: 1871.22,
    averageAmount: 374.244,
    byCategory: {
      [OrderCategory.ELECTRONICS]: 1,
      [OrderCategory.CLOTHING]: 1,
      [OrderCategory.BOOKS]: 1,
      [OrderCategory.HOME_GARDEN]: 1,
      [OrderCategory.SPORTS]: 1,
    },
    bySource: {
      [OrderSource.ONLINE]: 2,
      [OrderSource.STORE]: 1,
      [OrderSource.PHONE]: 1,
      [OrderSource.MOBILE_APP]: 1,
    },
    byLocation: {
      "New York": 1,
      California: 1,
      Texas: 1,
      Florida: 1,
      Illinois: 1,
    },
  },
};
