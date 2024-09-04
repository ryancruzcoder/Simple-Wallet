import { Body, ConflictException, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserDTO } from 'src/user/user.dto';
import { UserInterface } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';
import { compareSync } from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly userService: UserService, // Serviço para manipular informações do usuário
        private readonly jwtService: JwtService, // Serviço para gerar e verificar tokens JWT
        private readonly configService: ConfigService // Serviço para acessar variáveis de configuração
    ) { }

    /**
     * Rota POST para autenticação de usuários (login).
     * 
     * @param user - DTO que contém as credenciais do usuário (documento e senha).
     * @param res - Resposta HTTP utilizada para renderizar visualizações e definir cookies.
     * @param req - Requisição HTTP que pode conter cookies.
     * @returns - Redireciona para a página inicial após login bem-sucedido, ou renderiza uma visualização de erro caso haja falha.
     */
    @Post('/login')
    async login(@Body() user: UserDTO, @Res() res: Response, @Req() req: Request): Promise<void> {
        try {
            const response = await this.userService.findByDocument(user.document)
            if (response) {
                if (compareSync(user.password, response.password)) {
                    // Limpa o cookie JWT existente, se presente
                    if (req.cookies.jwt) {
                        res.clearCookie('jwt', {
                            httpOnly: true,
                            secure: false
                        })
                    }
                    // Verifica o status do usuário e renderiza a visualização apropriada
                    if (response.status === 'waitingForApproval') {
                        return res.render('waitingForApproval')
                    } else if (response.status === 'blocked') {
                        return res.render('userBloked')
                    } else {
                        // Gera um novo token JWT e define-o nos cookies
                        const payload = { sub: response._id, type: response.type, email: response.email, name: response.name, document: response.document }
                        const token = this.jwtService.sign(payload)
                        res.cookie('jwt', token, {
                            httpOnly: true,
                            secure: false,
                            maxAge: this.configService.get<number>('JWT_EXPIRES_IN') * 1000
                        })
                        
                        return res.redirect(`/`)
                    }
                } else {
                    throw new ConflictException('Senha incorreta. Confira os dados e tente novamente.')
                }
            } else {
                throw new ConflictException('O documento informado não está cadastrado.')
            }
        } catch (err) {
            const message = err.message || 'Internal Server Error (AuthController:login)'
            return res.render('index', {
                alertType: 'danger',
                alertText: message
            })
        }
    }

    /**
     * Rota POST para registro de novos usuários.
     * 
     * @param user - DTO que contém os dados do novo usuário.
     * @param res - Resposta HTTP utilizada para renderizar visualizações.
     * @returns - Renderiza a visualização de espera por aprovação se o registro for bem-sucedido, ou renderiza uma visualização de erro se o documento ou e-mail já estiverem cadastrados.
     */
    @Post('/register')
    async register(@Body() user: UserDTO, @Res() res: Response): Promise<UserDTO | void> {
        try {
            // Verifica se o documento já está cadastrado
            const response = await this.userService.findByDocument(user.document)
            if (response) {
                res.render('createAccount', {
                    alertType: 'danger',
                    alertText: 'O documento informado já está cadastrado.'
                })
            } else {
                // Verifica se o e-mail já está cadastrado
                const response = await this.userService.findByEmail(user.email)
                if (response) {
                    res.render('createAccount', {
                        alertType: 'danger',
                        alertText: 'O email informado já está cadastrado.'
                    })
                } else {
                    // Cria o novo usuário e renderiza a visualização de espera por aprovação
                    const response = await this.userService.create(user)
                    return res.render('waitingForApproval')
                }
            }  
        } catch (err) {
            return res.render('createAccount', {
                alertType: 'danger',
                alertText: err.message
            })
        }
    }
}
