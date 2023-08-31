import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || '';

async function getKey(salt: Buffer): Promise<Buffer> {
    return (await promisify(scrypt)(ENCRYPTION_SECRET_KEY, salt, 32)) as Buffer;
}

export async function encrypt(textToEncrypt: string): Promise<string> {
    const salt = randomBytes(16);
    const iv = randomBytes(16);
    const key = await getKey(salt);
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([cipher.update(textToEncrypt, 'utf8'), cipher.final()]);
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encryptedText.toString('hex')}`;
}

export async function decrypt(encryptedData: string): Promise<string> {
    const [salt, iv, encryptedText] = encryptedData.split(':').map(part => Buffer.from(part, 'hex'));
    const key = await getKey(salt);
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decryptedText.toString('utf8');
}