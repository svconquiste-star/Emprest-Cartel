'use client';

import { useEffect, useMemo, useState } from 'react';

import { formatPhoneForDisplay, normalizePhone, validatePhone } from './lib/utils';
import { trackContact, trackOnceViewContent } from './utils';

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

    void trackContact({
      phone: phoneDigits,
      name: name.trim() || undefined,
      cidade: city.trim(),
      telefone: phoneNormalized || phoneDigits || undefined,
    });
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
