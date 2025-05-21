import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuesta } from '../entities/encuesta.entity';
import { Not, Repository, UpdateResult } from 'typeorm';
import { TipoCodigoEnum } from '../enums/tipo-codigo.enum';
import { CrearEncuestaDTO } from '../dtos/crear-encuesta-dto';
import { v4 } from 'uuid';
import { BuscarEncuestaDTO } from '../dtos/buscar-encuesta-dto';
import { ModificarEncuestaDTO } from '../dtos/modificar-encuesta-dto';
import { Pregunta } from '../entities/pregunta.entity';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';
import { EliminarPreguntaDTO } from '../dtos/eliminar-pregunta-dto';
<<<<<<< HEAD:backend/src/modules/encuestas/services/encuestas.service.ts
import { PaginarEncuestasDTO } from '../dtos/paginar-encuestas.dto';
=======
import { EncuestaDetalleDTO } from '../dtos/encuesta-detalle.dto';
>>>>>>> main:src/modules/encuestas/services/encuestas.service.ts

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
    @InjectRepository(Pregunta)
    private preguntasRepository: Repository<Pregunta>,
  ) {}

  async buscarEncuesta(
    id: number,
    codigo: string,
    tipoCodigo: TipoCodigoEnum.RESPUESTA | TipoCodigoEnum.RESULTADOS,
  ): Promise<EncuestaDetalleDTO> {
    const query = this.encuestasRepository
      .createQueryBuilder('encuesta')
      .innerJoinAndSelect('encuesta.preguntas', 'pregunta')
      .leftJoinAndSelect('pregunta.opciones', 'preguntaOpcion')
      .where('encuesta.id = :id', { id })
      .andWhere('encuesta.estado <> :estadoEliminado', {
        estadoEliminado: TipoEstadoEnum.ELIMINADO,
      });

    switch (tipoCodigo) {
      case TipoCodigoEnum.RESPUESTA:
        query.andWhere('encuesta.codigoRespuesta = :codigo', { codigo });
        break;

      case TipoCodigoEnum.RESULTADOS:
        query.andWhere('encuesta.codigoResultados = :codigo', { codigo });
        break;
    }

    query.orderBy('pregunta.numero', 'ASC');
    query.addOrderBy('preguntaOpcion.numero', 'ASC');

    const encuesta = await query.getOne();

    if (!encuesta) {
      throw new BadRequestException('Datos de encuesta no válidos');
    }

    return {
      id: encuesta.id,
      nombre: encuesta.nombre,
      estado: encuesta.estado,
      preguntas: encuesta.preguntas,
      codigoRespuesta: encuesta.codigoRespuesta,
      codigoResultados:
        tipoCodigo === TipoCodigoEnum.RESULTADOS
          ? encuesta.codigoResultados
          : undefined, // omite si no queremos que exista
    };
  }

  async crearEncuesta(dto: CrearEncuestaDTO): Promise<{
    id: number;
    codigoRespuesta: string;
    codigoResultados: string;
  }> {
    const encuesta: Encuesta = this.encuestasRepository.create({
      ...dto,
      codigoRespuesta: v4(),
      codigoResultados: v4(),
    });

    const encuestaGuardada = await this.encuestasRepository.save(encuesta);

    return {
      id: encuestaGuardada.id,
      codigoRespuesta: encuestaGuardada.codigoRespuesta,
      codigoResultados: encuestaGuardada.codigoResultados,
    };
  }

  async obtenerEncuestasPaginadas(dto: PaginarEncuestasDTO): Promise<any> {
    const { page = 1, limit = 10 } = dto;

    console.log('Parámetros recibidos:', { page, limit });

    const [data, total] = await this.encuestasRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
      where: {
        estado: Not(TipoEstadoEnum.ELIMINADO),
      },
      relations: ['preguntas', 'preguntas.opciones'],
    });

    return {
      total,
      page,
      limit,
      data,
      message:
        data.length > 0
          ? 'Encuestas encontradas'
          : 'No hay más encuestas para mostrar',
    };
  }

  async modificarEncuesta(
    id: number,
    dtoBuscarEncuesta: BuscarEncuestaDTO,
    dtoModificarEncuesta: ModificarEncuestaDTO,
  ): Promise<{ affected: number }> {
    if (dtoBuscarEncuesta.tipo !== TipoCodigoEnum.RESULTADOS) {
      throw new BadRequestException('Datos de encuesta invalidos');
    }

    const encuestaEncontrada = await this.buscarEncuesta(
      id,
      dtoBuscarEncuesta.codigo,
      dtoBuscarEncuesta.tipo,
    );

    if (encuestaEncontrada.estado !== TipoEstadoEnum.BORRADOR) {
      throw new BadRequestException(
        'Solo podes modificar una encuesta en estado BORRADOR',
      );
    }

    if (
      dtoModificarEncuesta.preguntas &&
      dtoModificarEncuesta.preguntas.length > 0
    ) {
      const nuevas = dtoModificarEncuesta.preguntas.map((p) => ({
        ...p,
        encuesta: { id },
        opciones: p.opciones || [],
      }));

      await this.preguntasRepository.save(nuevas);
    }

    const resultado: UpdateResult = await this.encuestasRepository.update(id, {
      nombre: dtoModificarEncuesta.nombre,
    });

    return { affected: resultado.affected ?? 0 };
  }

  async eliminarPreguntas(
    id: number,
    dtoBuscarEncuesta: BuscarEncuestaDTO,
    dtoPreguntas: EliminarPreguntaDTO,
  ) {
    if (dtoBuscarEncuesta.tipo !== TipoCodigoEnum.RESULTADOS) {
      throw new BadRequestException('Datos de encuesta invalidos');
    }

    const encuestaEncontrada = await this.buscarEncuesta(
      id,
      dtoBuscarEncuesta.codigo,
      dtoBuscarEncuesta.tipo,
    );

    if (encuestaEncontrada.estado !== TipoEstadoEnum.BORRADOR) {
      throw new BadRequestException(
        'No se pueden eliminar las preguntas de una encuesta que no este en borrador',
      );
    }

    const preguntasEnEncuesta = encuestaEncontrada.preguntas.map(
      (pregunta) => pregunta.id,
    );

    const preguntasInvalidas = dtoPreguntas.preguntas.filter(
      (id) => !preguntasEnEncuesta.includes(id),
    );

    if (preguntasInvalidas.length > 0) {
      throw new BadRequestException(
        'Hay preguntas que no coinciden con las preguntas de la encuesta',
      );
    }

    await this.preguntasRepository.delete(dtoPreguntas.preguntas);

    return {
      eliminadas: dtoPreguntas.preguntas,
    };
  }

  async cambiarEstado(
    id: number,
    dtoBuscarEncuesta: BuscarEncuestaDTO,
    estado: TipoEstadoEnum,
  ): Promise<{ affected: number }> {
    if (dtoBuscarEncuesta.tipo !== TipoCodigoEnum.RESULTADOS) {
      throw new BadRequestException('Datos de encuesta invalidos');
    }
    const encuestaEncontrada = await this.buscarEncuesta(
      id,
      dtoBuscarEncuesta.codigo,
      dtoBuscarEncuesta.tipo,
    );
    switch (estado) {
      case TipoEstadoEnum.PUBLICADO:
        if (
          encuestaEncontrada.estado !== TipoEstadoEnum.BORRADOR &&
          encuestaEncontrada.estado !== TipoEstadoEnum.CERRADO
        ) {
          throw new BadRequestException('No se puede publicar la encuesta');
        }
        break;

      case TipoEstadoEnum.CERRADO:
        if (encuestaEncontrada.estado !== TipoEstadoEnum.PUBLICADO) {
          throw new BadRequestException('No se puede cerrar la encuesta');
        }
        break;

      case TipoEstadoEnum.ELIMINADO:
        break;

      default:
        throw new BadRequestException();
    }

    const resultado: UpdateResult = await this.encuestasRepository.update(id, {
      estado: estado,
    });

    return { affected: resultado.affected ?? 0 };
  }
}
