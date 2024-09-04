import { Body, Controller, Get, Param, Req, Res, UseGuards, Post, ConflictException, Render } from '@nestjs/common';
import { AppService } from '../app.service';
import { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { WalletService } from './wallet.service';
import { UserService } from 'src/user/user.service';

@Controller('wallet')
export class WalletController {

    constructor( 
        private readonly walletService: WalletService,
        private readonly userService: UserService
    ) { }


    /**
     * Rota GET para acessar a visualização para realizar transações/depósitos
     * Proteção 'AuthGuard', permitindo somente usuários autenticados com cookies salvos e válidos.
     * 
     * @param type - Referente ao tipo de transação, se é 'Depósito' ou 'Transferência'
     * @param res - Resposta HTTP usada para renderizar a visualização.
     * @param req - Requisição HTTP que contém o 'payload' do usuário.
     */
    @Get('/:type')
    @UseGuards(AuthGuard)
    @Render('createMoviment')
    async moviment(@Param('type') type: string, @Res() res: Response, @Req() req: Request): Promise<{ type: string; user: object }> {
        const user = await this.userService.findByEmail(req['user'].email)
        return { type, user }
    }

    /**
     * Rota POST para o envio de transações/depósitos
     * Proteção 'AuthGuard', permitindo somente usuários autenticados com cookies salvos e válidos.
     * 
     * @param type - Referente ao tipo de transação, se é 'Depósito' ou 'Transferência'
     * @param res - Resposta HTTP usada para renderizar a visualização.
     * @param dataWallet - São os dados necessário para realização de um depósito(apenas o 'value') ou transferência('value' e 'email/cpf/cnpj')
     * @param req - Requisição HTTP que contém o 'payload' do usuário.
     * @returns - Retorna para o templates 'homeDefault' os parâmetros como o tipo de alerta para o usuário, juntamente com o aviso e dados do usuário
     */
    @Post('/:type')
    @UseGuards(AuthGuard)
    @Render('homeDefault')
    async movimentWallet(@Param('type') type: string, @Res() res: Response, @Body() dataWallet: object, @Req() req: Request): Promise<{ alertType: string; alertText: string; user: any }> {
        let alertType;
        let alertText;
        if (type === 'Depósito') {
            try {
                const value = parseFloat(dataWallet['value'])
                const response = await this.walletService.doDeposit(value, req)
                if (!response){
                    throw new ConflictException('Tivemos problemas ao realizar seu depósito. Tente novamente mais tarde!')
                }
                alertType = 'success'
                alertText = 'Depósito realizado com sucesso!'
            } catch(err) {
                const message = err.message || 'Internal Server Error (WalletController:movimentWallet)'
                alertType = 'danger'
                alertText = message
            }
        } else if (type === 'Transferência') {
            try {
                const value = parseFloat(dataWallet['value'])
                await this.walletService.toTransfer(dataWallet['to'], value, req)
                await this.userService.tradeMoney(dataWallet['to'], value, req)
                alertType = 'success'
                alertText = 'Transferência realizada com sucesso!'
            } catch(err) {
                const message = err.message || 'Internal Server Error (WalletController:movimentWallet)'
                alertType = 'danger'
                alertText = message
            }
        }
        const user = await this.userService.findByEmail(req['user'].email)
        return { alertType, alertText, user }
    }

    /**
     * Rota GET para a visualização de extrato.
     * Proteção 'AuthGuard', permitindo somente usuários autenticados com cookies salvos e válidos.
     * 
     * @param res - Resposta HTTP usada para renderizar a visualização.
     * @param req - Requisição HTTP que contém o 'payload' do usuário.
     * @returns - Renderiza a visualização 'extract' com os dados do usuário e seus alertas ou 'homeDefault' se der algum erro interno.
     */
    @UseGuards(AuthGuard)
    @Get('/extract/complet')
    async extract(@Res() res: Response, @Req() req: Request){
        const user = await this.userService.findByEmail(req['user'].email)
        try {
            const response = await this.walletService.pushExtract(req)
            const reversedResponse = [...response].reverse();
            return res.render('extract', {
                extract: reversedResponse,
                user
            })
        } catch(err) {
            return res.render('homeDefault', {
                alertType: 'danger',
                alertText: err.message || 'Internal Server Error (WalletController:extract)'
            })
        }
    }

    /**
     * Rota POST para a reversão de transação.
     * Proteção 'AuthGuard', permitindo somente usuários autenticados com cookies salvos e válidos.
     * 
     * 
     * @param id - ID da transação na qual será revertida.
     * @param res - Resposta HTTP usada para renderizar a visualização.
     * @param req - Requisição HTTP que contém o 'payload' do usuário.
     * @returns - Renderiza a visualização 'homeDefault' com os dados do usuário e seus alertas.
     */
    @UseGuards(AuthGuard)
    @Post('/revert/:id')
    async  revertTransation(@Param('id') id: string, @Res() res: Response, @Req() req: Request): Promise<void> {
        let alertType;
        let alertText;
        try {
            const response = await this.walletService.revertTransation(id)
            alertType = 'success'
            alertText = 'Transação revertida com sucesso!'
        } catch(err) {
            // Caso ocorra algum erro interno, limparemos os cookies para forçar o login e sincronizar os dados.
            const user = await this.userService.findByEmail(req['user'].email)
            alertType = 'danger'
            alertText = err.message || 'Internal Server Error (WalletController:revertTramsation)'
        }
        const user = await this.userService.findByEmail(req['user'].email)
        return res.render('homeDefault', {
            alertType,
            alertText,
            user
        })
    }

}
