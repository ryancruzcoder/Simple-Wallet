import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Habilitando globalmente o ConfigModule para acessarmos o .env com maior segurança.
    MongooseModule.forRootAsync({ // Fazendo a conexão com o cluster do MongoDB.
      imports: [ConfigModule], // Certifica-se de que o ConfigModule está disponível para acessarmos a chave de conexão com o banco de dados.
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('CONNECT_KEY_DB'), // Acessa a variável CONNECT_KEY_DB.
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService], // Injeção no parâmetro 'ConfigService' na função assíncrona designada a chave 'useFactory'.
    }), 
  AuthModule, 
  UserModule, WalletModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
