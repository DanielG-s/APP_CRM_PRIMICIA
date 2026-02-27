import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly masterKey: Buffer;

    constructor(private configService: ConfigService) {
        const keyString = this.configService.get<string>('MASTER_ENCRYPTION_KEY');

        if (!keyString) {
            throw new InternalServerErrorException(
                'MASTER_ENCRYPTION_KEY is not defined in environment variables',
            );
        }

        // A chave precisa ter exatamente 32 bytes para o aes-256
        // Usamos sha256 para garantir que qualquer string vire uma chave de 32 bytes válida
        this.masterKey = crypto.createHash('sha256').update(keyString).digest();
    }

    /**
     * Criptografa um texto puro
     * Retorna um formato: iv:content:tag
     */
    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag().toString('hex');

        return `${iv.toString('hex')}:${encrypted}:${tag}`;
    }

    /**
     * Descriptografa um hash gerado pela função encrypt
     */
    decrypt(hash: string): string {
        try {
            const [ivHex, encryptedHex, tagHex] = hash.split(':');

            if (!ivHex || !encryptedHex || !tagHex) {
                throw new Error('Invalid hash format');
            }

            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);

            decipher.setAuthTag(tag);

            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new InternalServerErrorException('Failed to decrypt data. Key might be invalid or data is corrupted.');
        }
    }
}
