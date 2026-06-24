import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { customerRepository } from "@/src/modules/customer/repositories/customer.repository";
import { CustomerManager } from "@/src/modules/customer/components/customer-manager";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  // 1. Enforce admin authentication and authorization
  await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_PESANAN]);

  // 2. Instantiate repositories
  const categoryRepo = new CategoryRepository();
  const packageRepo = new PackageRepository();

  // 3. Fetch initial data from database
  const [categories, packages, customers] = await Promise.all([
    categoryRepo.findAll(),
    packageRepo.findAll(),
    customerRepository.findAll(),
  ]);

  // 4. Serialize data objects safely for Client Component transmission
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedPackages = JSON.parse(JSON.stringify(packages));
  const serializedCustomers = JSON.parse(JSON.stringify(customers));

  return (
    <CustomerManager
      initialCustomers={serializedCustomers}
      categories={serializedCategories}
      packages={serializedPackages}
    />
  );
}
