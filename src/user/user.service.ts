import { ConflictException, Injectable } from '@nestjs/common';
import { UserDTO } from './user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from './user.interface';
import { hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class UserService {

    constructor(
        @InjectModel('Users') private readonly userModel: Model<UserInterface>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Cria um novo usuário com base no DTO fornecido.
     * 
     * @param user - Dados do usuário a serem criados.
     * @returns - O usuário criado.
     * @throws ConflictException se as senhas não coincidirem ou ocorrer um erro ao criar o usuário.
     */
    async create(user: UserDTO): Promise<UserInterface | void> {
        try {
            user.type = 0;
            user.status = 'waitingForApproval';
            if (user.password === user['confirm-password-register']) {
                user.password = hashSync(user.password, 10);
                delete user['confirm-password-register'];
                user.current_wallet = parseFloat('0');
                const response = this.userModel.create(user);
                return response;
            } else {
                throw new ConflictException('Senhas não são iguais. Tente novamente.');
            }
        } catch (err) {
            const message = err.message || 'Erro ao criar usuário (UserService:create)';
            throw new ConflictException(message);
        }
    }

    /**
     * Busca um usuário pelo número do documento.
     * 
     * @param document - Número do documento do usuário.
     * @returns - O usuário encontrado ou `null` se não encontrado.
     * @throws ConflictException se ocorrer um erro ao buscar o usuário.
     */
    async findByDocument(document: string): Promise<UserInterface | null> {
        try {
            const response = await this.userModel.findOne({ document: document }).exec();
            if (response) {
                return response;
            } else {
                return null;
            }
        } catch (err) {
            const message = err.message || 'Erro ao buscar usuário (UserService:findByDocument)';
            throw new ConflictException(message);
        }
    }

    /**
     * Busca um usuário pelo email.
     * 
     * @param email - Email do usuário.
     * @returns - O usuário encontrado ou `null` se não encontrado.
     * @throws ConflictException se ocorrer um erro ao buscar o usuário.
     */
    async findByEmail(email: string): Promise<UserInterface | null> {
        try {
            const response = await this.userModel.findOne({ email: email }).exec();
            if (response) {
                return response;
            } else {
                return null;
            }
        } catch (err) {
            const message = err.message || 'Erro ao buscar usuário (UserService:findByEmail)';
            throw new ConflictException(message);
        }
    }

    /**
     * Obtém todos os usuários com status 'waitingForApproval'.
     * 
     * @returns - Lista de usuários pendentes de aprovação.
     */
    async findAllUsersPendents() {
        const allUsers = await this.userModel.find({ status: 'waitingForApproval' }).exec();
        return allUsers;
    }

    /**
     * Aprova a conta de um usuário pelo email.
     * 
     * @param email - Email do usuário a ser aprovado.
     * @returns - Retorna `true` se a conta for aprovada.
     * @throws ConflictException se nenhum usuário for encontrado ou se ocorrer um erro ao atualizar o status.
     */
    async approveAccount(email: string): Promise<boolean> {
        try {
            const response = await this.userModel.updateOne(
                { email: email },
                { $set: { status: 'approved' } }
            );

            if (response.modifiedCount > 0) {
                return true;
            } else {
                throw new ConflictException('Nenhum usuário encontrado ou status já atualizado.');
            }
        } catch (err) {
            throw new ConflictException('Erro ao atualizar o status.');
        }
    }

    /**
     * Bloqueia a conta de um usuário pelo email.
     * 
     * @param email - Email do usuário a ser bloqueado.
     * @returns - Retorna `true` se a conta for bloqueada.
     * @throws ConflictException se nenhum usuário for encontrado ou se ocorrer um erro ao atualizar o status.
     */
    async blockAccount(email: string): Promise<boolean> {
        try {
            const response = await this.userModel.updateOne(
                { email: email },
                { $set: { status: 'blocked' } }
            );

            if (response.modifiedCount > 0) {
                return true;
            } else {
                throw new ConflictException('Nenhum usuário encontrado ou status já atualizado.');
            }
        } catch (err) {
            throw new ConflictException('Erro ao atualizar o status.');
        }
    }

    /**
     * Realiza um depósito na conta do usuário.
     * 
     * @param email - Email do usuário onde o depósito será realizado.
     * @param value - Valor do depósito.
     * @returns - Retorna `true` se o depósito for realizado com sucesso.
     * @throws ConflictException se ocorrer um erro ao realizar o depósito.
     */
    async doDeposit(email: string, value: number): Promise<boolean | void> {
        try {
            await this.userModel.updateOne({ email: email }, { $inc: { current_wallet: value } });
            return true;
        } catch (err) {
            throw new ConflictException('Erro ao realizar o depósito em sua carteira.');
        }
    }

    /**
     * Obtém o nome de um usuário com base em um identificador (email ou documento).
     * 
     * @param key - Email ou documento do usuário.
     * @param request - Requisição HTTP que contém o 'payload' do usuário autenticado.
     * @returns - Nome do usuário encontrado.
     * @throws ConflictException se o usuário não for encontrado, ou se tentar transferir para a própria conta, ou se o identificador for inválido.
     */
    async findNameKeyBen(key: string, request: Request): Promise<string> {
        try {
            let userByKey = await this.userModel.findOne({ $or: [
                { email: key },
                { document: key }
            ] }).exec();

            if (!userByKey) {
                throw new ConflictException('Usuário não encontrado.');
            }

            const token = request.cookies.jwt;
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') });

            if (userByKey.name === payload.name) {
                throw new ConflictException('Não é permitido realizar uma transferência para a própria conta.');
            } else if (userByKey.type === 1) {
                throw new ConflictException('E-mail ou CPF/CNPJ informado é inválido.');
            }
            return userByKey.name;
        } catch (err) {
            const message = err.message || 'Internal Server Error (UserService:findNameKeyBen)';
            throw new ConflictException(message);
        }
    }

    /**
     * Realiza a troca de dinheiro entre usuários.
     * 
     * @param to - Identificador do destinatário (email ou documento).
     * @param value - Valor da troca.
     * @param request - Requisição HTTP que contém o 'payload' do usuário autenticado.
     * @returns - Nenhum retorno.
     * @throws ConflictException se ocorrer um erro ao realizar a troca de dinheiro.
     */
    async tradeMoney(to: string, value: number, request: Request): Promise<UserInterface> {
        try {
            const response = await this.userModel.findOne({ $or: [
                { email: to },
                { document: to }
            ] });

            const token = request.cookies.jwt;
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') });

            await this.userModel.updateOne({ email: payload.email }, { $inc: { current_wallet: -value } }).exec();
            await this.userModel.updateOne({ name: response['name'] }, { $inc: { current_wallet: value } }).exec();
        } catch (err) {
            const message = err.message || 'Internal Server Error (UserService:tradeMoney)';
            throw new ConflictException(message);
        }

        return;
    }

    /**
     * Busca um usuário pelo email ou documento.
     * 
     * @param key - Email ou documento do usuário.
     * @returns - O usuário encontrado.
     */
    async findByEmailorDocument(key: string): Promise<UserInterface> {
        const response = await this.userModel.findOne({ $or: [
            { email: key },
            { document: key }
        ] });
        return response;
    }
}
