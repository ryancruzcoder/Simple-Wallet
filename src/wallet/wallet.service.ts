import { ConflictException, Injectable, Req } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { WalletInterface } from './wallet.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserInterface } from 'src/user/user.interface';

@Injectable()
export class WalletService {
    constructor(
        @InjectModel('Wallet') private readonly walletModel: Model<WalletInterface>, // Injetando o Model de 'Wallet' para manipulação do banco
        @InjectModel('Users') private readonly userModel: Model<UserInterface>, // Injetando o Users de 'Wallet' para manipulação do banco
        private readonly jwtService: JwtService, // Para validarmos o Token JWT
        private readonly configService: ConfigService, // Para acessarmos a secret no .env
        private readonly userService: UserService // Para manipularmos o banco de dados 'Users'
    ) { }

    /**
     * Realiza um depósito na carteira do usuário.
     * 
     * @param value - Valor do depósito a ser realizado.
     * @param req - Requisição HTTP que contém o 'payload' do usuário autenticado.
     * @returns - O documento da transação criada.
     * @throws ConflictException se ocorrer um erro ao realizar o depósito.
     */
    async doDeposit(value: number, req: Request): Promise<WalletInterface> {
        try {
            const token = req.cookies.jwt;
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') });

            const personToDeposit = await this.userService.findByEmail(payload.email);
            if (!personToDeposit) {
                throw new ConflictException('Usuário inexistente para depósito');
            }
            const now = new Date();
            const dateFormat = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

            const walletSchema = {
                type: 'Depósito',
                from_who: payload.name,
                from_who_document: payload.document,
                to_who: payload.name,
                to_who_document: payload.document,
                date: dateFormat,
                value: value,
            };

            const response = await this.walletModel.create(walletSchema);

            await this.userService.doDeposit(payload.email, value);

            return response;
        } catch (err) {
            const message = err.message || 'Internal Server Error (WalletService:doDeposit)';
            throw new ConflictException(message);
        }
    }

    /**
     * Realiza uma transferência para outro usuário.
     * 
     * @param to - Identificador do destinatário da transferência (email ou documento).
     * @param value - Valor da transferência.
     * @param request - Requisição HTTP que contém o 'payload' do usuário autenticado.
     * @returns - Nenhum retorno.
     * @throws ConflictException se ocorrer um erro ao realizar a transferência.
     */
    async toTransfer(to: string, value: number, request: Request): Promise<void> {
        try {
            const token = request.cookies.jwt;
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') });
            const from_who = payload.name;
            const from_who_document = payload.document;

            const now = new Date();
            const dateFormat = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

            const to_who_complet = await this.userService.findByEmailorDocument(to);

            const walletSchema = {
                type: 'Transferência',
                from_who: from_who,
                from_who_document: from_who_document,
                to_who: to_who_complet['name'],
                to_who_document: to_who_complet['document'],
                date: dateFormat,
                value: value,
            };

            await this.walletModel.create(walletSchema);
        } catch (err) {
            const message = err.message || 'Internal Server Error (UserService:toTransfer)';
            throw new ConflictException(message);
        }
    }

    /**
     * Obtém o extrato da carteira do usuário.
     * 
     * @param request - Requisição HTTP que contém o 'payload' do usuário autenticado.
     * @returns - Lista de transações relacionadas ao usuário.
     * @throws ConflictException se ocorrer um erro ao obter o extrato.
     */
    async pushExtract(request: Request): Promise<WalletInterface[]> {
        try {
            const token = request.cookies.jwt;
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET_KEY') });

            const response = await this.walletModel.find({
                $or: [
                    { from_who: payload.name },
                    { to_who: payload.name },
                    { to_who: payload.document },
                    { to_who: payload.email }
                ]
            }).exec();
            return response;
        } catch (err) {
            const message = err.message || 'Internal Server Error (WalletService:pushExtract)';
            throw new ConflictException(message);
        }
    }

    /**
     * Reverte uma transação existente.
     * 
     * @param id - Identificador da transação a ser revertida.
     * @returns - Retorna `true` se a reversão for bem-sucedida.
     * @throws ConflictException se ocorrer um erro ao reverter a transação.
     */
    async revertTransation(id: string): Promise<boolean> {
        try {

            const objectId = new Types.ObjectId(id);

            const transaction = await this.walletModel.findById(objectId);
            
            if (!transaction) {
                throw new ConflictException('Transação não encontrada.');
            }

            // Atualiza o campo 'date' adicionando ' (Revertida)' para identificarmos como transação revertida
            transaction.date += ' (Revertida)';
            
            await transaction.save();
            
            if (transaction.from_who_document === transaction.to_who_document && transaction.type === 'Depósito') {
                await this.userModel.updateOne({ document: transaction.from_who_document }, { $inc: { current_wallet: -transaction.value } });
            } else {
                await this.userModel.updateOne({ document: transaction.from_who_document }, { $inc: { current_wallet: transaction.value } });
                await this.userModel.updateOne({ document: transaction.to_who_document }, { $inc: { current_wallet: -transaction.value } });
            }
            return true;
        } catch (err) {
            const message = err.message || 'Internal Server Error (WalletService:revertTransation)';
            throw new ConflictException(message);
        }
    }
}
