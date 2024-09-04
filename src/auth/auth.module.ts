import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.registerAsync({
    global: true,
    imports: [], 
    useFactory: async (configService: ConfigService) => ({
      // Configuração do JWT.
      secret: configService.get<string>('JWT_SECRET_KEY'), // Chave secreta usada para validar os tokens.
      signOptions: { expiresIn: +configService.get<string>('JWT_EXPIRES_IN')} // Tempo de expiração do token.
    }),
    inject: [ConfigService] // Injeta o ConfigService para acessar variáveis de configuração.
  }), UserModule], // Importa o módulo de usuário.
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
