import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Respuesta } from 'src/modules/respuestas/entities/respuesta.entity';
import { Repository } from 'typeorm';
import { unparse } from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Respuesta)
    private readonly respuestaRepository: Repository<Respuesta>,
  ) {}

  async generarReporteCSV(idEncuesta: number): Promise<string> {
    // Obtener respuestas de la encuesta por el id
    const respuestas = await this.respuestaRepository.find({
      where: { encuesta: { id: idEncuesta } }, // Filtramos por ID de encuesta
      relations: [
        'encuesta',
        'respuestasAbiertas',
        'respuestasAbiertas.pregunta',
        'respuestasOpciones',
        'respuestasOpciones.opcion',
        'respuestasOpciones.opcion.pregunta',
      ],
    });
    console.log(respuestas);

    // Mapear las respuestas a un formato adecuado para CSV
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

    console.log('Datos transformados:', datos);

    try {
      const csv = unparse(datos, { header: true });
      console.log('CSV generado:', csv);

      if (!csv) {
        throw new Error('No se generó un CSV válido');
      }

      const directory = path.join(__dirname, '../../../reportes-csv');
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true }); // Crea la carpeta si no existe
      }

      const filePath = path.join(
        directory,
        `respuestas_encuesta_${idEncuesta}.csv`,
      );
      fs.writeFileSync(filePath, csv);

      return filePath;
    } catch (error) {
      console.error('Error al generar el CSV:', error);
      throw error;
    }
  }
}
