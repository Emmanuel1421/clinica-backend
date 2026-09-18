/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INTEGRIDADE — Sanitização de Entrada (Input Sanitizer)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Funções utilitárias para limpar dados recebidos do Front-End antes de
 * processá-los ou persistí-los no banco de dados.
 *
 * Remove tags HTML e scripts maliciosos (XSS), espaços desnecessários e
 * caracteres de controle que poderiam comprometer a integridade dos dados.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Remove tags HTML/scripts de uma string para prevenir ataques XSS.
 * Ex: "<script>alert('hacked')</script>" → "alert('hacked')"
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Remove caracteres de controle invisíveis (exceto espaço, tab e newline).
 * Esses caracteres podem corromper dados no banco ou causar bugs visuais.
 */
export function removeControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Pipeline completo de sanitização para strings de entrada.
 * 1. Trim (remove espaços nas bordas)
 * 2. Remove tags HTML (anti-XSS)
 * 3. Remove caracteres de controle
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return removeControlChars(stripHtmlTags(input.trim()));
}

/**
 * Sanitiza todos os campos string de um objeto (1 nível de profundidade).
 * Útil para limpar todo o req.body de uma vez.
 */
export function sanitizeBody<T extends Record<string, unknown>>(body: T): T {
  const sanitized = { ...body };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key]);
    }
  }
  return sanitized;
}
