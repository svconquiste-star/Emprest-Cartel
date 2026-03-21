import { trackContact } from '../app/utils';

type FbqCall = {
  args: any[];
};

async function main() {
  const calls: FbqCall[] = [];

  const fakeWindow: any = {
    location: { href: 'http://localhost:3000/' },
    sessionStorage: {
      store: new Map<string, string>(),
      getItem(key: string) {
        return this.store.has(key) ? this.store.get(key) : null;
      },
      setItem(key: string, value: string) {
        this.store.set(key, value);
      },
    },
    localStorage: {
      store: new Map<string, string>(),
      getItem(key: string) {
        return this.store.has(key) ? this.store.get(key) : null;
      },
      setItem(key: string, value: string) {
        this.store.set(key, value);
      },
    },
    fbq: (...args: any[]) => {
      calls.push({ args });
    },
  };

  const fakeDocument: any = {
    cookie: '_fbp=fb.1.123.456; _fbc=fb.1.123.fbclid',
  };

  const fakeNavigator: any = {
    userAgent: 'Mozilla/5.0',
  };

  Object.defineProperty(globalThis, 'window', {
    value: fakeWindow,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'document', {
    value: fakeDocument,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: fakeNavigator,
    configurable: true,
  });

  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async () => ({ ok: true, status: 200, text: async () => '', json: async () => ({}) }) as any,
  });

  await trackContact({
    phone: '31999999999',
    name: 'Teste',
    cidade: 'BH',
    telefone: '5531999999999',
  });

  Object.defineProperty(globalThis, 'fetch', { value: originalFetch, configurable: true });

  const hasContact = calls.some((c) => c.args[0] === 'track' && c.args[1] === 'Contact');
  const hasEventId = calls.some((c) => {
    const last = c.args[c.args.length - 1];
    return last && typeof last === 'object' && 'eventID' in last;
  });

  if (!hasContact) {
    console.error('FAIL: Não encontrou chamada fbq track Contact');
    process.exit(1);
  }

  if (!hasEventId) {
    console.error('FAIL: Não encontrou payload com eventID na chamada fbq');
    process.exit(1);
  }

  console.log('OK: Contact enviado via fbq com eventID (Core Config)');
}

main().catch((e) => {
  console.error('FAIL:', e);
  process.exit(1);
});
