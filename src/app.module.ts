import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { EncuestasModule } from './modules/encuestas/encuestas.module';
import { RespuestasModule } from './modules/respuestas/respuestas.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    EncuestasModule,
    RespuestasModule,
    ReportesModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      //Aca le decimos a nest que si estamos en produccion ignore el .env
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get('database.name'),
        host: configService.get('database.host'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        port: configService.get('database.port'),
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('database.logging'),
        logger: configService.get('database.logger'),
      }),
    }),
  ],
})
export class AppModule {}
