import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Response } from 'express';
import { BuscarEncuestaDTO } from '../encuestas/dtos/buscar-encuesta-dto';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // Ruta para generar el reporte CSV de una encuesta específica
  @Get('csv/:idEncuesta')
  async descargarCsv(
    @Param('idEncuesta') idEncuesta: number,
    @Query() dto: BuscarEncuestaDTO,
    @Res() res: Response,
  ) {
    // Uso try catch porque al necesitar que el csv se descargue, tengo que manejar la respuesta.
    // Por eso el decorador @Res y el try catch. ya que no se van a manejar errores automaticamente por nest
    //sino de manera manual
    try {
      const csv = await this.reportesService.generarReporteCSV(
        idEncuesta,
        dto.codigo,
        dto.tipo,
      );

      // Enviar CSV directamente
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="respuestas_encuesta_${idEncuesta}.csv"`,
      );
      res.send(csv);
    } catch (error) {
      console.error('Error al generar reporte CSV:', error);
      // Si el error es de tipo "Error" lanzado por el servicio, pasamos el mensaje original
      res.status(500).send(error.message || 'Error al generar el reporte');
    }
  }
}
