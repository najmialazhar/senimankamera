import { prisma } from "@/src/infrastructure/prisma/client";
import { AdminRole, AdminProfile } from "@prisma/client";

export class AdminProfileRepository {
  async findAll(): Promise<AdminProfile[]> {
    return prisma.adminProfile.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findBySupabaseId(supabaseId: string): Promise<AdminProfile | null> {
    return prisma.adminProfile.findUnique({
      where: { supabaseId },
    });
  }

  async findByEmail(email: string): Promise<AdminProfile | null> {
    return prisma.adminProfile.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<AdminProfile | null> {
    return prisma.adminProfile.findUnique({
      where: { username },
    });
  }

  async findByUsernameOrEmail(input: string): Promise<AdminProfile | null> {
    // If it looks like an email, search by email. Otherwise by username.
    const isEmail = input.includes("@");
    if (isEmail) {
      return this.findByEmail(input);
    }
    return this.findByUsername(input);
  }

  async create(data: {
    supabaseId: string;
    name: string;
    email: string;
    username: string;
    role: AdminRole;
    isActive?: boolean;
  }): Promise<AdminProfile> {
    return prisma.adminProfile.create({
      data: {
        supabaseId: data.supabaseId,
        name: data.name,
        email: data.email,
        username: data.username,
        role: data.role,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateRole(id: string, role: AdminRole): Promise<AdminProfile> {
    return prisma.adminProfile.update({
      where: { id },
      data: { role },
    });
  }

  async setActive(id: string, isActive: boolean): Promise<AdminProfile> {
    return prisma.adminProfile.update({
      where: { id },
      data: { isActive },
    });
  }
}

export const adminProfileRepository = new AdminProfileRepository();
