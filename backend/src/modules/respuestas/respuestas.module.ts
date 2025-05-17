import { Module } from '@nestjs/common';
import { RespuestasController } from './controllers/respuestas.controller';
import { RespuestasService } from './services/respuestas.service';
import { EncuestasModule } from '../encuestas/encuestas.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Respuesta } from './entities/respuesta.entity';
import { RespuestaAbierta } from './entities/respuesta-abierta.entity';
import { RespuestaOpcion } from './entities/respuesta-opcion.entity';

@Module({
  imports: [
    EncuestasModule,
    TypeOrmModule.forFeature([Respuesta, RespuestaAbierta, RespuestaOpcion]),
  ],
  controllers: [RespuestasController],
  providers: [RespuestasService],
})
export class RespuestasModule {}
