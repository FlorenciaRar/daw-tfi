import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TiposRespuestaEnum } from '../enums/tipo-respuesta.enum';
import { Type } from 'class-transformer';
import { CrearOpcionDTO } from './crear-opcion-dto';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPreguntaDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  numero: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  texto: string;

  @ApiProperty({ enum: TiposRespuestaEnum })
  @IsEnum(TiposRespuestaEnum)
  @IsNotEmpty()
  tipo: TiposRespuestaEnum;

  @ApiProperty({ type: [CrearOpcionDTO], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CrearOpcionDTO)
  opciones?: CrearOpcionDTO[];
}
