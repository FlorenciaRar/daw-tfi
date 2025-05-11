import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuesta } from '../entities/encuesta.entity';
import { Repository } from 'typeorm';
import { TipoCodigoEnum } from '../enums/tipo-codigo.enum';
import { CrearEncuestaDTO } from '../dtos/crear-encuesta-dto';
import { v4 } from 'uuid';
import { BuscarEncuestaDTO } from '../dtos/buscar-encuesta-dto';
import { ModificarEncuestaDTO } from '../dtos/modificar-encuesta-dto';
import { Pregunta } from '../entities/pregunta.entity';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';

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
      .where('encuesta.id = :id', { id });

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
    const encuestaEncontrada = await this.buscarEncuesta(
      id,
      dtoBuscarEncuesta.codigo,
      dtoBuscarEncuesta.tipo,
    );

    switch (encuestaEncontrada.estado) {
      case TipoEstadoEnum.BORRADOR:
        await this.encuestasRepository.update(id, {
          nombre: dtoModificarEncuesta.nombre,
          estado: dtoModificarEncuesta.estado,
        });

        if (dtoModificarEncuesta.estado !== TipoEstadoEnum.PUBLICADO) {
          throw new BadRequestException(
            'Solo podes publicar una encuesta en estado borrador',
          );
        }

        if (
          dtoModificarEncuesta.preguntas &&
          dtoModificarEncuesta.preguntas?.length > 0
        ) {
          // Validar que cumpla con el dto crear pregunta FALTA
          const nuevas = dtoModificarEncuesta.preguntas.filter((p) => !p.id);

          // Validar que la pregunta exista en la encuesta FALTA
          const existentes = dtoModificarEncuesta.preguntas.filter((p) => p.id);

          if (nuevas.length > 0) {
            await this.preguntasRepository.insert(
              nuevas.map((p) => ({ ...p, encuesta: { id } })),
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
        break;

      case TipoEstadoEnum.PUBLICADO:
        if (dtoModificarEncuesta.estado !== TipoEstadoEnum.CERRADO) {
          throw new BadRequestException(
            'Solo se puede modificar el estado a CERRADO en una encuesta publicada',
          );
        }

        await this.encuestasRepository.update(id, {
          estado: TipoEstadoEnum.CERRADO,
        });

        break;

      case TipoEstadoEnum.CERRADO:
        if (dtoModificarEncuesta.estado !== TipoEstadoEnum.PUBLICADO) {
          throw new BadRequestException(
            'Solo se puede modificar el estado a PUBLICADO en una encuesta cerrada',
          );
        }

        await this.encuestasRepository.update(id, {
          estado: TipoEstadoEnum.PUBLICADO,
        });

        break;
    }

    return { id }; // Aca podria devolver el affected rows maybe?
  }
}
