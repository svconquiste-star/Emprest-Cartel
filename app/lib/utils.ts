export function normalizePhone(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export function validatePhone(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function validateEmail(email: string) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function formatPhoneForDisplay(phone: string) {
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

export async function hashSHA256(value: string) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function detectDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/.test(ua)) return 'mobile';
  return 'desktop';
}

export function getOS() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'macos';
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'ios';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}
