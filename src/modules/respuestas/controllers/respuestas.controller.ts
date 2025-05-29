import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RespuestasService } from '../services/respuestas.service';
import { CrearRespuestaDTO } from '../dtos/crear-respuesta-dto';
import { BuscarEncuestaDTO } from 'src/modules/encuestas/dtos/buscar-encuesta-dto';
import { PaginarRespuestasDTO } from '../dtos/pagina-respuestas.dto';
import { RespuestaPaginadaDTO } from '../dtos/respuesta-paginada.dto';
import { Respuesta } from '../entities/respuesta.entity';

@Controller('/respuestas')
export class RespuestasController {
  constructor(private respuestasService: RespuestasService) {}

  @Get(':id')
  async obtenerResultadosEncuesta(
    @Param('id') idEncuesta: number,
    @Query() dto: BuscarEncuestaDTO,
  ): Promise<{
    id: number;
    nombre: string;
    preguntas: {
      id: number;
      texto: string;
      tipo: string;
      respuestasAbiertas: { id: number; texto: string }[];
      respuestasOpciones: {
        id: number;
        idOpcion: number;
        textoOpcion: string;
      }[];
      totalRespuestas: number;
    }[];
  }> {
    return await this.respuestasService.obtenerRespuestasPorEncuesta(
      idEncuesta,
      dto,
    );
  }

  @Get()
  async listarRespuestas(@Query() dto: PaginarRespuestasDTO): Promise<{
    total: number;
    page: number;
    limit: number;
    data: Respuesta[];
    message: string;
  }> {
    return await this.respuestasService.obtenerRespuestasPaginadas(dto);
  }

  @Get(':id/paginadas')
  async obtenerRespuestasPaginadasPorEncuesta(
    @Param('id') idEncuesta: number,
    @Query() dto: PaginarRespuestasDTO,
  ): Promise<RespuestaPaginadaDTO> {
    const { codigo, page, limit } = dto;

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
  ): Promise<{
    id: number;
    encuesta: { id: number; titulo: string };
    respuestasAbiertas: { id: number; texto: string; idPregunta: number }[];
    respuestasOpciones: { id: number; idOpcion: number }[];
  }> {
    return await this.respuestasService.crearRespuesta(
      id,
      dtoEncuesta,
      dtoRespuesta,
    );
  }
}
