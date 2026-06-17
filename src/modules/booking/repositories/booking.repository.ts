import { prisma } from "@/src/infrastructure/prisma/client";

export interface CreateBookingInput {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  packageType: string;
  bookingDate: Date;
  eventTime?: string;
  eventName?: string;
  eventLocation?: string;
  notes?: string;
  status?: string;
  snapToken?: string;
  snapUrl?: string;
  dpAmount?: number;
  totalAmount?: number;
  source?: string;
}

export class BookingRepository {
  async createBooking(data: CreateBookingInput) {
    // Check if client exists, otherwise create
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    });

    const status = data.status || "PendingApproval";
    const source = data.source || (data.status === "ManualBooking" ? "manual" : "website");

    // Create booking and slot in transaction
    return prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.create({
        data: {
          id: data.id,
          clientId: client.id,
          packageType: data.packageType,
          bookingDate: data.bookingDate,
          eventTime: data.eventTime,
          eventName: data.eventName,
          eventLocation: data.eventLocation,
          notes: data.notes,
          status: status,
          snapToken: data.snapToken,
          snapUrl: data.snapUrl,
          dpAmount: data.dpAmount,
          totalAmount: data.totalAmount,
          source: source,
        },
      });

      // Normalize date to noon to avoid timezone shift day changes
      const normalizedDate = new Date(data.bookingDate);
      normalizedDate.setHours(12, 0, 0, 0);

      // Create CalendarSlot
      await tx.calendarSlot.create({
        data: {
          date: normalizedDate,
          status: status,
          bookingId: booking.id,
        },
      });

      return booking;
    });
  }

  async findRecentBookings(limit: number = 10) {
    return prisma.booking.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: true,
      },
    });
  }

  async isDateBooked(date: Date): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.calendarSlot.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PendingApproval", "Approved", "ManualBooking", "ManualBlock"],
        },
      },
    });

    return count > 0;
  }

  async getBookedDates(): Promise<Date[]> {
    const slots = await prisma.calendarSlot.findMany({
      where: {
        status: {
          in: ["PendingApproval", "Approved", "ManualBooking", "ManualBlock"],
        },
      },
      select: {
        date: true,
      },
    });

    return slots.map((s: any) => s.date);
  }

  async getBookingsCalendarInfo() {
    const slots = await prisma.calendarSlot.findMany({
      where: {
        status: {
          in: ["PendingApproval", "Approved", "ManualBooking", "ManualBlock"],
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });

    return slots.map((s: any) => ({
      date: s.date.toISOString(),
      eventName: s.blockedReason || s.booking?.eventName || "Manual Block",
      clientName: s.booking?.client?.fullName || "Admin",
      status: s.status,
    }));
  }


  async findBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
  }

  async findAllBookings(filters: { status?: string; month?: number; year?: number; search?: string }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.year !== undefined || filters.month !== undefined) {
      const year = filters.year ?? new Date().getFullYear();
      let startDate: Date;
      let endDate: Date;

      if (filters.month !== undefined) {
        startDate = new Date(year, filters.month - 1, 1);
        endDate = new Date(year, filters.month, 0, 23, 59, 59, 999);
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 12, 0, 23, 59, 59, 999);
      }

      where.bookingDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (filters.search) {
      where.OR = [
        { client: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { client: { email: { contains: filters.search, mode: 'insensitive' } } },
        { client: { phoneNumber: { contains: filters.search, mode: 'insensitive' } } },
        { eventName: { contains: filters.search, mode: 'insensitive' } },
        { packageType: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.booking.findMany({
      where,
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        client: true,
      },
    });
  }

  async updateBookingStatus(id: string, status: string) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        client: true,
      },
    });
  }

  async rescheduleBooking(id: string, newDate: Date) {
    return prisma.booking.update({
      where: { id },
      data: { bookingDate: newDate },
      include: {
        client: true,
      },
    });
  }

  async getBookingStats() {
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const result = {
      total: 0,
      pendingApproval: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
      manualBooking: 0,
      manualBlock: 0,
    };

    stats.forEach((stat: any) => {
      const count = stat._count._all;
      result.total += count;
      if (stat.status === "PendingApproval") result.pendingApproval = count;
      else if (stat.status === "Approved") result.approved = count;
      else if (stat.status === "Rejected") result.rejected = count;
      else if (stat.status === "Cancelled") result.cancelled = count;
      else if (stat.status === "Completed") result.completed = count;
      else if (stat.status === "ManualBooking") result.manualBooking = count;
      else if (stat.status === "ManualBlock") result.manualBlock = count;
    });

    return result;
  }
}

