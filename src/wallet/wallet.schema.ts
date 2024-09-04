import { Schema } from 'mongoose';

/**
 * Definindo o schema/escopo da minha collection 'Wallets'.
 */

export const WalletSchema = new Schema({
    type: { type: String, required: true }, // 'Depósito' ou 'Transferência'.
    from_who: { type: String, required: true }, // Nome completo do remetente.
    from_who_document: { type: String, required: true }, // CPF ou CNPJ do remetente.
    to_who: { type: String, required: true }, // Nome completo do destinatário.
    to_who_document: { type: String, required: true }, // CPF ou CNPJ do destinatário.
    date: { type: String, required: true }, // Data completa do momento da operação
    value: { type: Number, required: true }, // Valor da transação
})
