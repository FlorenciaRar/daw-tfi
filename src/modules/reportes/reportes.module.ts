import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encuesta } from '../encuestas/entities/encuesta.entity';
import { Respuesta } from '../respuestas/entities/respuesta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Encuesta, Respuesta])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
