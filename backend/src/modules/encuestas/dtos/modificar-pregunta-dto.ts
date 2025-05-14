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
import { ApiProperty } from '@nestjs/swagger';
import { CrearOpcionDTO } from './crear-opcion-dto';

export class ModificarPreguntaDTO {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  numero: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  texto: string;

  @ApiProperty({ enum: TiposRespuestaEnum })
  @IsEnum(TiposRespuestaEnum)
  @IsOptional()
  @IsNotEmpty()
  tipo: TiposRespuestaEnum;

  @ApiProperty({ type: [CrearOpcionDTO], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CrearOpcionDTO)
  opciones?: CrearOpcionDTO[];
}
