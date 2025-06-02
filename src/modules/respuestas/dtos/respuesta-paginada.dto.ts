import { RespuestaFormularioDTO } from './respuesta-formulario.dto';

export class RespuestaPaginadaDTO {
  total: number;
  page: number;
  limit: number;
  data: RespuestaFormularioDTO[];
  message: string;
}
