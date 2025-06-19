import { Decimal } from '@prisma/client/runtime/library';

export class Coffee {
  id: string;
  name: string;
  description: string;
  price: Decimal;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: { id: string; name: string }[];
}