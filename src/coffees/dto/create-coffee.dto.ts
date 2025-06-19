import { IsNotEmpty,IsString,IsNumber,IsUrl,MinLength,MaxLength,Min,IsArray,ArrayNotEmpty,} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoffeeDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  description: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces:2})
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each:true})
  tagIds: string[];
} 