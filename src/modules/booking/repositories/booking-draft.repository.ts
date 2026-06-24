import { prisma } from "@/src/infrastructure/prisma/client";

export interface CreateBookingDraftInput {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  instagram?: string;
  packageType: string;
  categoryId?: string;
  bookingDate: Date;
  eventTime?: string;
  eventName?: string;
  eventLocation?: string;
  notes?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  bookingType: string;
  dpAmount?: number;
  totalAmount?: number;
  snapToken?: string;
  snapUrl?: string;
  expiresAt: Date;
}

export class BookingDraftRepository {
  async createDraft(data: CreateBookingDraftInput) {
    return prisma.bookingDraft.create({
      data: {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        instagram: data.instagram || null,
        packageType: data.packageType,
        categoryId: data.categoryId || null,
        bookingDate: data.bookingDate,
        eventTime: data.eventTime || null,
        eventName: data.eventName || null,
        eventLocation: data.eventLocation || null,
        notes: data.notes || null,
        sessionStartTime: data.sessionStartTime || null,
        sessionEndTime: data.sessionEndTime || null,
        bookingType: data.bookingType,
        dpAmount: data.dpAmount || null,
        totalAmount: data.totalAmount || null,
        snapToken: data.snapToken || null,
        snapUrl: data.snapUrl || null,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findDraftById(id: string) {
    return prisma.bookingDraft.findUnique({
      where: { id },
    });
  }

  async deleteDraft(id: string) {
    return prisma.bookingDraft.deleteMany({
      where: { id },
    });
  }

  async deleteExpiredDrafts() {
    const now = new Date();
    return prisma.bookingDraft.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
  }
}
