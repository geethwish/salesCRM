/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Order } from "@/lib/types/order";
import { format } from "date-fns";

// CSV export utility functions
export class CSVExporter {
  /**
   * Convert orders data to CSV format
   */
  static ordersToCSV(orders: Order[]): string {
    if (orders.length === 0) {
      return "No data to export";
    }

    // Define CSV headers
    const headers = [
      "Order ID",
      "Customer",
      "Category",
      "Date",
      "Source",
      "Location",
      "Amount",
      "Status",
      "Created At",
      "Updated At",
    ];

    // Convert orders to CSV rows
    const rows = orders.map((order) => [
      order.id,
      this.escapeCSVField(order.customer),
      this.escapeCSVField(order.category),
      order.date,
      this.escapeCSVField(order.source),
      this.escapeCSVField(order.geo),
      order.amount ? order.amount.toFixed(2) : "",
      order.status,
      order.createdAt
        ? format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")
        : "",
      order.updatedAt
        ? format(new Date(order.updatedAt), "yyyy-MM-dd HH:mm:ss")
        : "",
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Convert statistics data to CSV format
   */
  static statsToCSV(stats: {
    total: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byLocation: Record<string, number>;
  }): string {
    const sections: any = [];

    // Overall statistics
    sections.push("Overall Statistics");
    sections.push("Metric,Value");
    sections.push(`Total Orders,${stats.total}`);
    sections.push(`Total Revenue,${stats.totalAmount.toFixed(2)}`);
    sections.push(`Average Order Value,${stats.averageAmount.toFixed(2)}`);
    sections.push("");

    // By Category
    sections.push("Orders by Category");
    sections.push("Category,Count");
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      sections.push(`${this.escapeCSVField(category)},${count}`);
    });
    sections.push("");

    // By Source
    sections.push("Orders by Source");
    sections.push("Source,Count");
    Object.entries(stats.bySource).forEach(([source, count]) => {
      sections.push(`${this.escapeCSVField(source)},${count}`);
    });
    sections.push("");

    // By Location
    sections.push("Orders by Location");
    sections.push("Location,Count");
    Object.entries(stats.byLocation).forEach(([location, count]) => {
      sections.push(`${this.escapeCSVField(location)},${count}`);
    });

    return sections.join("\n");
  }

  /**
   * Escape CSV field to handle commas, quotes, and newlines
   */
  private static escapeCSVField(field: string): string {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csvContent: string, filename: string): void {
    // Create blob with CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename with timestamp
   */
  static generateFilename(prefix: string, extension: string = "csv"): string {
    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
   * Export orders with filters applied
   */
  static async exportOrders(
    orders: Order[],
    filters?: {
      category?: string;
      source?: string;
      geo?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    }
  ): Promise<void> {
    try {
      // Generate CSV content
      const csvContent = this.ordersToCSV(orders);

      // Generate filename based on filters
      let filenameParts = ["orders"];

      if (filters?.category) {
        filenameParts.push(
          `category-${filters.category.toLowerCase().replace(/\s+/g, "-")}`
        );
      }

      if (filters?.source) {
        filenameParts.push(
          `source-${filters.source.toLowerCase().replace(/\s+/g, "-")}`
        );
      }

      if (filters?.geo) {
        filenameParts.push(
          `location-${filters.geo.toLowerCase().replace(/\s+/g, "-")}`
        );
      }

      if (filters?.dateFrom && filters?.dateTo) {
        filenameParts.push(`${filters.dateFrom}_to_${filters.dateTo}`);
      } else if (filters?.dateFrom) {
        filenameParts.push(`from-${filters.dateFrom}`);
      } else if (filters?.dateTo) {
        filenameParts.push(`until-${filters.dateTo}`);
      }

      const filename = this.generateFilename(filenameParts.join("_"));

      // Download file
      this.downloadCSV(csvContent, filename);

      return Promise.resolve();
    } catch (error) {
      console.error("Error exporting orders:", error);
      throw new Error("Failed to export orders to CSV");
    }
  }

  /**
   * Export statistics
   */
  static async exportStats(stats: {
    total: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byLocation: Record<string, number>;
  }): Promise<void> {
    try {
      // Generate CSV content
      const csvContent = this.statsToCSV(stats);

      // Generate filename
      const filename = this.generateFilename("orders_statistics");

      // Download file
      this.downloadCSV(csvContent, filename);

      return Promise.resolve();
    } catch (error) {
      console.error("Error exporting statistics:", error);
      throw new Error("Failed to export statistics to CSV");
    }
  }
}

// Export utility functions
export const exportOrdersToCSV = CSVExporter.exportOrders.bind(CSVExporter);
export const exportStatsToCSV = CSVExporter.exportStats.bind(CSVExporter);

export default CSVExporter;
