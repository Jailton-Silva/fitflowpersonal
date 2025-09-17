import { getStripePricingData, StripePlanData } from './stripe-pricing';

// Cache em memória (para desenvolvimento)
// Em produção, considere usar Redis ou similar
let pricingCache: {
  data: StripePlanData[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém dados de preços com cache
 */
export async function getCachedPricingData(): Promise<StripePlanData[]> {
  const now = Date.now();

  // Verificar se o cache existe e ainda é válido
  if (pricingCache && (now - pricingCache.timestamp) < CACHE_DURATION) {
    console.log('📦 [CACHE] Usando dados de preços do cache');
    return pricingCache.data;
  }

  console.log('🔄 [CACHE] Buscando dados de preços do Stripe');
  
  try {
    const data = await getStripePricingData();
    
    // Atualizar cache
    pricingCache = {
      data,
      timestamp: now,
    };

    console.log('✅ [CACHE] Dados de preços atualizados no cache');
    return data;
  } catch (error) {
    console.error('❌ [CACHE] Erro ao buscar dados de preços:', error);
    
    // Se houver erro e cache antigo existe, usar cache antigo
    if (pricingCache) {
      console.log('⚠️ [CACHE] Usando dados antigos do cache devido ao erro');
      return pricingCache.data;
    }
    
    throw error;
  }
}

/**
 * Limpa o cache (útil para testes ou atualizações forçadas)
 */
export function clearPricingCache(): void {
  pricingCache = null;
  console.log('🗑️ [CACHE] Cache de preços limpo');
}

/**
 * Verifica se o cache está válido
 */
export function isCacheValid(): boolean {
  if (!pricingCache) return false;
  const now = Date.now();
  return (now - pricingCache.timestamp) < CACHE_DURATION;
}

/**
 * Obtém informações do cache
 */
export function getCacheInfo(): { isValid: boolean; age: number | null } {
  if (!pricingCache) {
    return { isValid: false, age: null };
  }
  
  const now = Date.now();
  const age = now - pricingCache.timestamp;
  const isValid = age < CACHE_DURATION;
  
  return { isValid, age };
}
