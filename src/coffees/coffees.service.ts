import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const coffees = await this.prisma.coffee.findMany({
      include: { tags: { include: { tag: true } } },
    });
    return coffees.map(c => ({ ...c, tags: c.tags.map(t => t.tag) }));
  }

  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });
    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);
    return { ...coffee, tags: coffee.tags.map(t => t.tag) };
  }

  async create(dto: CreateCoffeeDto) {
    const { tagIds, ...data } = dto;
  
    // Verificar se as tags existem
    const existingTags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true },
    });
  
    const existingTagIds = existingTags.map(tag => tag.id);
  
    if (existingTagIds.length !== tagIds.length) {
      throw new NotFoundException('Uma ou mais tags não foram encontradas');
    }
  
    const coffee = await this.prisma.coffee.create({
      data: {
        ...data,
        tags: {
          create: existingTagIds.map(tagId => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
  
    return { ...coffee, tags: coffee.tags.map(t => t.tag) };
  }

  async update(id: string, dto: UpdateCoffeeDto) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);
    const { tagIds, ...data } = dto;
    const updated = await this.prisma.coffee.update({
      where: { id },
      data: {
        ...data,
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })),
          },
        }),
      },
      include: { tags: { include: { tag: true } } },
    });
    return { ...updated, tags: updated.tags.map(t => t.tag) };
  }


  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);
    await this.prisma.coffee.delete({ where: { id } });
    return { message: `Coffee with ID ${id} deleted successfully` };
  }



  async advancedSearch(params: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { name, minPrice, maxPrice, tags, startDate, endDate, page = 1, limit = 10 } = params;
    const filters: any = {};

    if (name) filters.name = { contains: name, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = minPrice;
      if (maxPrice) filters.price.lte = maxPrice;
    }
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = startDate;
      if (endDate) filters.createdAt.lte = endDate;
    }
    if (tags?.length) {
      filters.tags = {
        some: {
          tag: { name: { in: tags, mode: 'insensitive' } },
        },
      };
    }

    const skip = (page - 1) * limit;
    const [coffees, total] = await Promise.all([
      this.prisma.coffee.findMany({
        where: filters,
        skip,
        take: limit,
        include: { tags: { include: { tag: true } } },
      }),
      this.prisma.coffee.count({ where: filters }),
    ]);

    const formatted = coffees.map(c => ({ ...c, tags: c.tags.map(t => t.tag) }));
    return {
      filters: { name, minPrice, maxPrice, tags, startDate, endDate },
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
      data: formatted,
    };
  }
}
 