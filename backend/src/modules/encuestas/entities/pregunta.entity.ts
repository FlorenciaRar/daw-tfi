import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Encuesta } from './encuesta.entity';
import { Exclude } from 'class-transformer';
import { Opcion } from './opcion.entity';
import { TiposRespuestaEnum } from '../enums/tipo-respuesta.enum';
import { RespuestaAbierta } from 'src/modules/respuestas/entities/respuesta-abierta.entity';

@Entity({ name: 'preguntas' })
export class Pregunta {
  @PrimaryGeneratedColumn({ name: 'id_pregunta' })
  id: number;

  @Column()
  numero: number;

  @Column()
  texto: string;

  @Column({ type: 'enum', enum: TiposRespuestaEnum })
  tipo: TiposRespuestaEnum;

  @ManyToOne(() => Encuesta)
  @JoinColumn({ name: 'id_encuesta' })
  @Exclude()
  encuesta: Encuesta;

  @OneToMany(() => Opcion, (opcion) => opcion.pregunta, { cascade: ['insert'] })
  opciones: Opcion[];

  @OneToMany(
    () => RespuestaAbierta,
    (respuestaAbierta) => respuestaAbierta.pregunta,
    { cascade: ['insert', 'remove'], onDelete: 'CASCADE' },
  )
  respuestasAbiertas: RespuestaAbierta[];
}
