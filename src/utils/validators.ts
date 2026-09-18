/**
 * Valida o dígito verificador do CPF.
 */
export function isValidCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]!) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9]!)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]!) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]!);
}

/**
 * Valida o dígito verificador do CNPJ.
 */
export function isValidCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  const calc = (c: string, len: number) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(c[len - i]!) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };

  return (
    calc(cleaned, 12) === parseInt(cleaned[12]!) &&
    calc(cleaned, 13) === parseInt(cleaned[13]!)
  );
}

/**
 * Valida formato de e-mail.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida telefone brasileiro:
 * - Fixo: 10 dígitos (DDD 11-99 + 8 dígitos)
 * - Celular: 11 dígitos (DDD 11-99 + 9 dígitos começando com 9)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    const ddd = parseInt(cleaned.substring(0, 2), 10);
    return ddd >= 11 && ddd <= 99;
  }
  if (cleaned.length === 11) {
    const ddd = parseInt(cleaned.substring(0, 2), 10);
    return ddd >= 11 && ddd <= 99 && cleaned[2] === '9';
  }
  return false;
}

