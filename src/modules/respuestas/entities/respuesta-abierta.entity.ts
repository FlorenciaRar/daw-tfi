import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Respuesta } from './respuesta.entity';
import { Pregunta } from 'src/modules/encuestas/entities/pregunta.entity';

@Entity({ name: 'respuestas_abiertas' })
export class RespuestaAbierta {
  @PrimaryGeneratedColumn({ name: 'id_respuesta_abierta' })
  id: number;

  @Column()
  texto: string;

  @ManyToOne(() => Pregunta, (pregunta) => pregunta.respuestasAbiertas)
  @JoinColumn({ name: 'id_pregunta' })
  pregunta: Pregunta;

  @ManyToOne(() => Respuesta, (respuesta) => respuesta.respuestasAbiertas)
  @JoinColumn({ name: 'id_respuesta' })
  respuesta: Respuesta;
}
