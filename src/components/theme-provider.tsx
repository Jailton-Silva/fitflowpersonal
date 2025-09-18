
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

// Este é um componente de cliente que simplesmente envolve o provedor da biblioteca next-themes.
// Isso é necessário porque o contexto do tema é um recurso de cliente.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
