import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // Criando a aplicação com os módulos e serviços importados e presentes no ./app.module.ts no tipo de aplicação Express.

  app.use(cookieParser()) // Habilitando a utilização de cookies para salvarmos o Token JWT.
  app.use(express.json()) // Definindo o formato do corpo da requisição enviada para o Back-end.
  app.use(express.urlencoded({ extended: true })) // Estabelece o URL encoded sobre o corpo da requisição enviada para o Back-end.
  app.useStaticAssets(path.resolve(__dirname, '..', 'public', 'assets')) // Definindo o caminho para acessar os arquivos estáticos.
  app.setViewEngine('ejs') // Definindo o motor a ser utilizando para renderizar os templates.
  app.setBaseViewsDir(path.resolve(__dirname, '..', 'public', 'views')) // Definindo o caminho para acessar os templates.

  await app.listen(3000); // A aplicação será executada na porta 3000.
}

bootstrap();
