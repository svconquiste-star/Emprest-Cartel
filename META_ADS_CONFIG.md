# Configuração Meta Ads Pixel - Correspondência Avançada

## Pixel ID
```
1013145803462320
```

## Eventos Rastreados

### 1. PageView (Automático)
Rastreado automaticamente ao carregar a página com dados de correspondência avançada.

**Dados enviados:**
- Nenhum (evento padrão)

---

## 2. CidadeSelecionada (Evento Customizado)
Disparado quando o usuário seleciona uma cidade.

**Dados enviados:**
```javascript
{
  cidade: "BELO HORIZONTE"
}
```

---

## 3. ConversaIniciada (Evento Customizado)
Disparado quando o usuário clica no botão WhatsApp.

**Dados enviados com Correspondência Avançada:**
```javascript
{
  cidade: "BELO HORIZONTE",
  em: "usuario@email.com",        // Email (hash SHA-256 automático)
  ph: "5531973407941"             // Telefone (hash SHA-256 automático)
}
```

---

## Configuração no Meta Business Suite

### Passo 1: Acessar o Pixel
1. Vá para **Meta Business Suite**
2. Selecione **Eventos → Pixels**
3. Clique no Pixel ID `1013145803462320`

### Passo 2: Configurar Correspondência Avançada
1. Clique em **Configurações**
2. Vá para **Correspondência Avançada**
3. Ative **Email** e **Telefone**
4. Salve as alterações

### Passo 3: Verificar Rastreamento
1. Instale a extensão **Meta Pixel Helper** no Chrome
2. Acesse a landing page
3. Verifique se os eventos aparecem na extensão:
   - ✅ PageView
   - ✅ CidadeSelecionada (ao selecionar cidade)
   - ✅ ConversaIniciada (ao clicar WhatsApp)

---

## Dados de Correspondência Avançada

### Email (em)
- **Formato:** Lowercase, sem espaços
- **Exemplo:** `usuario@email.com` → `usuario@email.com`
- **Hash:** Automático (SHA-256) pelo Meta Pixel

### Telefone (ph)
- **Formato:** Apenas dígitos, com código do país
- **Exemplo:** `+55 31 97340-7941` → `5531973407941`
- **Hash:** Automático (SHA-256) pelo Meta Pixel

---

## Fluxo de Rastreamento

```
1. Usuário acessa a página
   ↓
   PageView enviado ao Meta Pixel

2. Usuário seleciona uma cidade
   ↓
   CidadeSelecionada enviado com dados da cidade

3. Usuário clica em "Iniciar Conversa"
   ↓
   ConversaIniciada enviado com:
   - Cidade selecionada
   - Email (se fornecido)
   - Telefone (se fornecido)
   ↓
   Redirecionado para WhatsApp
```

---

## Monitoramento

### No Meta Ads Manager
1. Vá para **Eventos**
2. Selecione o Pixel
3. Verifique em tempo real:
   - Número de PageViews
   - Número de CidadeSelecionada
   - Número de ConversaIniciada

### Relatórios
- **Conversão:** ConversaIniciada
- **Taxa de Conversão:** ConversaIniciada / PageView
- **Valor Médio:** Não aplicável (sem evento de compra)

---

## Notas Importantes

1. **Sem Evento de Compra:** Removido conforme solicitado
2. **Correspondência Avançada:** Email e telefone são opcionais
3. **Hash Automático:** Meta Pixel faz o hash automaticamente
4. **Privacidade:** Dados são criptografados antes do envio
5. **Teste:** Use o Meta Pixel Helper para verificar eventos

---

## Troubleshooting

### Eventos não aparecem
- Verifique se o Pixel ID está correto
- Verifique se o script está carregando (F12 → Network)
- Verifique se há erros no console (F12 → Console)

### Correspondência Avançada não funciona
- Verifique se está ativada nas configurações do Pixel
- Verifique se os dados estão no formato correto
- Aguarde 24h para propagação

### Dados não aparecem no Meta Ads Manager
- Aguarde 15-30 minutos
- Verifique se o Pixel está ativo
- Verifique se há tráfego na página
