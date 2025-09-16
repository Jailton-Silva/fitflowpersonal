# Fluxo de Atualização dos Campos do Stripe

## Campos Atualizados

O sistema atualiza os seguintes campos na tabela `trainers` baseado nos eventos do Stripe:

- `stripe_customer_id`: ID do cliente no Stripe
- `stripe_subscription_id`: ID da assinatura no Stripe  
- `subscription_status`: Status da assinatura (`active`, `inactive`, `past_due`, `canceled`, `unpaid`)
- `plan`: Plano do usuário (`Free`, `Start`, `Pro`, `Elite`)

## Fluxo de Eventos

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENTOS DO STRIPE                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                WEBHOOK PROCESSING                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              updateTrainerFromStripe()                         │
│  • Valida dados de entrada                                     │
│  • Mapeia status do Stripe para interno                       │
│  • Determina plano baseado no price_id                        │
│  • Atualiza banco de dados                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (trainers)                         │
│  • Atualiza campos do Stripe                                  │
│  • Atualiza status da assinatura                              │
│  • Atualiza plano do usuário                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Mapeamento de Status

| Status Stripe | Status Interno | Ação no Plano |
|---------------|----------------|---------------|
| `active` | `active` | Mantém/Define plano baseado no price_id |
| `trialing` | `active` | Mantém/Define plano baseado no price_id |
| `past_due` | `past_due` | Mantém plano atual |
| `canceled` | `canceled` | Volta para `Free` |
| `unpaid` | `unpaid` | Volta para `Free` |
| `incomplete` | `inactive` | Volta para `Free` |
| `incomplete_expired` | `inactive` | Volta para `Free` |
| `paused` | `inactive` | Volta para `Free` |

## Mapeamento de Planos

| Price ID | Plano |
|----------|-------|
| `STRIPE_PRICE_START_ID` | `Start` |
| `STRIPE_PRICE_PRO_ID` | `Pro` |
| `STRIPE_PRICE_ELITE_ID` | `Elite` |
| Outros | `Free` |

## Cenários de Atualização

### 1. Pagamento Bem-sucedido
```
checkout.session.completed (payment_status: 'paid')
├── stripe_customer_id: definido
├── stripe_subscription_id: definido
├── subscription_status: 'active'
└── plan: baseado no metadata ou 'Start' como padrão
```

### 2. Pagamento Falhado
```
checkout.session.completed (payment_status: 'unpaid')
├── stripe_customer_id: definido
├── stripe_subscription_id: definido
├── subscription_status: 'unpaid'
└── plan: 'Free'
```

### 3. Atualização de Assinatura
```
customer.subscription.updated
├── subscription_status: mapeado do Stripe
├── plan: baseado no price_id (se status = 'active')
└── stripe_subscription_id: atualizado
```

### 4. Cancelamento de Assinatura
```
customer.subscription.deleted
├── subscription_status: 'canceled'
├── stripe_subscription_id: null
└── plan: 'Free'
```

### 5. Pagamento de Fatura Bem-sucedido
```
invoice.payment_succeeded
└── subscription_status: 'active'
```

### 6. Falha no Pagamento de Fatura
```
invoice.payment_failed
└── subscription_status: 'past_due'
```

## Logs e Monitoramento

O sistema inclui logs detalhados para cada operação:

- ✅ Sucesso: "Pagamento processado com sucesso"
- ❌ Falha: "Pagamento falhou ou foi cancelado"
- 🔄 Atualização: "Status da assinatura atualizado com sucesso"
- 🗑️ Cancelamento: "Assinatura cancelada com sucesso"

## Tratamento de Erros

- Todos os erros são capturados e logados
- Falhas não interrompem o processamento de outros eventos
- Webhook sempre retorna status 200 para evitar retry desnecessário
- Logs incluem contexto completo para debug
