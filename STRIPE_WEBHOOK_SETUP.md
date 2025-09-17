# Configuração do Webhook do Stripe

## Configuração no Dashboard do Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá para **Developers** > **Webhooks**
3. Clique em **Add endpoint**
4. Configure a URL do webhook: `https://seu-dominio.com/api/webhooks/stripe`
5. Selecione os seguintes eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no seu arquivo `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# IDs dos produtos e preços do Stripe
STRIPE_PRICE_START_ID=price_...
STRIPE_PLAN_START_ID=prod_...
STRIPE_PRICE_PRO_ID=price_...
STRIPE_PLAN_PRO_ID=prod_...
STRIPE_PRICE_ELITE_ID=price_...
STRIPE_PLAN_ELITE_ID=prod_...
```

## Como Funciona o Fluxo de Pagamento

1. **Seleção do Plano**: O usuário clica em "Assinar Plano" na página de billing
2. **Criação da Sessão**: A API `/api/checkout` cria uma sessão de checkout no Stripe
3. **Redirecionamento**: O usuário é redirecionado para o Stripe Checkout
4. **Pagamento**: O usuário completa o pagamento no Stripe
5. **Webhook**: O Stripe envia um webhook para `/api/webhooks/stripe`
6. **Atualização**: O webhook atualiza o status do trainer no banco de dados
7. **Redirecionamento de Retorno**: O usuário é redirecionado para:
   - `/billing/success` - Se o pagamento foi bem-sucedido
   - `/billing/cancel` - Se o pagamento foi cancelado

## Eventos de Webhook Tratados

### `checkout.session.completed`
- **Pagamento Bem-sucedido**: Atualiza `stripe_customer_id`, `stripe_subscription_id`, `subscription_status: 'active'`, `plan` e `billing_cycle_end`
- **Pagamento Falhado/Cancelado**: Atualiza `subscription_status: 'unpaid'` e `plan: 'Free'`

### `customer.subscription.updated`
- Atualiza o `subscription_status` baseado no status do Stripe
- Atualiza o `plan` baseado no `price_id` da assinatura
- Atualiza o `billing_cycle_end` baseado no `current_period_end` do Stripe
- Mapeia status do Stripe para status interno do sistema

### `customer.subscription.deleted`
- Define `subscription_status: 'canceled'`
- Remove `stripe_subscription_id` (define como `null`)
- Volta o `plan` para `'Free'`

### `invoice.payment_succeeded`
- Confirma pagamento bem-sucedido
- Define `subscription_status: 'active'`

### `invoice.payment_failed`
- Marca pagamento como falhado
- Define `subscription_status: 'past_due'`

## Páginas de Redirecionamento

### Página de Sucesso (`/billing/success`)
- Verifica o status da sessão de checkout
- Mostra confirmação do pagamento
- Exibe o plano ativado
- Oferece links para voltar ao billing ou dashboard

### Página de Cancelamento (`/billing/cancel`)
- Informa que o pagamento foi cancelado
- Oferece opção de tentar novamente
- Links para voltar ao billing ou dashboard

## Logs e Debug

O webhook inclui logs detalhados para facilitar o debug:
- 🔔 Logs de eventos recebidos
- 🔍 Logs de busca de trainers
- 📝 Logs de dados para atualização
- ✅ Logs de sucesso nas operações
- ❌ Logs de erros com detalhes
- 🛒 Logs específicos para checkout
- 💰 Logs de processamento de pagamentos

### Teste da Integração

Para testar a integração, use o endpoint de teste:
```bash
POST /api/test-stripe
{
  "trainerId": "seu-trainer-id",
  "customerId": "cus_test123",
  "subscriptionId": "sub_test123",
  "plan": "Start"
}
```

Verifique os logs do seu servidor para acompanhar o processamento dos webhooks.

## Preços Dinâmicos

O sistema agora suporta preços dinâmicos do Stripe:

### Funcionalidades
- ✅ Busca automática de preços do Stripe
- ✅ Cache de 5 minutos para otimizar performance
- ✅ Fallback para preços estáticos em caso de erro
- ✅ Suporte a planos mensais e anuais
- ✅ Formatação automática de preços em BRL

### Gerenciamento de Cache
```bash
# Verificar status do cache
GET /api/cache/pricing

# Limpar cache (forçar atualização)
DELETE /api/cache/pricing
```

### Configuração de Produtos
Os produtos são mapeados através das variáveis de ambiente:
- `STRIPE_PLAN_START_ID` → Plano Start
- `STRIPE_PLAN_PRO_ID` → Plano Pro  
- `STRIPE_PLAN_ELITE_ID` → Plano Elite

## Testando o Webhook

1. Use o Stripe CLI para testar webhooks localmente:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Ou use o modo de teste no dashboard do Stripe para simular eventos.

## Troubleshooting

- **Webhook não está sendo chamado**: Verifique se a URL está correta e acessível
- **Erro de assinatura**: Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- **Dados não atualizados**: Verifique os logs do webhook para erros no banco de dados
- **Redirecionamento não funciona**: Verifique se o `NEXT_PUBLIC_APP_URL` está configurado corretamente
