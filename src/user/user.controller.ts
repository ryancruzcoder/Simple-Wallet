import { Controller, Param, Get, Req, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    /**
     * Rota GET para aprovar a conta de um usuário pelo email.
     * 
     * @param email - Email do usuário cuja conta será aprovada.
     * @returns - Retorna `true` se a conta for aprovada com sucesso.
     * @throws ConflictException se ocorrer um erro ao aprovar a conta.
     */
    @Get('/api/approve/:email')
    async apiApproveAccount(@Param('email') email: string): Promise<boolean> {
        try {
            const response = await this.userService.approveAccount(email);
            if (response) {
                return true;
            }
        } catch (err) {
            const message = err.message || 'Internal Server Error (UserController:apiApproveAccount)';
            throw new ConflictException(message);
        }
    }

    /**
     * Rota GET para bloquear a conta de um usuário pelo email.
     * 
     * @param email - Email do usuário cuja conta será bloqueada.
     * @returns - Retorna `true` se a conta for bloqueada com sucesso.
     * @throws ConflictException se ocorrer um erro ao bloquear a conta.
     */
    @Get('/api/block/:email')
    async apiBlockAccount(@Param('email') email: string): Promise<boolean> {
        try {
            const response = await this.userService.blockAccount(email);
            if (response) {
                return true;
            }
        } catch (err) {
            const message = err.message || 'Internal Server Error (UserController:apiBlockAccount)';
            throw new ConflictException(message);
        }
    }

    /**
     * Rota GET para encontrar o nome de um usuário com base em um identificador (email ou documento).
     * 
     * @param key - Email ou documento do usuário.
     * @param req - Requisição HTTP que contém o 'payload' do usuário autenticado.
     * @returns - Nome do usuário encontrado.
     * @throws ConflictException se o usuário não for encontrado ou se ocorrer um erro ao buscar o nome.
     */
    @Get('/api/findNameKeyBen/:key')
    async findNameKeyBen(@Param('key') key: string, @Req() req: Request): Promise<string> {
        try {
            const name = await this.userService.findNameKeyBen(key, req);
            return name;
        } catch (err) {
            const message = err.message || 'Internal Server Error (UserController:findNameKeyBen)';
            throw new ConflictException(message);
        }
    }
}
