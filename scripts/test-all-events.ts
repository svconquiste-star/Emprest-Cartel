import { sendToMetaPixel, trackContact, trackOnceViewContent } from '../app/utils';

type FbqCall = { args: any[] };

type FetchCall = {
  url: string;
  options?: any;
};

function assert(cond: any, msg: string) {
  if (!cond) {
    throw new Error(msg);
  }
}

async function setupBrowserMocks() {
  const fbqCalls: FbqCall[] = [];
  const fetchCalls: FetchCall[] = [];

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
      fbqCalls.push({ args });
    },
  };

  const fakeDocument: any = {
    cookie: '_fbp=fb.1.123.456; _fbc=fb.1.123.fbclid',
  };

  const fakeNavigator: any = {
    userAgent: 'Mozilla/5.0 (Test)',
  };

  Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
  Object.defineProperty(globalThis, 'document', { value: fakeDocument, configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: fakeNavigator, configurable: true });

  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (url: any, options?: any) => {
      fetchCalls.push({ url: String(url), options });
      return {
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({}),
      } as any;
    },
  });

  return {
    fbqCalls,
    fetchCalls,
    restore() {
      Object.defineProperty(globalThis, 'fetch', { value: originalFetch, configurable: true });
    },
  };
}

async function main() {
  assert(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID, 'NEXT_PUBLIC_FACEBOOK_PIXEL_ID precisa estar definido');
  assert(
    process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL,
    'NEXT_PUBLIC_N8N_WEBHOOK_URL (ou N8N_WEBHOOK_URL) precisa estar definido'
  );

  const mocks = await setupBrowserMocks();
  const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || '';

  console.log('\n--- Teste 1: ViewContent (Pixel + N8N, once-per-visitor) ---');

  await trackOnceViewContent();
  const vcPixel = mocks.fbqCalls.filter((c) => c.args[0] === 'track' && c.args[1] === 'ViewContent');
  assert(vcPixel.length === 1, `Esperado 1 ViewContent no Pixel, obtido ${vcPixel.length}`);

  const vcN8n = mocks.fetchCalls.filter((c) => {
    if (c.url !== n8nUrl) return false;
    try {
      const body = JSON.parse(c.options?.body || '{}');
      return body.event_name === 'ViewContent';
    } catch (_) {
      return false;
    }
  });
  assert(vcN8n.length === 1, `Esperado 1 ViewContent no N8N, obtido ${vcN8n.length}`);

  await trackOnceViewContent();
  const vcPixel2 = mocks.fbqCalls.filter((c) => c.args[0] === 'track' && c.args[1] === 'ViewContent');
  assert(vcPixel2.length === 1, 'ViewContent não deveria disparar 2x por visitante');

  console.log('  OK: ViewContent disparado 1x (Pixel + N8N), dedupe OK');

  console.log('\n--- Teste 2: Contact (Pixel + N8N, ao clicar WhatsApp) ---');

  await trackContact({
    phone: '31999999999',
    name: 'Teste',
    cidade: 'Belo Horizonte',
    telefone: '5531999999999',
  });

  const contactPixel = mocks.fbqCalls.filter((c) => c.args[0] === 'track' && c.args[1] === 'Contact');
  assert(contactPixel.length === 1, `Esperado 1 Contact no Pixel, obtido ${contactPixel.length}`);

  const contactN8n = mocks.fetchCalls.filter((c) => {
    if (c.url !== n8nUrl) return false;
    try {
      const body = JSON.parse(c.options?.body || '{}');
      return body.event_name === 'Contact';
    } catch (_) {
      return false;
    }
  });
  assert(contactN8n.length === 1, `Esperado 1 Contact no N8N, obtido ${contactN8n.length}`);

  console.log('  OK: Contact disparado 1x (Pixel + N8N)');

  console.log('\n--- Teste 3: Pixel envia apenas parâmetros padrão (sem custom params) ---');

  const contactPayload = contactPixel[0].args[2];
  assert(typeof contactPayload === 'object', 'Payload do Contact deveria ser um objeto');
  assert('value' in contactPayload, 'Payload deveria conter value');
  assert('currency' in contactPayload, 'Payload deveria conter currency');
  assert(!('cidade' in contactPayload), 'Payload NÃO deveria conter cidade (custom param)');
  assert(!('nome' in contactPayload), 'Payload NÃO deveria conter nome (custom param)');
  assert(!('telefone' in contactPayload), 'Payload NÃO deveria conter telefone (custom param)');
  assert(!('device_type' in contactPayload), 'Payload NÃO deveria conter device_type (custom param)');
  assert(!('os' in contactPayload), 'Payload NÃO deveria conter os (custom param)');

  console.log('  OK: Pixel payload contém apenas parâmetros padrão Meta');

  console.log('\n--- Teste 4: eventID presente em todas chamadas fbq ---');

  for (const call of mocks.fbqCalls) {
    if (call.args[0] === 'init' || call.args[0] === 'set') continue;
    const last = call.args[call.args.length - 1];
    assert(last && typeof last === 'object' && 'eventID' in last, `Chamada fbq ${call.args[0]} ${call.args[1]} sem eventID`);
  }

  console.log('  OK: Todas chamadas fbq track/trackCustom têm eventID');

  console.log('\n--- Teste 5: Advanced Matching (init com hashes) ---');

  const initCalls = mocks.fbqCalls.filter((c) => c.args[0] === 'init');
  assert(initCalls.length >= 1, 'Esperado pelo menos 1 chamada fbq init (Advanced Matching)');
  const initPayload = initCalls[0].args[2];
  assert(typeof initPayload === 'object', 'Advanced Matching payload deveria ser um objeto');

  console.log('  OK: fbq init chamado com Advanced Matching');

  console.log('\n--- Teste 6: N8N payload do Contact contém dados extras ---');

  const contactN8nBody = JSON.parse(contactN8n[0].options?.body || '{}');
  assert(contactN8nBody.cidade === 'Belo Horizonte', 'N8N Contact deveria conter cidade');
  assert(contactN8nBody.nome === 'Teste', 'N8N Contact deveria conter nome');
  assert(contactN8nBody.telefone === '5531999999999', 'N8N Contact deveria conter telefone');
  assert(contactN8nBody.client_user_agent, 'N8N Contact deveria conter client_user_agent');
  assert(contactN8nBody.ph, 'N8N Contact deveria conter ph (hash)');
  assert(contactN8nBody.fbc, 'N8N Contact deveria conter fbc');
  assert(contactN8nBody.fbp, 'N8N Contact deveria conter fbp');
  assert(contactN8nBody.external_id, 'N8N Contact deveria conter external_id');
  assert(contactN8nBody.event_source_url === 'http://localhost:3000/', 'N8N event_source_url deveria ser domain-only');

  console.log('  OK: N8N Contact payload contém dados extras + Advanced Matching');

  console.log('\n--- Teste 7: Eventos custom REMOVIDOS (conformidade Core Config) ---');

  const customEvents = mocks.fbqCalls.filter(
    (c) => c.args[0] === 'trackCustom' || ['ConversaIniciada', 'Lead', 'ValidationError', 'WhatsAppButtonClick', 'ContactError'].includes(c.args[1])
  );
  assert(customEvents.length === 0, `Esperado 0 eventos custom no Pixel, obtido ${customEvents.length}`);

  console.log('  OK: Nenhum evento custom enviado ao Pixel');

  mocks.restore();

  console.log('\n========================================');
  console.log('TODOS OS TESTES PASSARAM (Core Config Meta)');
  console.log('========================================\n');
}

main().catch((e) => {
  console.error('FAIL:', e?.message || e);
  process.exit(1);
});
