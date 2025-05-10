import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Encuesta } from '../entities/encuesta.entity';
import { Repository } from 'typeorm';
import { TipoCodigoEnum } from '../enums/tipo-codigo.enum';
import { CrearEncuestaDTO } from '../dtos/crear-encuesta-dto';
import { v4 } from 'uuid';
import { BuscarEncuestaDTO } from '../dtos/buscar-encuesta-dto';
import { ModificarEncuestaDTO } from '../dtos/modificar-encuesta-dto';

@Injectable()
export class EncuestasService {
  constructor(
    @InjectRepository(Encuesta)
    private encuestasRepository: Repository<Encuesta>,
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
    await this.buscarEncuesta(
      id,
      dtoBuscarEncuesta.codigo,
      dtoBuscarEncuesta.tipo,
    );

    await this.encuestasRepository.update(id, dtoModificarEncuesta);

    return { id }; // Aca podria devolver el affected rows maybe?
  }
}
