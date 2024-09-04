import { Document } from "mongoose";

/**
 * Definindo a interface de retorno das requisições MongoDB. Explicação sobre os campos => ./user.schema.ts
 */

export interface UserInterface extends Document {
    name: string;
    document: string;
    email: string;
    password: string;
    type: number;
    current_wallet: number;
    status: string;
    _id: string;
    __v: number;
}