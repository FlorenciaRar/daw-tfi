import { RespuestaIndividualDTO } from './respuesta-individual.dto';

export class RespuestaFormularioDTO {
  formularioId: number;
  respuestas: RespuestaIndividualDTO[];
}
