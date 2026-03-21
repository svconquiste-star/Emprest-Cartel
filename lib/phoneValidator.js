export function validatePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    return { valid: false, error: 'Telefone deve ter entre 10 e 11 dígitos (com DDD)', formatted: '' };
  }
  return { valid: true, error: '', formatted: formatPhoneDisplay(digits) };
}

export function formatPhoneDisplay(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  const cc = withCountry.slice(0, 2);
  const rest = withCountry.slice(2);
  const ddd = rest.slice(0, 2);
  const number = rest.slice(2);

  if (number.length === 9) {
    return `+${cc} (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
  }
  if (number.length === 8) {
    return `+${cc} (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }
  return `+${cc} ${rest}`;
}
