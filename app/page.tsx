'use client'

import { useEffect, useRef, useState } from 'react'

import { getTrackingManager } from '@/lib/tracking'

const envWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
const WHATSAPP_NUMBER =
  envWhatsAppNumber && envWhatsAppNumber !== '5531973407941' ? envWhatsAppNumber : '5531973532202'
const WHATSAPP_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Olá! Quero fazer uma simulação de empréstimo.'

const CIDADES = [
  'BELO HORIZONTE',
  'BRUMADINHO',
  'CONTAGEM',
  'ESMERALDA',
  'IBIRITE',
  'JUATUBA',
  'MÁRIO CAMPOS',
  'MATEUS LEME',
  'SARZEDO',
  'OUTRA CIDADE',
]

const ATENDIDAS = new Set([
  'BELO HORIZONTE',
  'BRUMADINHO',
  'CONTAGEM',
  'ESMERALDA',
  'IBIRITE',
  'JUATUBA',
  'MÁRIO CAMPOS',
  'MATEUS LEME',
  'SARZEDO',
])

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const modalCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.getElementById('year')!.textContent = new Date().getFullYear().toString()
  }, [])

  useEffect(() => {
    const tm = getTrackingManager()
    void tm?.trackEvent('ViewContent', { content_type: 'product', content_id: 'emprestimo' })
  }, [])

  const handleCityClick = (cidade: string) => {
    setSelectedCity(cidade)

    const tm = getTrackingManager()
    void tm?.trackEvent('ViewContent', { cidade, content_type: 'product', content_id: 'emprestimo' })

    if (cidade === 'OUTRA CIDADE' || !ATENDIDAS.has(cidade)) {
      setShowModal(true)

      void tm?.trackEvent('CityNotAvailable', {
        cidade,
        content_type: 'product',
        content_id: 'emprestimo',
      })

      return
    }
  }

  const handleWhatsAppClick = () => {
    if (!selectedCity || selectedCity === 'OUTRA CIDADE' || !ATENDIDAS.has(selectedCity)) {
      return
    }

    const phoneDigits = userPhone.replace(/\D/g, '')
    const phoneValid = phoneDigits.length === 10 || phoneDigits.length === 11
    if (!phoneValid) {
      setPhoneTouched(true)

      const tm = getTrackingManager()
      void tm?.trackEvent('ValidationError', {
        field: 'telefone',
        message: 'Telefone inválido. Informe DDD + 8/9 dígitos (10 ou 11 números).',
        content_type: 'product',
        content_id: 'emprestimo',
      })

      return
    }

    const tm = getTrackingManager()

    void tm?.trackEvent('Lead', {
      cidade: selectedCity,
      content_type: 'product',
      content_id: 'emprestimo',
      nome: userName,
      email: userEmail,
      phone: userPhone,
    })

    void tm?.trackEvent('ConversaIniciada', {
      cidade: selectedCity,
      conversation_channel: 'whatsapp',
      conversation_status: 'initiated',
      content_type: 'product',
      content_id: 'emprestimo',
      nome: userName,
      email: userEmail,
      phone: userPhone,
    })

    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const phoneDigits = userPhone.replace(/\D/g, '')
  const isPhoneValid = phoneDigits.length === 10 || phoneDigits.length === 11
  const isWhatsAppDisabled = !selectedCity || selectedCity === 'OUTRA CIDADE' || !ATENDIDAS.has(selectedCity) || !isPhoneValid

  return (
    <div className="shell">
      <div className="content">
        <header className="hero" role="banner">
          <div className="hero-content">
            <h1>Empréstimo Rápido e Seguro</h1>
            <p>Selecione sua cidade e desbloqueie atendimento VIP com especialistas prontos para ajudar.</p>
            <div className="hero-highlights">
              <div className="highlight">
                <i className="fa-solid fa-check-circle"></i>
                <span>Aprovação em até 24h</span>
              </div>
              <div className="highlight">
                <i className="fa-solid fa-lock"></i>
                <span>100% Seguro</span>
              </div>
              <div className="highlight">
                <i className="fa-solid fa-zap"></i>
                <span>Sem Burocracia</span>
              </div>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Seleção de cidade e WhatsApp">
            <div className="panel-header">
              <h2>Selecione sua Cidade</h2>
              <p>Escolha abaixo para liberar o atendimento</p>
            </div>
            <div className="city-grid" role="group" aria-label="Lista de cidades atendidas">
              {CIDADES.map((cidade) => (
                <button
                  key={cidade}
                  type="button"
                  className={`city-btn ${selectedCity === cidade ? 'selected' : ''}`}
                  onClick={() => handleCityClick(cidade)}
                >
                  <span className="label">{cidade}</span>
                  <span className="dot" aria-hidden="true"></span>
                </button>
              ))}
            </div>

            <div className="lead-form" aria-label="Dados para atendimento">
              <div className="field">
                <label htmlFor="leadName">Nome</label>
                <input
                  id="leadName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Digite seu nome"
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label htmlFor="leadEmail">Email</label>
                <input
                  id="leadEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <label htmlFor="leadPhone">Telefone</label>
                <input
                  id="leadPhone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  onBlur={() => {
                    setPhoneTouched(true)

                    const digits = userPhone.replace(/\D/g, '')
                    const valid = digits.length === 10 || digits.length === 11
                    if (!valid) {
                      const tm = getTrackingManager()
                      void tm?.trackEvent('ValidationError', {
                        field: 'telefone',
                        message: 'Telefone inválido. Informe DDD + 8/9 dígitos (10 ou 11 números).',
                        content_type: 'product',
                        content_id: 'emprestimo',
                      })
                    }
                  }}
                  placeholder="31988887777"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={phoneTouched && !isPhoneValid}
                />
                {phoneTouched && !isPhoneValid ? (
                  <span className="field-error">Digite um telefone com DDD + 8/9 dígitos (10 ou 11 números).</span>
                ) : null}
              </div>
            </div>
            <div className="cta">
              <button
                id="zapBtn"
                className={`btn btn-whats ${isWhatsAppDisabled ? 'btn-disabled' : 'active'}`}
                onClick={handleWhatsAppClick}
                disabled={isWhatsAppDisabled}
                aria-disabled={isWhatsAppDisabled}
              >
                <i className="fa-brands fa-whatsapp"></i>
                Iniciar Conversa
              </button>
              <small>Resposta em minutos • Sem compromisso</small>
            </div>
          </aside>
        </header>

        <main>
          <section aria-labelledby="benefits">
            <div className="section-head">
              <h2 id="benefits">Por que escolher nossa equipe</h2>
              <p>Uma experiência pensada para quem precisa de crédito rápido, com linguagem simples e acompanhamento até o PIX cair na sua conta.</p>
            </div>
            <div className="features">
              <article className="feature-card">
                <i className="fa-solid fa-shield-heart"></i>
                <h3>Proteção total</h3>
                <p>Documentos validados com segurança digital e equipe treinada para garantir confidencialidade.</p>
              </article>
              <article className="feature-card">
                <i className="fa-solid fa-person-chalkboard"></i>
                <h3>Especialista dedicado</h3>
                <p>Você fala com uma pessoa real que guia cada etapa da simulação até a assinatura.</p>
              </article>
              <article className="feature-card">
                <i className="fa-solid fa-bolt"></i>
                <h3>Liberação ágil</h3>
                <p>Processos digitalizados que aceleram análise e desembolso, sem filas e sem complicação.</p>
              </article>
              <article className="feature-card">
                <i className="fa-solid fa-mobile-screen"></i>
                <h3>WhatsApp first</h3>
                <p>Todo o fluxo acontece no aplicativo que você já usa, com registros para consultar quando quiser.</p>
              </article>
            </div>
          </section>

          <section aria-labelledby="steps">
            <div className="section-head">
              <h2 id="steps">Como funciona na prática</h2>
              <p>Transparência em cada etapa. Você sempre sabe em que ponto está e qual o próximo passo.</p>
            </div>
            <div className="timeline">
              <article className="step">
                <span>1</span>
                <h3>Selecione a cidade</h3>
                <p>Confirmamos se sua região já está ativa. Caso não esteja, você recebe o aviso e entra na fila de expansão.</p>
              </article>
              <article className="step">
                <span>2</span>
                <h3>Conversa no WhatsApp</h3>
                <p>Especialista faz as perguntas essenciais e monta a simulação sob medida para seu perfil.</p>
              </article>
              <article className="step">
                <span>3</span>
                <h3>Envio de documentos</h3>
                <p>Upload guiado com checklist simples. Tudo conferido e protegido com autenticação.</p>
              </article>
              <article className="step">
                <span>4</span>
                <h3>Assinatura e PIX</h3>
                <p>Contrato digital, assinatura segura e liberação do valor imediatamente após aprovação.</p>
              </article>
            </div>
          </section>

          <section className="proof" aria-labelledby="proof">
            <div className="testimonial">
              <div className="section-head" style={{ marginBottom: '18px' }}>
                <h2 id="proof">Voz de quem já recebeu</h2>
              </div>
              <blockquote>
                "Quando selecionei minha cidade, em menos de 5 minutos já estava conversando com a equipe. Me explicaram taxas, me ajudaram com os documentos e o PIX bateu no mesmo dia."
                <footer>— Juliana P., Juatuba</footer>
              </blockquote>
            </div>
            <div className="numbers" aria-label="Indicadores">
              <div>
                <strong>94%</strong>
                <span>Satisfação média nos atendimentos</span>
              </div>
              <div>
                <strong>R$ 12 mi</strong>
                <span>Em crédito liberado em 2024</span>
              </div>
              <div>
                <strong>5min</strong>
                <span>Tempo médio para iniciar a conversa</span>
              </div>
              <div>
                <strong>Zero</strong>
                <span>Custos para simular e cancelar</span>
              </div>
            </div>
          </section>

          <section aria-labelledby="faq">
            <div className="section-head">
              <h2 id="faq">Perguntas frequentes</h2>
              <p>Informações rápidas para você começar agora mesmo.</p>
            </div>
            <div className="faq">
              <details>
                <summary>Os dados enviados ficam seguros?</summary>
                <p>Sim. Utilizamos armazenamento criptografado e acesso restrito à equipe responsável. Todos os dados podem ser excluídos mediante solicitação.</p>
              </details>
              <details>
                <summary>Existe algum custo para simular?</summary>
                <p>Não. A análise é 100% gratuita e somente seguimos para assinatura se você aprovar as condições.</p>
              </details>
              <details>
                <summary>Quais documentos preciso ter em mãos?</summary>
                <p>Documento oficial com foto, comprovante de renda e comprovante de residência atualizado. Caso precise de algo extra, avisaremos durante o atendimento.</p>
              </details>
              <details>
                <summary>E se a minha cidade ainda não estiver disponível?</summary>
                <p>Mostramos um aviso e registramos seu interesse para priorizar a expansão. Assim que liberarmos, você recebe uma mensagem automática no WhatsApp.</p>
              </details>
            </div>
          </section>
        </main>

        <footer>
          <span>© <span id="year"></span> Atendimento via WhatsApp. Todos os direitos reservados.</span>
        </footer>
      </div>

      <div
        id="modal"
        className={`modal ${showModal ? 'active' : ''}`}
        role="dialog"
        aria-modal={showModal}
        aria-labelledby="modalTitle"
        aria-describedby="modalMessage"
      >
        <div className="modal-box">
          <h2 id="modalTitle">Aviso importante</h2>
          <p id="modalMessage">No Momento Não Estamos Atuando Na Cidade Selecionada, Mas Breve iremos chegar Na Sua Cidade</p>
          <div className="modal-actions">
            <button
              className="modal-btn"
              type="button"
              ref={modalCloseRef}
              onClick={() => setShowModal(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
