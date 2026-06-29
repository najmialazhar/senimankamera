import { redirect } from "next/navigation";
import { getBookingByIdAction } from "@/src/modules/booking/actions/get-booking-by-id.action";
import { BookingSuccessWrapper } from "@/src/modules/booking/components/booking-success-wrapper";

export const revalidate = 0; // Dynamic route

interface BookingSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.order_id;

  if (!orderId || typeof orderId !== "string") {
    redirect("/services");
  }

  const result = await getBookingByIdAction(orderId);

  return (
    <BookingSuccessWrapper
      orderId={orderId}
      initialBookingData={result.success ? result.data : undefined}
    />
  );
}
