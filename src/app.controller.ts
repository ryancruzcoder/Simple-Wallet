import { Body, Controller, Get, Param, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { AuthGuard } from './auth/auth.guard';
import { AuthGuardADM } from './auth/auth-adm.guard';
import { UserService } from './user/user.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService
  ) {}


  /**
   * Rota GET para página de login.
   * @returns Renderiza a visualização 'index' com um objeto vazio
   */
  @Get('/login')
  @Render('index') 
  index() {
    return {}
  }

  /**
   * Rota GET para página de criação de conta.
   * @returns Renderiza a visualização 'createAccount' com um objeto vazio
   */
  @Get('/register')
  @Render('createAccount')
  createAccount() {
    return {}
  }

  /**
   * Rota GET para tela inicial de usuário autenticados.
   * Protegida com AuthGuard que permite somente usuários com cookies salvos e válidos.
   * 
   * @param res - Resposta HTTP usada para renderizar a visualização. 
   * @param req - Requisição HTTP que contém o 'payload' do usuário.
   * @returns - Renderiza a visualização 'homeDefault' com os dados do usuário
   */
  @Get()
  @UseGuards(AuthGuard)
  async homeDefault(@Res() res: Response, @Req() req: Request ): Promise<void> {
    try {
      const user = await this.userService.findByEmail(req['user'].email)
      return res.render('homeDefault', { user })
    } catch(err) {
      // Caso ocorra algum erro interno, limparemos os cookies para forçar o login e sincronizar os dados.
      return res.redirect('/exit')
    }
  }

  /**
   * Rota GET para limpar os cookies salvos do usuário.
   * 
   * @param res - Resposta HTTP usada para renderizar a visualização. 
   * @returns - Redireciona o usuário para a visualização de login
   */
  @Get('/exit')
  exit(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: false, // true => Quando estiver em produção HTTPS
    })
    return res.redirect('/')
  }

  /**
   * Rota GET para renderizar a página administrativa.
   * Protegida com AuthGuardADM que permite somente usuários autenticados e de type = 1.
   *  
   * @param res - Resposta HTTP usada para renderizar a visualização. 
   * @param req - Requisição HTTP que contém o 'payload' do usuário.
   * @returns A visualização 'homeAdm' com todos as contas pendentes para a aprovação e os dados do usuário.
   */
  @Get('/adm')
  @UseGuards(AuthGuardADM)
  async adm(@Res() res: Response, @Req() req: Request) {
    try {
      const user = await this.userService.findByEmail(req['user'].email)
      const allUsers = await this.userService.findAllUsersPendents()
      return res.render('homeAdm', {
        allUsers,
        user
      })
    } catch(err) {
      // Caso ocorra algum erro interno, limparemos os cookies para forçar o login e sincronizar os dados.
      return res.redirect('/exit')
    }
  }
}
