import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuardADM implements CanActivate {

  constructor(
    private readonly jwtService: JwtService, // Serviço para gerar e verificar tokens JWT
    private readonly configService: ConfigService // Serviço para acessar variáveis de configuração
  ) { }

  /**
   * Método que verifica se a solicitação pode ser ativada com base na presença e validade do token JWT e permissões de administrador.
   * 
   * @param context - Contexto de execução que contém a requisição e a resposta HTTP.
   * @returns - Retorna `true` se o token JWT for válido e o usuário for um administrador (payload.type === 1), caso contrário, retorna `false`.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const token = this.getTokenHTTP(request)
    
    if (!token) {
      // Redireciona para a página de login se não houver token
      response.redirect('/login')
      return false
    }
    
    try {
      // Verifica a validade do token JWT
      const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') })
      request['user'] = payload
      
      // Verifica se o usuário tem permissões de administrador (payload.type === 1)
      if (payload.type !== 1) {
        response.render('accessUnauth')
        return false
      }
    } catch(err) {
      // Redireciona para a página de login se o token for inválido
      response.redirect('/login')
      return false
    }
    
    // Permite a ativação se o token for válido e o usuário for um administrador
    return true
  }

  /**
   * Método auxiliar para obter o token JWT dos cookies da requisição HTTP.
   * 
   * @param request - Requisição HTTP contendo os cookies.
   * @returns - Retorna o token JWT dos cookies.
   */
  private getTokenHTTP(request: Request) {
    return request.cookies.jwt
  }
}
