/**
 * Definindo a class dos usuário para as requisições MongoDB. Explicação sobre os campos => ./user.schema.ts
 */

export class UserDTO {
    name: string;
    document: string;
    email: string;
    password: string;
    type: number;
    current_wallet: number | null;
    status: string;
}
