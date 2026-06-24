import { customerRepository } from "../repositories/customer.repository";
import { CreateCustomerInput, CreateCustomerSchema } from "../schemas/create-customer.schema";
import { ZodError } from "zod";

export class UpdateCustomerUseCase {
  async execute(id: string, input: CreateCustomerInput) {
    // 1. Validate input schema
    let validated: CreateCustomerInput;
    try {
      validated = CreateCustomerSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(error.issues[0]?.message || "Input tidak valid.");
      }
      throw error;
    }

    // 2. Check if customer exists
    const target = await customerRepository.findById(id);
    if (!target) {
      throw new Error("Pelanggan tidak ditemukan.");
    }

    // 3. Check for email uniqueness among other records
    const existing = await customerRepository.findByEmail(validated.email);
    if (existing && existing.id !== id) {
      throw new Error("Email sudah digunakan oleh pelanggan lain.");
    }

    // 4. Update customer record
    return customerRepository.update(id, {
      fullName: validated.fullName,
      email: validated.email,
      phoneNumber: validated.phoneNumber,
      instagram: validated.instagram,
    });
  }
}

export const updateCustomerUseCase = new UpdateCustomerUseCase();
