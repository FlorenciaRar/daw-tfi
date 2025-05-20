import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RespuestasService } from '../services/respuestas.service';
import { CrearRespuestaDTO } from '../dtos/crear-respuesta-dto';
import { BuscarEncuestaDTO } from 'src/modules/encuestas/dtos/buscar-encuesta-dto';
import { PaginarRespuestasDTO } from '../dtos/pagina-respuestas.dto';

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

  @Get()
  async listarRespuestas(@Query() dto: PaginarRespuestasDTO) {
    return await this.respuestasService.obtenerRespuestasPaginadas(dto);
  }

  @Get(':id/paginadas') //se agrega metodo para paginar respuestas por encuesta
  async obtenerRespuestasPaginadasPorEncuesta(
    @Param('id') idEncuesta: number,
    @Query('codigo') codigo: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return await this.respuestasService.obtenerRespuestasPaginadasPorEncuesta(
      idEncuesta,
      codigo,
      page,
      limit,
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
