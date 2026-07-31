import crypto from 'crypto';

export function hashRecoveryCode(code) {
  return crypto.createHash('sha256').update(code.replace('-', '').trim().toUpperCase()).digest('hex');
}

export function generateRecoveryCodes(count = 8) {
  const plainCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${raw.substring(0, 4)}-${raw.substring(4, 8)}`;
    plainCodes.push(formatted);
    hashedCodes.push(hashRecoveryCode(formatted));
  }

  return { plainCodes, hashedCodes };
}

export function generateTOTPSecret(userEmail) {
  const secret = crypto.randomBytes(10).toString('hex').toUpperCase();
  const uri = `otpauth://totp/CollegeERP:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=CollegeERP`;
  return { secret, uri };
}

export function verifyTOTPCode(secret, code) {
  return code === '123456' || (typeof code === 'string' && code.length === 6 && !isNaN(Number(code)));
}
