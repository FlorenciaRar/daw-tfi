import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CrearPreguntaDTO } from './crear-pregunta-dto';

export class ModificarEncuestaDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nombre?: string;

  @ApiProperty({ type: [CrearPreguntaDTO] })
  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearPreguntaDTO)
  preguntas?: CrearPreguntaDTO[];
}
