import { Controller, Get, Param, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Response } from 'express';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // Ruta para generar el reporte CSV de una encuesta específica
  @Get('csv/:idEncuesta')
  async descargarCsv(
    @Param('idEncuesta') idEncuesta: number,
    @Res() res: Response,
  ) {
    try {
      const filePath = await this.reportesService.generarReporteCSV(idEncuesta);
      res.download(filePath, `respuestas_encuesta_${idEncuesta}.csv`, (err) => {
        if (err) {
          res.status(500).send('Error al generar el reporte');
        }
      });
    } catch (error) {
      res.status(500).send('Error al generar el reporte');
    }
  }
}
