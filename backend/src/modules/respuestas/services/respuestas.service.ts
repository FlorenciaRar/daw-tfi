import { BadRequestException, Injectable } from '@nestjs/common';
import { CrearRespuestaDTO } from '../dtos/crear-respuesta-dto';
import { EncuestasService } from 'src/modules/encuestas/services/encuestas.service';
import { BuscarEncuestaDTO } from 'src/modules/encuestas/dtos/buscar-encuesta-dto';
import { Respuesta } from '../entities/respuesta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RespuestasService {
  constructor(
    private encuestasService: EncuestasService,
    @InjectRepository(Respuesta)
    private respuestasRepository: Repository<Respuesta>,
  ) {}

  async crearRespuesta(
    id: number,
    dtoEncuesta: BuscarEncuestaDTO,
    dtoRespuesta: CrearRespuestaDTO,
  ): Promise<any> {
    const encuesta = await this.encuestasService.buscarEncuesta(
      id,
      dtoEncuesta.codigo,
      dtoEncuesta.tipo,
    );

    // Valida que solo haya una respuesta por cada pregunta (FALTA)

    // Valida que las preguntas existan en la encuesta
    const preguntasEnEncuesta = encuesta.preguntas.map((p) => p.id);
    const preguntasEnRespuesta = dtoRespuesta.respuestasAbiertas.map(
      (ra) => ra.idPregunta,
    );
    const idsInvalidos = preguntasEnRespuesta.filter(
      (id) => !preguntasEnEncuesta.includes(id),
    );

    if (idsInvalidos.length > 0) {
      throw new BadRequestException(
        `Las preguntas [${idsInvalidos.join(', ')}] no pertenecen a la encuesta.`,
      );
    }

    // Array de respuestas abiertas con el id de la pregunta a la que esta asociada la rta
    const respuestasAbiertas = dtoRespuesta.respuestasAbiertas.map((ra) => ({
      texto: ra.texto,
      pregunta: { id: ra.idPregunta },
    }));

    // OPCIONES
    const respuestasOpciones = dtoRespuesta.respuestasOpciones.map((ro) => ({
      opcion: { id: ro.idOpcion },
    }));

    // meter las validaciones de las opciones

    const respuesta: Respuesta = this.respuestasRepository.create({
      respuestasOpciones,
      respuestasAbiertas,
      encuesta: encuesta,
    });

    const respuestaGuardada = await this.respuestasRepository.save(respuesta);

    return { id: respuestaGuardada.id };
  }
}
