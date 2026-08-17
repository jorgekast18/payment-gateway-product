import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CardDto {
  @ApiProperty({ example: '4242424242424242' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  cvc!: string;

  @ApiProperty({ example: '08' })
  @IsString()
  @IsNotEmpty()
  expMonth!: string;

  @ApiProperty({ example: '28' })
  @IsString()
  @IsNotEmpty()
  expYear!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  holder!: string;
}

export class PayTransactionDto {
  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card!: CardDto;
}
