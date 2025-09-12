-- Adicionar campos do Stripe na tabela trainers
ALTER TABLE public.trainers 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_trainers_stripe_customer_id ON public.trainers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_trainers_stripe_subscription_id ON public.trainers(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_trainers_subscription_status ON public.trainers(subscription_status);

-- Atualizar o tipo do campo plan para incluir 'Free'
ALTER TABLE public.trainers 
ALTER COLUMN plan TYPE TEXT;

-- Adicionar constraint para validar os valores do plan
ALTER TABLE public.trainers 
ADD CONSTRAINT check_plan_values 
CHECK (plan IN ('Free', 'Start', 'Pro', 'Elite'));

-- Adicionar constraint para validar os valores do subscription_status
ALTER TABLE public.trainers 
ADD CONSTRAINT check_subscription_status_values 
CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled', 'unpaid'));
