'use client'

type DeviceType = 'mobile' | 'tablet' | 'desktop'

type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown'

type PixelPayload = Record<string, any>

type CustomData = Record<string, any>

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void
      queue?: any[]
      loaded?: boolean
      version?: string
    }
  }
}

const DEFAULT_CONTENT_TYPE = 'product'
const DEFAULT_CONTENT_ID = 'emprestimo'
const DEFAULT_CURRENCY = 'BRL'

const WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  'https://n8n.multinexo.com.br/webhook/cf2c9fdd-c5b6-4fb8-84d5-cartel'

const WEBHOOK_TIMEOUT_MS = 5000

function createEventId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'

  const ua = navigator.userAgent || ''
  const isTablet = /iPad|Tablet|Silk/i.test(ua)
  const isMobile = /Mobi|Android/i.test(ua) && !isTablet

  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'
  return 'desktop'
}

function detectOperatingSystem(): OperatingSystem {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent || ''
  if (/Windows/i.test(ua)) return 'windows'
  if (/Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return 'macos'
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Linux/i.test(ua)) return 'linux'
  return 'unknown'
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

async function sha256Hex(value: string) {
  if (typeof window === 'undefined') return ''
  if (!window.crypto?.subtle) return ''

  const bytes = new TextEncoder().encode(value)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function isValidSha256Hex(value: unknown) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value)
}

function validatePayload(eventData: Record<string, any>) {
  if (typeof eventData.event_id !== 'string' || !eventData.event_id) return false
  if (typeof eventData.event_name !== 'string' || !eventData.event_name) return false
  if (typeof eventData.timestamp !== 'number' || !Number.isFinite(eventData.timestamp)) return false

  if (eventData.hashes?.em != null && !isValidSha256Hex(eventData.hashes.em)) return false
  if (eventData.hashes?.ph != null && !isValidSha256Hex(eventData.hashes.ph)) return false

  return true
}

function sanitizeForPixel(eventData: Record<string, any>): PixelPayload {
  const out: PixelPayload = {}

  if (eventData.currency) out.currency = eventData.currency
  if (eventData.value != null) out.value = eventData.value
  if (eventData.content_type) out.content_type = eventData.content_type
  if (eventData.content_id) out.content_id = eventData.content_id
  if (eventData.cidade) out.cidade = eventData.cidade

  return out
}

class TrackingManager {
  private startedAt = Date.now()
  private sentEventIds = new Set<string>()
  private sentScrollKeys = new Set<string>()
  private scrollPercentage = 0
  private scrollListenerAttached = false

  private getTimeOnPageSeconds() {
    return Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000))
  }

  private computeScrollPercentage() {
    if (typeof window === 'undefined') return 0

    const doc = document.documentElement
    const scrollTop = window.scrollY || doc.scrollTop || 0
    const scrollHeight = doc.scrollHeight || 0
    const clientHeight = doc.clientHeight || window.innerHeight || 0
    const maxScroll = Math.max(1, scrollHeight - clientHeight)
    return Math.max(0, Math.min(100, Math.round((scrollTop / maxScroll) * 100)))
  }

  private attachScrollListenerOnce() {
    if (typeof window === 'undefined') return
    if (this.scrollListenerAttached) return

    this.scrollListenerAttached = true
    const onScroll = () => {
      this.scrollPercentage = this.computeScrollPercentage()

      const milestones = [25, 50, 75, 100]
      for (const m of milestones) {
        if (this.scrollPercentage >= m) {
          const key = `scroll_${m}`
          if (!this.sentScrollKeys.has(key)) {
            this.sentScrollKeys.add(key)
            void this.trackEvent('ScrollMilestone', { scroll_percentage: m })
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

  async trackEvent(eventName: string, customData: CustomData = {}) {
    if (typeof window === 'undefined') return

    this.attachScrollListenerOnce()

    const event_id = createEventId()
    if (this.sentEventIds.has(event_id)) return

    const now = Date.now()

    const email = typeof customData.email === 'string' ? normalizeEmail(customData.email) : ''
    const phone = typeof customData.phone === 'string' ? normalizePhone(customData.phone) : ''

    const [emHash, phHash] = await Promise.all([
      email ? sha256Hex(email) : Promise.resolve(''),
      phone ? sha256Hex(phone) : Promise.resolve(''),
    ])

    const { email: _email, phone: _phone, nome: _nome, ...restCustom } = customData

    const leadDataForWebhook =
      eventName === 'ConversaIniciada'
        ? {
            ...(typeof _nome === 'string' && _nome.trim() ? { nome: _nome.trim() } : {}),
            ...(email ? { email } : {}),
            ...(phone ? { telefone: phone } : {}),
          }
        : null

    const eventData: Record<string, any> = {
      event_id,
      event_name: eventName,
      timestamp: now,
      timestamp_iso: new Date(now).toISOString(),
      source: 'web',
      content_type: restCustom.content_type || DEFAULT_CONTENT_TYPE,
      content_id: restCustom.content_id || DEFAULT_CONTENT_ID,
      currency: restCustom.currency || DEFAULT_CURRENCY,
      device_type: detectDeviceType(),
      operating_system: detectOperatingSystem(),
      time_on_page: this.getTimeOnPageSeconds(),
      scroll_percentage:
        typeof restCustom.scroll_percentage === 'number' ? restCustom.scroll_percentage : this.scrollPercentage,
      ...restCustom,
      ...(leadDataForWebhook ? leadDataForWebhook : {}),
      hashes: {
        ...(emHash ? { em: emHash } : {}),
        ...(phHash ? { ph: phHash } : {}),
      },
    }

    if (!validatePayload(eventData)) return

    this.sentEventIds.add(event_id)

    this.sendToPixel(eventName, sanitizeForPixel(eventData), event_id)
    void this.sendToWebhook(eventData)
  }

  private sendToPixel(eventName: string, payload: PixelPayload, eventId: string) {
    try {
      if (typeof window === 'undefined' || !window.fbq) return

      const isStandardEvent = ['PageView', 'ViewContent', 'Lead', 'Contact'].includes(eventName)

      if (isStandardEvent) {
        window.fbq('track', eventName, payload, { eventID: eventId })
      } else {
        window.fbq('trackCustom', eventName, payload, { eventID: eventId })
      }
    } catch {
      // ignore
    }
  }

  private async sendToWebhook(eventData: Record<string, any>) {
    if (typeof window === 'undefined') return

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        signal: controller.signal,
        keepalive: true,
      }).finally(() => window.clearTimeout(timeout))
    } catch {
      // ignore
    }
  }
}

let singleton: TrackingManager | null = null

export function getTrackingManager() {
  if (typeof window === 'undefined') return null
  if (!singleton) singleton = new TrackingManager()
  return singleton
}
