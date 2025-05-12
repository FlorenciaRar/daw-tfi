import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EncuestasService } from '../services/encuestas.service';
import { Encuesta } from '../entities/encuesta.entity';
import { BuscarEncuestaDTO } from '../dtos/buscar-encuesta-dto';
import { CrearEncuestaDTO } from '../dtos/crear-encuesta-dto';
import { ModificarEncuestaDTO } from '../dtos/modificar-encuesta-dto';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';
import { EliminarPreguntaDTO } from '../dtos/eliminar-pregunta-dto';

@Controller('/encuestas')
export class EncuestasController {
  constructor(private encuestasService: EncuestasService) {}

  @Get(':id')
  async buscarEncuesta(
    @Param('id') id: number,
    @Query() dto: BuscarEncuestaDTO,
  ): Promise<Encuesta> {
    return await this.encuestasService.buscarEncuesta(id, dto.codigo, dto.tipo);
  }

  @Post()
  async crearEncuesta(@Body() dto: CrearEncuestaDTO): Promise<{
    id: number;
    codigoRespuesta: string;
    codigoResultados: string;
  }> {
    return await this.encuestasService.crearEncuesta(dto);
  }

  @Patch(':id')
  async modificarEncuesta(
    @Param('id') id: number,
    @Query() dtoBuscarEncuesta: BuscarEncuestaDTO,
    @Body() dtoModificarEncuesta: ModificarEncuestaDTO,
  ): Promise<{ id: number }> {
    return await this.encuestasService.modificarEncuesta(
      id,
      dtoBuscarEncuesta,
      dtoModificarEncuesta,
    );
  }

  // Voy a hacer un endpoint aparte para eliminar las preguntas
  // Ese enpoint recibe un array de ids de preguntas a eliminar, cosa de que en el front se pueda
  // borrar de a una o seleccionar y borrar por lotes
  // la eliminacion de las preguntas va a ser FISICA

  @Patch(':id/eliminar-preguntas')
  async eliminarPreguntas(
    @Param('id') id: number,
    @Query() dtoBuscarEncuesta: BuscarEncuestaDTO,
    @Body() dtoPreguntas: EliminarPreguntaDTO,
  ): Promise<any> {
    return await this.encuestasService.eliminarPreguntas(
      id,
      dtoBuscarEncuesta,
      dtoPreguntas,
    );
  }

  @Patch(':id/publicar')
  async publicarEncuesta(
    @Param('id') id: number,
    @Query() dto: BuscarEncuestaDTO,
  ): Promise<{ affected: number }> {
    return await this.encuestasService.cambiarEstado(
      id,
      dto,
      TipoEstadoEnum.PUBLICADO,
    );
  }

  @Patch(':id/cerrar')
  async cerrarEncuesta(
    @Param('id') id: number,
    @Query() dto: BuscarEncuestaDTO,
  ): Promise<{ affected: number }> {
    return await this.encuestasService.cambiarEstado(
      id,
      dto,
      TipoEstadoEnum.CERRADO,
    );
  }

  @Patch(':id/eliminar')
  async eliminarEncuesta(
    @Param('id') id: number,
    @Query() dto: BuscarEncuestaDTO,
  ): Promise<{ affected: number }> {
    return await this.encuestasService.cambiarEstado(
      id,
      dto,
      TipoEstadoEnum.ELIMINADO,
    );
  }
}
