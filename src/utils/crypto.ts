import crypto from 'crypto';

export const generateUuid = () => crypto.randomBytes(16).toString('hex');
