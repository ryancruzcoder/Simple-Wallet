import { Schema } from 'mongoose';

/**
 * Definindo o schema/escopo da minha collection 'Users'.
 */

export const UserSchema = new Schema({
    name: { type: String, required: true }, // Nome completo.
    document: { type: String, required: true }, // CPF ou CNPJ.
    email: { type: String, required: true }, // E-mail.
    password: { type: String, required: true }, // Senha criptografada.
    current_wallet: { type: Number, required: true }, // Valor atual na carteira.
    type: { type: Number, required: true }, // Tipo de usuário(1 ou 0).
    status: { type: String, required: true } // Conta aprovada, bloqueada ou aguardando aprovação.
})
