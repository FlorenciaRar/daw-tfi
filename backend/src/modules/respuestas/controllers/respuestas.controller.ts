import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RespuestasService } from '../services/respuestas.service';
import { CrearRespuestaDTO } from '../dtos/crear-respuesta-dto';
import { BuscarEncuestaDTO } from 'src/modules/encuestas/dtos/buscar-encuesta-dto';

@Controller('/respuestas')
export class RespuestasController {
  constructor(private respuestasService: RespuestasService) {}

  @Get(':id')
  async obtenerResultadosEncuesta(
    @Param('id') idEncuesta: number,
    @Query() query: BuscarEncuestaDTO,
  ): Promise<any[]> {
    return await this.respuestasService.obtenerRespuestasPorEncuesta(
      idEncuesta,
      query,
    );
  }

  @Post(':id')
  async crearRespuesta(
    @Param('id') id: number,
    @Query() dtoEncuesta: BuscarEncuestaDTO,
    @Body() dtoRespuesta: CrearRespuestaDTO,
  ): Promise<any> {
    return await this.respuestasService.crearRespuesta(
      id,
      dtoEncuesta,
      dtoRespuesta,
    );
  }
}
