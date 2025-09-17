import { NextRequest, NextResponse } from 'next/server';
import { clearPricingCache, getCacheInfo } from '@/lib/stripe-pricing-cache';

export async function GET() {
  try {
    const cacheInfo = getCacheInfo();
    
    return NextResponse.json({
      success: true,
      cache: cacheInfo,
      message: cacheInfo.isValid 
        ? 'Cache válido' 
        : 'Cache inválido ou não existe'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao verificar cache',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearPricingCache();
    
    return NextResponse.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao limpar cache',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
