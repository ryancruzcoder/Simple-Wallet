import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService, // Serviço para lidar com tokens JWT
    private readonly configService: ConfigService // Serviço para acessar variáveis de configuração
  ) { }

  /**
   * Método que determina se a requisição pode passar pela proteção do guard.
   * 
   * @param context - O contexto da execução, que contém detalhes da requisição e resposta HTTP.
   * @returns - Retorna verdadeiro se o token JWT for válido e o usuário não for administrador, caso contrário, retorna falso e redireciona para a página de login ou administrativa.
   */
  async canActivate(context: ExecutionContext): Promise<boolean>  {
    const request = context.switchToHttp().getRequest<Request>() 
    const response = context.switchToHttp().getResponse<Response>() 
    const token = this.getTokenHTTP(request)
    if (!token) {
      response.redirect('/login') // Redireciona para a página de login se o token não estiver presente
      return false
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') })
      request['user'] = payload 
      if (payload.type  === 1){
        response.redirect('/adm') // Redireciona para a página administrativa se o usuário for um administrador
        return false
      }
    } catch(err) {
      response.redirect('/login') // Redireciona para a página de login se a verificação do token falhar
      return false
    }
    return true // Permite o acesso se o token for válido e o usuário não for um administrador
  }

  /**
   * Obtém o token JWT dos cookies da requisição.
   * 
   * @param request - O objeto de requisição HTTP.
   * @returns - O token JWT presente nos cookies da requisição.
   */
  private getTokenHTTP(request: Request) {
    return request.cookies.jwt
  }
}
