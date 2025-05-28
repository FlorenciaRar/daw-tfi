import { BadRequestException, Injectable } from '@nestjs/common';
import { CrearRespuestaDTO } from '../dtos/crear-respuesta-dto';
import { EncuestasService } from 'src/modules/encuestas/services/encuestas.service';
import { BuscarEncuestaDTO } from 'src/modules/encuestas/dtos/buscar-encuesta-dto';
import { Respuesta } from '../entities/respuesta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoEstadoEnum } from 'src/modules/encuestas/enums/tipo-estado.enum';
import { TipoCodigoEnum } from 'src/modules/encuestas/enums/tipo-codigo.enum';
import { PaginarRespuestasDTO } from '../dtos/pagina-respuestas.dto';

@Injectable()
export class RespuestasService {
  constructor(
    private encuestasService: EncuestasService,
    @InjectRepository(Respuesta)
    private respuestasRepository: Repository<Respuesta>,
  ) {}

  async obtenerRespuestasPaginadas(dto: PaginarRespuestasDTO): Promise<{
    total: number;
    page: number;
    limit: number;
    data: Respuesta[];
    message: string;
  }> {
    const { page = 1, limit = 10 } = dto;

    const [respuestas, total] = await this.respuestasRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['encuesta'],
      order: {
        id: 'ASC',
      },
    });

    return {
      total,
      page,
      limit,
      data: respuestas,
      message:
        respuestas.length > 0
          ? 'Respuestas encontradas'
          : 'No hay más respuestas para mostrar',
    };
  }

  async obtenerRespuestasPaginadasPorEncuesta(
    idEncuesta: number,
    codigo: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    data: {
      pregunta: {
        id: number;
        texto: string;
      };
      respuesta: string;
    }[];
    message: string;
  }> {
    const encuesta = await this.encuestasService.buscarEncuesta(
      idEncuesta,
      codigo,
      TipoCodigoEnum.RESULTADOS,
    );

    if (!encuesta) {
      return {
        total: 0,
        page,
        limit,
        data: [],
        message: 'Código inválido o encuesta no encontrada',
      };
    }

    // Obtener las respuestas paginadas
    const total = await this.respuestasRepository.count({
      where: { encuesta: { id: idEncuesta } },
    });

    console.log(
      'Consulta generada para count:',
      this.respuestasRepository.createQueryBuilder().getSql(),
    );
    console.log('Total de respuestas:', total);

    const respuestas = await this.respuestasRepository.find({
      where: { encuesta: { id: idEncuesta } },
      skip: (page - 1) * limit,
      take: limit,
      relations: [
        'respuestasAbiertas',
        'respuestasAbiertas.pregunta',
        'respuestasOpciones',
        'respuestasOpciones.opcion',
        'respuestasOpciones.opcion.pregunta',
      ],
      order: { id: 'ASC' },
    });

    // Combinar respuestas abiertas y de opciones
    const data = respuestas.flatMap((respuesta) => {
      const respuestasAbiertas = respuesta.respuestasAbiertas.map((ra) => ({
        pregunta: {
          id: ra.pregunta.id,
          texto: ra.pregunta.texto,
        },
        respuesta: ra.texto,
      }));

      const respuestasOpciones = respuesta.respuestasOpciones.map((ro) => ({
        pregunta: {
          id: ro.opcion.pregunta.id,
          texto: ro.opcion.pregunta.texto,
        },
        respuesta: ro.opcion.texto,
      }));

      return [...respuestasAbiertas, ...respuestasOpciones];
    });

    // Aplicar el límite al arreglo combinado
    const limitedData = data.slice(0, limit);

    return {
      total,
      page,
      limit,
      data: limitedData,
      message:
        limitedData.length > 0
          ? 'Respuestas encontradas'
          : 'No hay más respuestas para mostrar',
    };
  }

  async obtenerRespuestasPorEncuesta(
    idEncuesta: number,
    dtoEncuesta: BuscarEncuestaDTO,
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

    const preguntasConResultados = encuesta.preguntas.map((pregunta) => {
      const respuestasAbiertas = respuestas
        .flatMap((respuesta) => respuesta.respuestasAbiertas)
        .filter((ra) => ra.pregunta.id === pregunta.id)
        .map((ra) => ({
          id: ra.id,
          texto: ra.texto,
        }));

      const respuestasOpciones = respuestas
        .flatMap((respuesta) => respuesta.respuestasOpciones)
        .filter((ro) => ro.opcion && ro.opcion.pregunta.id === pregunta.id)
        .map((ro) => ({
          id: ro.id,
          idOpcion: ro.opcion.id,
          textoOpcion: ro.opcion.texto,
        }));

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

    return {
      id: encuesta.id,
      nombre: encuesta.nombre,
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
    if (dtoEncuesta.tipo !== TipoCodigoEnum.RESPUESTA) {
      throw new BadRequestException('Datos de encuesta inválidos');
    }

    const encuesta = await this.encuestasService.buscarEncuesta(
      id,
      dtoEncuesta.codigo,
      dtoEncuesta.tipo,
    );

    if (encuesta.estado !== TipoEstadoEnum.PUBLICADO) {
      throw new BadRequestException('No se puede responder la encuesta');
    }

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

    const respuestasAbiertas =
      dtoRespuesta.respuestasAbiertas?.map((ra) => ({
        texto: ra.texto,
        pregunta: { id: ra.idPregunta },
      })) || [];

    const respuestasOpciones =
      dtoRespuesta.respuestasOpciones?.map((ro) => ({
        opcion: { id: ro.idOpcion },
      })) || [];

    const nuevaRespuesta = this.respuestasRepository.create({
      encuesta,
      respuestasAbiertas,
      respuestasOpciones,
    });

    const guardada = await this.respuestasRepository.save(nuevaRespuesta);

    return {
      id: guardada.id,
      encuesta: {
        id: encuesta.id,
        titulo: encuesta.nombre,
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
