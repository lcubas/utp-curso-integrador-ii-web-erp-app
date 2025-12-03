import type { Customer, Part, PartRequest, ServiceOrder, User, Vehicle } from "./app/generated/prisma/client";

export interface ServiceOrderWithRelations extends ServiceOrder {
  customer: Customer;
  vehicle: Vehicle;
  user: User;
  partRequests: (PartRequest & { part: Part })[];
}