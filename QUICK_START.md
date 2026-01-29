# Quick Start - Emprest-Cartel

## 🚀 Iniciar Localmente (2 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm run dev

# 3. Abrir no navegador
http://localhost:3000
```

---

## 🌐 Deploy em Coolify (10 minutos)

### 1. DNS (5 minutos antes)
```
Type: A
Name: * (ou emprest-cartel)
Points to: [IP_DO_SERVIDOR_COOLIFY]
TTL: 1800
```

### 2. Coolify - Criar Aplicação
1. **New Application** → **Git Repository**
2. Cole a URL do repositório
3. Clique **Create**

### 3. Coolify - Configurar
- **Name:** `Emprest-Cartel`
- **Build Pack:** `Nixpacks`
- **Domains:** `https://multinexo.com.br/emprest-cartel`

### 4. Coolify - Variáveis de Ambiente
```
NEXT_PUBLIC_META_PIXEL_ID=1613224946769263
NEXT_PUBLIC_WHATSAPP_NUMBER=5531973532202
NEXT_PUBLIC_WHATSAPP_MESSAGE=Olá! Quero fazer uma simulação de empréstimo.
```

### 5. Coolify - Container Labels
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

### 6. Deploy
Clique **Deploy** e aguarde 5-10 minutos

---

## ✅ Testar Após Deploy

```bash
# Verificar DNS
nslookup emprest-cartel.multinexo.com.br

# Testar HTTPS
curl -I https://multinexo.com.br/emprest-cartel

# Abrir no navegador
https://multinexo.com.br/emprest-cartel
```

---

## 📋 Checklist Final

- [ ] DNS configurado
- [ ] Aplicação criada no Coolify
- [ ] Variáveis de ambiente adicionadas
- [ ] Container Labels configurados
- [ ] Deploy executado
- [ ] HTTPS funcionando
- [ ] Página carregando
- [ ] Seleção de cidades funcionando
- [ ] WhatsApp abrindo
- [ ] Meta Pixel rastreando

---

## 🔗 Links Importantes

- **Desenvolvimento:** `http://localhost:3000`
- **Produção:** `https://multinexo.com.br/emprest-cartel`
- **Meta Pixel:** `1613224946769263`
- **WhatsApp:** `+55 31 97353-2202`

---

## 📚 Documentação Completa

- `README.md` - Instruções básicas
- `COOLIFY_CONFIG.md` - Configuração Coolify
- `META_ADS_CONFIG.md` - Meta Ads Pixel
- `DEPLOYMENT_GUIDE.md` - Guia completo
- `MIGRATION_SUMMARY.md` - Resumo da migração

---

## 🆘 Problemas?

**Assets não carregam (404)**
→ Verificar label `stripprefix.prefixes=/emprest-cartel`

**HTTPS não funciona**
→ Aguardar 5-10 minutos

**DNS não resolvendo**
→ Aguardar 5-10 minutos

**Meta Pixel não rastreia**
→ Verificar Pixel ID e ativar correspondência avançada

Veja `DEPLOYMENT_GUIDE.md` para troubleshooting completo.
