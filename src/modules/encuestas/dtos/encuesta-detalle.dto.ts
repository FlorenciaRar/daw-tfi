import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';
import { Pregunta } from '../entities/pregunta.entity';

export class EncuestaDetalleDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ enum: TipoEstadoEnum })
  estado: TipoEstadoEnum;

  @ApiProperty({ type: () => [Pregunta] })
  preguntas: Pregunta[];

  @ApiProperty()
  codigoRespuesta: string;

  @ApiPropertyOptional()
  codigoResultados?: string;
}
