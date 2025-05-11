import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CrearRespuestaAbiertaDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  texto: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  idPregunta: number;
}
