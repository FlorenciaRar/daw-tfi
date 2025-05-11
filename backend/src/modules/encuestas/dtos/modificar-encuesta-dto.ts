import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ModificarPreguntaDTO } from './modificar-pregunta-dto';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';

export class ModificarEncuestaDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nombre?: string;

  @ApiProperty({ enum: TipoEstadoEnum })
  @IsEnum(TipoEstadoEnum)
  @IsOptional()
  @IsNotEmpty()
  estado?: TipoEstadoEnum;

  //aca deberia meter lo del estado

  @ApiProperty({ type: [ModificarPreguntaDTO] })
  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ModificarPreguntaDTO)
  preguntas?: ModificarPreguntaDTO[];
}
