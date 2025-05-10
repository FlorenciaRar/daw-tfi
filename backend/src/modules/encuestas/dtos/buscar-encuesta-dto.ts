import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { TipoCodigoEnum } from '../enums/tipo-codigo.enum';

export class BuscarEncuestaDTO {
  @ApiProperty()
  @IsUUID('4')
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ enum: TipoCodigoEnum })
  @IsEnum(TipoCodigoEnum)
  @IsNotEmpty()
  tipo: TipoCodigoEnum;
}
