import { NextRequest, NextResponse } from 'next/server';

import crypto from 'node:crypto';

const serverSentEventIds = new Set<string>();

function sha256Hex(value: string) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizePhone(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

function getCookie(req: NextRequest, name: string) {
  try {
    return req.cookies.get(name)?.value || '';
  } catch (_) {
    return '';
  }
}

function getClientIp(req: NextRequest) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const xr = req.headers.get('x-real-ip');
  if (xr) return xr;
  return '';
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, reason: 'missing_webhook_url' }, { status: 500 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch (_) {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 });
  }

  const event_id = typeof body?.event_id === 'string' ? body.event_id : '';
  const event_source_url = typeof body?.event_source_url === 'string' ? body.event_source_url : '';
  const cidade = typeof body?.cidade === 'string' ? body.cidade.trim() : '';
  const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
  const telefoneRaw = typeof body?.telefone === 'string' ? body.telefone : '';

  if (!event_id || !cidade || !telefoneRaw) {
    return NextResponse.json({ ok: false, reason: 'missing_fields' }, { status: 400 });
  }

  if (serverSentEventIds.has(event_id)) {
    return NextResponse.json({ ok: true, deduped: true }, { status: 200 });
  }

  const telefone_normalizado = normalizePhone(telefoneRaw);
  const ph = sha256Hex(telefone_normalizado);
  const fn = nome ? sha256Hex(nome) : '';

  const fbp = getCookie(req, '_fbp');
  const fbc = getCookie(req, '_fbc');
  const user_agent = req.headers.get('user-agent') || '';
  const client_ip = getClientIp(req);

  const external_id = body?.external_id && typeof body.external_id === 'string' ? body.external_id : '';

  const payload = {
    event_name: 'Contact',
    event_id,
    action_source: 'website',
    event_time: Math.floor(Date.now() / 1000),
    event_source_url,
    user_data: {
      ph: ph || undefined,
      fn: fn || undefined,
      client_ip_address: client_ip || undefined,
      client_user_agent: user_agent || undefined,
      fbc: fbc || undefined,
      fbp: fbp || undefined,
      external_id: external_id || undefined,
    },
    custom_data: {
      mensagem: body?.mensagem && typeof body.mensagem === 'string' ? body.mensagem : undefined,
      cidade,
      canal: 'whatsapp',
      telefone_normalizado,
    },
    source: 'web',
  };

  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    return NextResponse.json({ ok: false, reason: 'n8n', status: resp.status, body: text }, { status: 502 });
  }

  serverSentEventIds.add(event_id);

  return NextResponse.json({ ok: true }, { status: 200 });
}
