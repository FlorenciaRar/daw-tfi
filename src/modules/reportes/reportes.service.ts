import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Respuesta } from 'src/modules/respuestas/entities/respuesta.entity';
import { Encuesta } from '../encuestas/entities/encuesta.entity';
import { TipoCodigoEnum } from '../encuestas/enums/tipo-codigo.enum';
import { unparse } from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Respuesta)
    private readonly respuestaRepository: Repository<Respuesta>,
    @InjectRepository(Encuesta)
    private readonly encuestaRepository: Repository<Encuesta>,
  ) {}

  async generarReporteCSV(
    idEncuesta: number,
    codigo: string,
    tipo: TipoCodigoEnum,
  ): Promise<string> {
    if (tipo !== TipoCodigoEnum.RESULTADOS) {
      throw new BadRequestException(
        'Tipo de código inválido para acceder a los resultados',
      );
    }

    const encuesta = await this.encuestaRepository.findOne({
      where: { id: idEncuesta },
    });

    if (!encuesta) {
      throw new NotFoundException('Encuesta no encontrada');
    }

    if (encuesta.codigoResultados !== codigo) {
      throw new BadRequestException(
        'Código de acceso inválido para esta encuesta',
      );
    }

    const respuestas = await this.respuestaRepository.find({
      where: { encuesta: { id: idEncuesta } },
      relations: [
        'encuesta',
        'respuestasAbiertas',
        'respuestasAbiertas.pregunta',
        'respuestasOpciones',
        'respuestasOpciones.opcion',
        'respuestasOpciones.opcion.pregunta',
      ],
    });

    if (!respuestas || respuestas.length === 0) {
      throw new BadRequestException(
        'La encuesta no tiene respuestas registradas',
      );
    }

    const datos = respuestas.flatMap((respuesta) => {
      const nombreEncuesta = respuesta.encuesta?.nombre ?? 'Sin nombre';

      const abiertas =
        respuesta.respuestasAbiertas?.map((ra) => ({
          encuesta: nombreEncuesta,
          pregunta: ra.pregunta?.texto ?? 'Sin pregunta',
          tipo: 'Abierta',
          respuesta: ra.texto,
        })) ?? [];

      const opciones =
        respuesta.respuestasOpciones?.map((ro) => ({
          encuesta: nombreEncuesta,
          pregunta: ro.opcion?.pregunta?.texto ?? 'Sin pregunta',
          tipo: 'Opción',
          respuesta: ro.opcion?.texto ?? 'Sin respuesta',
        })) ?? [];

      return [...abiertas, ...opciones];
    });

    if (datos.length === 0) {
      throw new BadRequestException(
        'No hay datos válidos para generar el reporte',
      );
    }

    try {
      const csv = unparse(datos, { header: true });

      return csv;
    } catch (error) {
      console.error('Error al generar el CSV:', error);
      throw new InternalServerErrorException(
        'Hubo un problema al generar el reporte',
      );
    }
  }
}
