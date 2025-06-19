import { Cart as PrismaCart, CartStatus, PaymentStatus } from '@prisma/client';

export class Cart implements PrismaCart {
  id: string;
  userId: string | null;
  status: CartStatus;
  statusPayment: PaymentStatus;
  dateTimeCompleted: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
