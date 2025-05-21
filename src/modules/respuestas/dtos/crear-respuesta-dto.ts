import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CrearRespuestaAbiertaDTO } from './crear-respuesta-abierta-dto';
import { Type } from 'class-transformer';
import { CrearRespuestaOpcionDTO } from './crear-respuesta-opcion-dto';

export class CrearRespuestaDTO {
  @ApiProperty({ type: [CrearRespuestaAbiertaDTO] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearRespuestaAbiertaDTO)
  respuestasAbiertas: CrearRespuestaAbiertaDTO[];

  @ApiProperty({ type: [CrearRespuestaOpcionDTO] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearRespuestaOpcionDTO)
  respuestasOpciones: CrearRespuestaOpcionDTO[];
}
