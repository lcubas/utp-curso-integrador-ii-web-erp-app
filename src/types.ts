import type {
  Appointment,
  Customer,
  Invoice,
  Part,
  PartRequest,
  Payment,
  ServiceOrder,
  User,
  Vehicle,
} from "./app/generated/prisma/client";

export interface ServiceOrderWithRelations extends ServiceOrder {
  customer: Customer;
  vehicle: Vehicle;
  user: User;
  partRequests: (PartRequest & { part: Part })[];
}

export interface InvoiceWithRelations extends Invoice {
  customer: Customer;
  payments: (Payment & { user: User })[];
}

export interface AppointmentWithRelations extends Appointment {
  customer: Customer | null;
}
