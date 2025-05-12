import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class EliminarPreguntaDTO {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  preguntas: number[];
}
