import { Module } from '@nestjs/common';
import { EncuestasController } from './controllers/encuestas.controller';
import { EncuestasService } from './services/encuestas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encuesta } from './entities/encuesta.entity';
import { Opcion } from './entities/opcion.entity';
import { Pregunta } from './entities/pregunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Encuesta, Opcion, Pregunta])],
  controllers: [EncuestasController],
  providers: [EncuestasService],
  exports: [EncuestasService],
})
export class EncuestasModule {}
