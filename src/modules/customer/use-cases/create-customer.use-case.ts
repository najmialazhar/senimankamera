import { customerRepository } from "../repositories/customer.repository";
import { CreateCustomerInput, CreateCustomerSchema } from "../schemas/create-customer.schema";
import { ZodError } from "zod";

export class CreateCustomerUseCase {
  async execute(input: CreateCustomerInput) {
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

    // 2. Check if email already exists
    const existing = await customerRepository.findByEmail(validated.email);
    if (existing) {
      throw new Error("Email sudah terdaftar.");
    }

    // 3. Create customer record
    return customerRepository.create({
      fullName: validated.fullName,
      email: validated.email,
      phoneNumber: validated.phoneNumber,
      instagram: validated.instagram,
    });
  }
}

export const createCustomerUseCase = new CreateCustomerUseCase();
