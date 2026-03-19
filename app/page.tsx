'use client';

import { useEffect, useMemo, useState } from 'react';

import { formatPhoneForDisplay, normalizePhone, validatePhone } from './lib/utils';
import { gerarEventId, sendToMetaPixel, sendToN8NWebhook, trackOnceViewContent } from './utils';

const WHATSAPP_PHONE = '5531975021616';

function buildWhatsAppLink(args: { name: string; city: string; phoneDigits: string }) {
  const nome = args.name ? args.name.trim() : '';
  const cidade = args.city ? args.city.trim() : '';
  const telefone = args.phoneDigits;
  const message = `Olá! Sou ${nome || '[NOME]'}. Quero fazer uma simulação de empréstimo. Moro em ${cidade || '[CIDADE]'} e meu telefone é ${telefone || '[TELEFONE]'}`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export default function Page() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const phoneDigits = useMemo(() => String(phone || '').replace(/\D/g, ''), [phone]);
  const phoneNormalized = useMemo(() => normalizePhone(phoneDigits), [phoneDigits]);
  const phoneOk = useMemo(() => validatePhone(phoneNormalized), [phoneNormalized]);

  const phoneDisplay = useMemo(() => (phoneDigits ? formatPhoneForDisplay(phoneDigits) : ''), [phoneDigits]);

  const canSubmit = Boolean(phoneOk && city.trim().length > 1);

  useEffect(() => {
    trackOnceViewContent();
  }, []);

  const onClickWhatsApp = () => {
    const link = buildWhatsAppLink({ name, city, phoneDigits: phoneDigits || '' });

    window.open(link, '_blank', 'noopener,noreferrer');

    const event_source_url = window.location.href;
    const baseN8n = {
      timestamp: new Date().toISOString(),
      source: 'web',
      event_source_url,
      cidade: city.trim(),
      nome: name.trim() || undefined,
      telefone: phoneNormalized || phoneDigits || undefined,
    };

    if (!phoneOk) {
      void sendToN8NWebhook({
        event_name: 'ValidationError',
        ...baseN8n,
        validation_errors: 'telefone',
      });
      return;
    }

    const contatoEventId = gerarEventId('Contact');

    void (async () => {
      await sendToMetaPixel({
        eventName: 'ConversaIniciada',
        pixelMethod: 'trackCustom',
        phone: phoneDigits,
        name,
        data: { cidade: city.trim() },
      });

      await sendToMetaPixel({
        eventName: 'Lead',
        pixelMethod: 'track',
        phone: phoneDigits,
        name,
        data: { cidade: city.trim() },
      });

      const apiResp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: contatoEventId,
          event_source_url,
          cidade: city.trim(),
          nome: name.trim(),
          telefone: phoneDigits,
        }),
      }).catch(() => null);

      if (!apiResp || !apiResp.ok) {
        void sendToN8NWebhook({
          event_name: 'ContactError',
          ...baseN8n,
          event_id: contatoEventId,
          error_reason: apiResp ? `http_${apiResp.status}` : 'network',
        });
        return;
      }

      await sendToMetaPixel({
        eventName: 'Contact',
        pixelMethod: 'track',
        eventId: contatoEventId,
        phone: phoneDigits,
        name,
        data: { cidade: city.trim() },
      });

      void sendToN8NWebhook({
        event_name: 'WhatsAppButtonClick',
        ...baseN8n,
        event_id: contatoEventId,
      });
    })();
  };

  return (
    <main className="container">
      <section className="card">
        <div className="badge">Simulação segura</div>
        <h1 className="h1">Fale com um especialista agora no WhatsApp</h1>
        <p className="subtitle">Preencha seus dados e receba uma simulação rápida, com atendimento humano e sigiloso.</p>

        <div className="form" role="form" aria-label="Formulário de simulação">
          <label className="label">
            Nome (opcional)
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </label>

          <label className="label">
            Telefone *
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="DD + número"
              autoComplete="tel"
              inputMode="numeric"
            />
            {!phoneOk && phoneDigits ? <div className="error">Telefone inválido. Ex: 31987654321</div> : null}
            {phoneOk && phoneDisplay ? <div className="lock">Detectado: {phoneDisplay}</div> : null}
          </label>

          <label className="label">
            Cidade que mora
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Belo Horizonte"
              autoComplete="address-level2"
            />
          </label>

          <div className="cta">
            <button className="button" type="button" onClick={onClickWhatsApp} disabled={!canSubmit}>
              CHAMAR NO WHATSAPP
            </button>
            <div className="lock">Seus dados são protegidos e usados apenas para contato e simulação.</div>
          </div>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Atendimento via WhatsApp. Todos os direitos reservados.</footer>
    </main>
  );
}
