import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuesta } from '../entities/encuesta.entity';
import { Repository, UpdateResult } from 'typeorm';
import { TipoCodigoEnum } from '../enums/tipo-codigo.enum';
import { CrearEncuestaDTO } from '../dtos/crear-encuesta-dto';
import { v4 } from 'uuid';
import { BuscarEncuestaDTO } from '../dtos/buscar-encuesta-dto';
import { ModificarEncuestaDTO } from '../dtos/modificar-encuesta-dto';
import { Pregunta } from '../entities/pregunta.entity';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';
import { EliminarPreguntaDTO } from '../dtos/eliminar-pregunta-dto';

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
  ): Promise<Encuesta> {
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

    return encuesta;
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

  async modificarEncuesta(
    id: number,
    dtoBuscarEncuesta: BuscarEncuestaDTO,
    dtoModificarEncuesta: ModificarEncuestaDTO,
  ): Promise<{ id: number }> {
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
    await this.encuestasRepository.update(id, {
      nombre: dtoModificarEncuesta.nombre,
    });

    if (
      dtoModificarEncuesta.preguntas &&
      dtoModificarEncuesta.preguntas?.length > 0
    ) {
      // Validar que cumpla con el dto crear pregunta FALTA
      const nuevas = dtoModificarEncuesta.preguntas.filter((p) => !p.id);

      // Valida que la pregunta exista en la encuesta
      const existentes = dtoModificarEncuesta.preguntas.filter((p) => p.id);

      const preguntasEnEncuesta = encuestaEncontrada.preguntas.map((p) => p.id);

      const idsInvalidos = existentes
        .map((p) => p.id)
        .filter((id) => !preguntasEnEncuesta.includes(id));

      if (idsInvalidos.length > 0) {
        throw new BadRequestException(
          'Se quieren modificar preguntas que no pertenecen a la encuesta',
        );
      }

      if (nuevas.length > 0) {
        await this.preguntasRepository.insert(
          nuevas.map((p) => ({ ...p, encuesta: { id } })),
          // Falta que contemple las opciones
        );
      }

      if (existentes.length > 0) {
        await Promise.all(
          existentes.map((p) =>
            this.preguntasRepository.update(p.id, {
              ...p,
              encuesta: { id },
            }),
          ),
        );
      }
    }

    return { id }; // Aca podria devolver el affected rows maybe?
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
