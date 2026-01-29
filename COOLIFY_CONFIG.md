# Configuração Coolify - Emprest-Cartel

## 1. Configuração DNS

Adicione o seguinte registro DNS no seu provedor de domínio:

### Opção A: Wildcard (Recomendado)
```
Type: A
Name: *
Points to: [IP_DO_SERVIDOR_COOLIFY]
TTL: 1800 (30 minutos)
```

### Opção B: Específico para o subdomínio
```
Type: A
Name: emprest-cartel
Points to: [IP_DO_SERVIDOR_COOLIFY]
TTL: 1800 (30 minutos)
```

**Verificar DNS:**
```bash
nslookup emprest-cartel.multinexo.com.br
```

---

## 2. Configuração Coolify - Container Labels (Traefik)

### Passos:
1. Acesse: **Configuration → Network → Container Labels**
2. Apague TUDO que estiver lá
3. Cole os labels abaixo (um por linha)
4. Clique **"Save"**
5. Clique **"Redeploy"**

### Container Labels (16 linhas):
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

---

## 3. Configuração Coolify - General Settings

- **Name:** `Emprest-Cartel`
- **Build Pack:** `Nixpacks`
- **Domains:** `https://multinexo.com.br/emprest-cartel`
- **Direction:** `Allow www & non-www`

---

## 4. Variáveis de Ambiente

Adicione em **Configuration → Environment Variables**:

```
NEXT_PUBLIC_META_PIXEL_ID=1613224946769263
NEXT_PUBLIC_WHATSAPP_NUMBER=5531973532202
NEXT_PUBLIC_WHATSAPP_MESSAGE=Olá! Quero fazer uma simulação de empréstimo.
```

---

## 5. Fluxo de Requisição

```
Cliente → https://multinexo.com.br/emprest-cartel
   ↓
Traefik (porta 443)
   ↓
Traefik stripprefix: Remove `/emprest-cartel`
   ↓
Next.js recebe: /
   ↓
Next.js gera assets em: /
   ↓
Cliente recebe página com assets carregados ✅
```

---

## 6. Troubleshooting

### Erro 404 - Assets não carregam
**Causa:** Traefik não está fazendo stripprefix corretamente
**Solução:** Verifique se o label `stripprefix.prefixes=/emprest-cartel` está correto

### Erro 404 - Página não encontrada
**Causa:** Regra de roteamento incorreta
**Solução:** Verifique se `rule=Host(...) && PathPrefix(...)` está correto

### HTTPS não funciona
**Causa:** Let's Encrypt não gerou certificado
**Solução:** Aguarde 5-10 minutos e verifique logs do Traefik

### DNS não resolvendo
**Causa:** Registro DNS não propagou
**Solução:** Aguarde 5-10 minutos e verifique com `nslookup`

---

## 7. Checklist de Deploy

- [ ] DNS configurado (A record wildcard ou específico)
- [ ] DNS propagado (verificar com `nslookup`)
- [ ] `next.config.js` sem `basePath`
- [ ] Container Labels atualizados no Coolify
- [ ] Variáveis de ambiente configuradas
- [ ] Redeploy executado
- [ ] HTTPS funcionando (certificado Let's Encrypt)
- [ ] Assets carregando (F12 → Console sem erros 404)
- [ ] Layout correto (2 colunas em desktop, 1 em mobile)
- [ ] Meta Pixel rastreando eventos
- [ ] WhatsApp funcionando corretamente
