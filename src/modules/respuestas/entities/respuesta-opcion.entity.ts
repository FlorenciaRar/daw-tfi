import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Respuesta } from './respuesta.entity';
import { Opcion } from 'src/modules/encuestas/entities/opcion.entity';

@Entity({ name: 'respuestas_opciones' })
export class RespuestaOpcion {
  @PrimaryGeneratedColumn({ name: 'id_respuesta_opcion' })
  id: number;

  @ManyToOne(() => Respuesta, (respuesta) => respuesta.respuestasAbiertas)
  @JoinColumn({ name: 'id_respuesta' })
  respuesta: Respuesta;

  @ManyToOne(() => Opcion, (opcion) => opcion.respuestasOpciones)
  @JoinColumn({ name: 'id_opcion' })
  opcion: Opcion;
}
