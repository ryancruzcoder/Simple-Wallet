import { Document } from 'mongoose'

/**
 * Definindo a interface de retorno das requisições MongoDB. Explicação sobre os campos => ./wallet.schema.ts
 */

export interface WalletInterface extends Document {
    type: string;
    from_who: string;
    from_who_document: string;
    to_who: string;
    to_who_document: string;
    date: string;
    value: number;
    _id: string;
    __v: number;
}
