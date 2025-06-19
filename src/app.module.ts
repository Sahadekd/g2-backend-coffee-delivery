import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CoffeesModule } from './coffees/coffees.module';
import { TagsModule } from './tags/tags.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    PrismaModule,
    CoffeesModule,
    TagsModule,
    CartModule,
  ],
})
export class AppModule {}
