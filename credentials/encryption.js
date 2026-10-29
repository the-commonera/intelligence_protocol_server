import crypto from 'crypto';
import 'dotenv/config';

const RAW_ENCRYPTION_KEY =process.env.APP_ENCRYPTION_KEY 
const ENCRYPTION_KEY = crypto.createHash('sha256').update(RAW_ENCRYPTION_KEY).digest();
const ALGORITHM = 'aes-256-gcm';


console.log(RAW_ENCRYPTION_KEY)
export function encrypt(text) {

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: authTag
  };
  
}

export function decrypt(encryptedData) {


  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    ENCRYPTION_KEY, 
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;

  
}
