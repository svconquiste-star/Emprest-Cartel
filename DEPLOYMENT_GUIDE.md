# Guia de Deploy - Emprest-Cartel

## Status da Migração

✅ **Concluído:** Landing page migrada de HTML/CSS estático para Next.js 14
✅ **Testado:** Aplicação rodando em localhost:3000
✅ **Pronto para Deploy:** Coolify com Traefik

---

## Arquivos Criados

### Estrutura do Projeto
```
Emprest-Cartel/
├── app/
│   ├── layout.tsx          # Layout raiz com Meta Pixel
│   ├── page.tsx            # Página principal com lógica
│   └── globals.css         # Estilos globais (CSS puro)
├── package.json            # Dependências
├── next.config.js          # Configuração Next.js
├── tsconfig.json           # Configuração TypeScript
├── tailwind.config.ts      # Configuração Tailwind
├── postcss.config.js       # Configuração PostCSS
├── .env.local              # Variáveis de ambiente
├── .gitignore              # Arquivos ignorados
├── README.md               # Documentação básica
├── COOLIFY_CONFIG.md       # Instruções Coolify
├── META_ADS_CONFIG.md      # Configuração Meta Ads
└── DEPLOYMENT_GUIDE.md     # Este arquivo
```

### Arquivos Deletados
- ❌ `index.html` (substituído por Next.js)
- ❌ `styles.css` (substituído por globals.css)

---

## Funcionalidades Implementadas

### 1. Meta Ads Pixel
- **ID:** `1613224946769263`
- **Eventos:**
  - `PageView` (automático)
  - `CidadeSelecionada` (ao selecionar cidade)
  - `ConversaIniciada` (ao clicar WhatsApp)
- **Correspondência Avançada:** Email e telefone (hash automático)

### 2. Seleção de Cidades
- 10 cidades disponíveis
- 9 cidades atendidas (Belo Horizonte, Brumadinho, Contagem, Esmeralda, Ibirite, Juatuba, Mário Campos, Mateus Leme, Sarzedo)
- Modal para cidades não atendidas
- Rastreamento de seleção no Meta Ads

### 3. Integração WhatsApp
- Link direto: `https://wa.me/5531973532202`
- Mensagem pré-preenchida
- Rastreamento ao clicar
- Envio de dados de correspondência avançada

### 4. Design Responsivo
- Desktop: 2 colunas (conteúdo + painel)
- Tablet: 1 coluna (painel acima)
- Mobile: 1 coluna otimizada
- Animações suaves

---

## Como Testar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar Servidor
```bash
npm run dev
```

### 3. Acessar Aplicação
```
http://localhost:3000
```

### 4. Testar Meta Pixel
1. Instale a extensão **Meta Pixel Helper** no Chrome
2. Selecione uma cidade
3. Clique em "Iniciar Conversa"
4. Verifique os eventos na extensão

---

## Deploy em Coolify

### Pré-requisitos
- Servidor Coolify configurado
- Domínio: `multinexo.com.br`
- IP do servidor Coolify

### Passo 1: Configurar DNS
Adicione em seu provedor de domínio:

**Opção A (Recomendado):**
```
Type: A
Name: *
Points to: [IP_DO_SERVIDOR_COOLIFY]
TTL: 1800
```

**Opção B:**
```
Type: A
Name: emprest-cartel
Points to: [IP_DO_SERVIDOR_COOLIFY]
TTL: 1800
```

Verificar:
```bash
nslookup emprest-cartel.multinexo.com.br
```

### Passo 2: Criar Aplicação no Coolify
1. Clique em **New Application**
2. Selecione **Git Repository**
3. Cole a URL do repositório
4. Clique **Create**

### Passo 3: Configurar Aplicação
1. **Name:** `Emprest-Cartel`
2. **Build Pack:** `Nixpacks`
3. **Domains:** `https://multinexo.com.br/emprest-cartel`
4. **Direction:** `Allow www & non-www`

### Passo 4: Variáveis de Ambiente
Vá para **Configuration → Environment Variables** e adicione:

```
NEXT_PUBLIC_META_PIXEL_ID=1613224946769263
NEXT_PUBLIC_WHATSAPP_NUMBER=5531973532202
NEXT_PUBLIC_WHATSAPP_MESSAGE=Olá! Quero fazer uma simulação de empréstimo.
```

### Passo 5: Container Labels (Traefik)
Vá para **Configuration → Network → Container Labels** e cole:

```
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.emprest-stripprefix.stripprefix.prefixes=/emprest-cartel
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http.entryPoints=http
traefik.http.routers.http.middlewares=redirect-to-https
traefik.http.routers.http.rule=Host(`multinexo.com.br`) && PathPrefix(`/emprest-cartel`)
traefik.http.routers.http.service=nextjs
traefik.http.routers.https.entryPoints=https
traefik.http.routers.https.middlewares=emprest-stripprefix,gzip
traefik.http.routers.https.rule=Host(`multinexo.com.br`) && PathPrefix(`/emprest-cartel`)
traefik.http.routers.https.service=nextjs
traefik.http.routers.https.tls.certresolver=letsencrypt
traefik.http.routers.https.tls=true
traefik.http.services.nextjs.loadbalancer.server.port=3000
```

### Passo 6: Deploy
1. Clique em **Deploy**
2. Aguarde 5-10 minutos
3. Verifique em `https://multinexo.com.br/emprest-cartel`

---

## Verificação Pós-Deploy

### Checklist
- [ ] DNS resolvendo corretamente
- [ ] HTTPS funcionando (certificado Let's Encrypt)
- [ ] Página carregando sem erros 404
- [ ] Assets (CSS, JS) carregando
- [ ] Layout responsivo funcionando
- [ ] Seleção de cidades funcionando
- [ ] Modal aparecendo para cidades não atendidas
- [ ] WhatsApp abrindo corretamente
- [ ] Meta Pixel rastreando eventos
- [ ] Correspondência avançada funcionando

### Testes
```bash
# Verificar DNS
nslookup emprest-cartel.multinexo.com.br

# Testar HTTPS
curl -I https://multinexo.com.br/emprest-cartel

# Verificar assets
curl -I https://multinexo.com.br/emprest-cartel/_next/static/...
```

---

## Troubleshooting

### Erro 404 - Assets não carregam
**Solução:** Verifique se o label `stripprefix.prefixes=/emprest-cartel` está correto

### Erro 404 - Página não encontrada
**Solução:** Verifique se `rule=Host(...) && PathPrefix(...)` está correto

### HTTPS não funciona
**Solução:** Aguarde 5-10 minutos e verifique logs do Traefik

### DNS não resolvendo
**Solução:** Aguarde 5-10 minutos e verifique com `nslookup`

### Meta Pixel não rastreando
**Solução:** Verifique se o Pixel ID está correto e se a correspondência avançada está ativada

---

## Comandos Úteis

### Build Local
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

### Limpeza
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## Suporte

Para dúvidas sobre:
- **Coolify:** Veja `COOLIFY_CONFIG.md`
- **Meta Ads:** Veja `META_ADS_CONFIG.md`
- **Desenvolvimento:** Veja `README.md`

---

## Informações Importantes

- **Domínio:** `https://emprest-cartel.multinexo.com.br`
- **Subpath:** `/emprest-cartel`
- **Porta Interna:** 3000
- **Framework:** Next.js 14
- **Styling:** CSS puro + Tailwind
- **Meta Pixel ID:** 1613224946769263
- **WhatsApp:** +55 31 97353-2202
