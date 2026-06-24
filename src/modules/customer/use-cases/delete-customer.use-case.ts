import { customerRepository } from "../repositories/customer.repository";

export class DeleteCustomerUseCase {
  async execute(id: string) {
    // 1. Check if customer exists
    const target = await customerRepository.findById(id);
    if (!target) {
      throw new Error("Pelanggan tidak ditemukan.");
    }

    // 2. Protect financial and booking history from cascading delete
    if (target._count && target._count.bookings > 0) {
      throw new Error(
        "Tidak dapat menghapus pelanggan yang memiliki riwayat pesanan (booking). Silakan batalkan atau hapus pesanan terkait terlebih dahulu."
      );
    }

    // 3. Delete customer record
    return customerRepository.delete(id);
  }
}

export const deleteCustomerUseCase = new DeleteCustomerUseCase();
