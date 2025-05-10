import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ModificarPreguntaDTO } from './modificar-pregunta-dto';

export class ModificarEncuestaDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nombre?: string;

  @ApiProperty({ type: [ModificarPreguntaDTO] })
  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ModificarPreguntaDTO)
  preguntas?: ModificarPreguntaDTO[];
}
