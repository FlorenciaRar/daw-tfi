import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pregunta } from './pregunta.entity';
import { Exclude } from 'class-transformer';
import { Respuesta } from 'src/modules/respuestas/entities/respuesta.entity';
import { TipoEstadoEnum } from '../enums/tipo-estado.enum';

@Entity({ name: 'encuestas' })
export class Encuesta {
  @PrimaryGeneratedColumn({ name: 'id_encuesta' })
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'enum', enum: TipoEstadoEnum })
  estado: TipoEstadoEnum;

  @OneToMany(() => Pregunta, (pregunta: Pregunta) => pregunta.encuesta, {
    cascade: ['insert'],
  })
  preguntas: Pregunta[];

  @Column({ name: 'codigo_respuesta' })
  codigoRespuesta: string;

  @Column({ name: 'codigo_resultados' })
  @Exclude()
  codigoResultados: string;

  @OneToMany(() => Respuesta, (respuesta) => respuesta.encuesta)
  respuestas: Respuesta[];
}
