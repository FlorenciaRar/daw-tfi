import { Encuesta } from 'src/modules/encuestas/entities/encuesta.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RespuestaAbierta } from './respuesta-abierta.entity';
import { RespuestaOpcion } from './respuesta-opcion.entity';

@Entity({ name: 'respuestas' })
export class Respuesta {
  @PrimaryGeneratedColumn({ name: 'id_respuesta' })
  id: number;

  @ManyToOne(() => Encuesta, (encuesta) => encuesta.respuestas)
  @JoinColumn({ name: 'id_encuesta' })
  encuesta: Encuesta;

  @OneToMany(
    () => RespuestaAbierta,
    (respuestaAbierta: RespuestaAbierta) => respuestaAbierta.respuesta,
    {
      cascade: ['insert'],
    },
  )
  respuestasAbiertas: RespuestaAbierta[];

  @OneToMany(
    () => RespuestaOpcion,
    (respuestaOpcion: RespuestaOpcion) => respuestaOpcion.respuesta,
    {
      cascade: ['insert'],
    },
  )
  respuestasOpciones: RespuestaOpcion[];
}
