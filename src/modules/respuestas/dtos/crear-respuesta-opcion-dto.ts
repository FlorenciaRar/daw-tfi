import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CrearRespuestaOpcionDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  idOpcion: number;
}
