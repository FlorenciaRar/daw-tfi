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

  async obtenerRespuestasPorEncuesta(
    idEncuesta: number,
    dtoEncuesta: BuscarEncuestaDTO,
  ): Promise<any> {
    // Validar que la encuesta exista y coincida con el código y tipo
    const encuesta = await this.encuestasService.buscarEncuesta(
      idEncuesta,
      dtoEncuesta.codigo,
      dtoEncuesta.tipo,
    );

    if (!encuesta) {
      throw new BadRequestException(
        'La encuesta no existe o los parámetros son incorrectos.',
      );
    }

    // Obtener las respuestas relacionadas con la encuesta
    const respuestas = await this.respuestasRepository.find({
      where: { encuesta: { id: idEncuesta } },
      relations: [
        'respuestasAbiertas',
        'respuestasAbiertas.pregunta',
        'respuestasOpciones',
        'respuestasOpciones.opcion',
        'respuestasOpciones.opcion.pregunta',
      ],
    });

    // Mapear las preguntas con sus respuestas y contadores
    const preguntasConResultados = encuesta.preguntas.map((pregunta) => {
      // Respuestas abiertas asociadas a esta pregunta
      const respuestasAbiertas = respuestas
        .flatMap((respuesta) => respuesta.respuestasAbiertas)
        .filter((ra) => ra.pregunta.id === pregunta.id)
        .map((ra) => ({
          id: ra.id,
          texto: ra.texto,
        }));

      // Respuestas de opciones asociadas a esta pregunta
      const respuestasOpciones = respuestas
        .flatMap((respuesta) => respuesta.respuestasOpciones)
        .filter((ro) => ro.opcion && ro.opcion.pregunta.id === pregunta.id)
        .map((ro) => ({
          id: ro.id,
          idOpcion: ro.opcion.id,
          textoOpcion: ro.opcion.texto,
        }));

      // Contador de respuestas
      const totalRespuestas =
        respuestasAbiertas.length + respuestasOpciones.length;

      return {
        id: pregunta.id,
        texto: pregunta.texto,
        tipo: pregunta.tipo,
        respuestasAbiertas,
        respuestasOpciones,
        totalRespuestas,
      };
    });

    // Retornar la encuesta con las preguntas y sus resultados
    return {
      id: encuesta.id,
      nombre: encuesta.nombre,
      // fechaCreacion: encuesta.fechaCreacion, // Asegúrate de que `fechaCreacion` exista en la entidad
      preguntas: preguntasConResultados,
    };
  }

  async crearRespuesta(
    id: number,
    dtoEncuesta: BuscarEncuestaDTO,
    dtoRespuesta: CrearRespuestaDTO,
  ): Promise<{
    id: number;
    encuesta: { id: number; titulo: string };
    respuestasAbiertas: { id: number; texto: string; idPregunta: number }[];
    respuestasOpciones: { id: number; idOpcion: number }[];
  }> {
    const encuesta = await this.encuestasService.buscarEncuesta(
      id,
      dtoEncuesta.codigo,
      dtoEncuesta.tipo,
    );

    // Validar preguntas abiertas
    const preguntasEncuesta = encuesta.preguntas.map((p) => p.id);
    const preguntasEnRespuestaAbierta =
      dtoRespuesta.respuestasAbiertas?.map((r) => r.idPregunta) || [];
    const preguntasInvalidasAbiertas = preguntasEnRespuestaAbierta.filter(
      (p) => !preguntasEncuesta.includes(p),
    );
    if (preguntasInvalidasAbiertas.length > 0) {
      throw new BadRequestException(
        `Las preguntas [${preguntasInvalidasAbiertas.join(', ')}] no pertenecen a la encuesta.`,
      );
    }

    // Validar opciones (que estén en preguntas de esta encuesta)
    const opcionesEncuesta = encuesta.preguntas.flatMap((p) =>
      p.opciones.map((o) => o.id),
    );
    const opcionesEnRespuesta =
      dtoRespuesta.respuestasOpciones?.map((ro) => ro.idOpcion) || [];
    const opcionesInvalidas = opcionesEnRespuesta.filter(
      (id) => !opcionesEncuesta.includes(id),
    );
    if (opcionesInvalidas.length > 0) {
      throw new BadRequestException(
        `Las opciones [${opcionesInvalidas.join(', ')}] no pertenecen a la encuesta.`,
      );
    }

    // Crear objetos de relaciones
    const respuestasAbiertas =
      dtoRespuesta.respuestasAbiertas?.map((ra) => ({
        texto: ra.texto,
        pregunta: { id: ra.idPregunta },
      })) || [];

    const respuestasOpciones =
      dtoRespuesta.respuestasOpciones?.map((ro) => ({
        opcion: { id: ro.idOpcion },
      })) || [];

    // Crear respuesta principal
    const nuevaRespuesta = this.respuestasRepository.create({
      encuesta,
      respuestasAbiertas,
      respuestasOpciones,
    });

    const guardada = await this.respuestasRepository.save(nuevaRespuesta);

    // Retornar más datos
    return {
      id: guardada.id,
      encuesta: {
        id: encuesta.id,
        titulo: encuesta.nombre, // Asegúrate de que `titulo` exista en el objeto `encuesta`
      },
      respuestasAbiertas: guardada.respuestasAbiertas.map((ra) => ({
        id: ra.id,
        texto: ra.texto,
        idPregunta: ra.pregunta.id,
      })),
      respuestasOpciones: guardada.respuestasOpciones.map((ro) => ({
        id: ro.id,
        idOpcion: ro.opcion.id,
      })),
    };
  }
}
