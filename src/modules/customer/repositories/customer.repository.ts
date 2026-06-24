import { prisma } from "@/src/infrastructure/prisma/client";

export interface CustomerFilters {
  search?: string;
  categoryId?: string;
  hasBookings?: string; // "ALL" | "HAS_BOOKINGS" | "NO_BOOKINGS"
}

export class CustomerRepository {
  async findAll(filters: CustomerFilters = {}) {
    const where: any = {};

    // 1. Text Search (fullName, email, phoneNumber, instagram)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchInstagram = searchLower.replace(/^@+/, "");
      where.OR = [
        { fullName: { contains: searchLower, mode: "insensitive" } },
        { email: { contains: searchLower, mode: "insensitive" } },
        { phoneNumber: { contains: searchLower, mode: "insensitive" } },
        { instagram: { contains: searchInstagram, mode: "insensitive" } },
      ];
    }

    // 2. Filter by Booking Category
    if (filters.categoryId && filters.categoryId !== "ALL") {
      // Find all packages for the selected category to get their names and IDs
      const packages = await prisma.package.findMany({
        where: { categoryId: filters.categoryId },
        select: { id: true, name: true },
      });

      const packageIdentifiers = [
        ...packages.map((p: any) => p.id),
        ...packages.map((p: any) => p.name),
      ];

      where.bookings = {
        some: {
          packageType: {
            in: packageIdentifiers,
          },
        },
      };
    }

    // 3. Filter by Booking Status/Presence (hasBookings)
    if (filters.hasBookings === "HAS_BOOKINGS") {
      where.bookings = {
        some: {},
      };
    } else if (filters.hasBookings === "NO_BOOKINGS") {
      where.bookings = {
        none: {},
      };
    }

    return prisma.client.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        bookings: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        bookings: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.client.findUnique({
      where: { email },
    });
  }

  async create(data: {
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    instagram?: string | null;
  }) {
    return prisma.client.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      fullName?: string;
      email?: string;
      phoneNumber?: string | null;
      instagram?: string | null;
    }
  ) {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  }
}

export const customerRepository = new CustomerRepository();
