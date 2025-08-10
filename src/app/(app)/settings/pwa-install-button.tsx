
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadCloud } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPwaInstallButtonPromptEvent);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Heuristic to show the button on supported desktop browsers even if the event hasn't fired yet.
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
       setShowButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
        alert("Para instalar o app, clique no menu do navegador (geralmente três pontos ou um ícone de compartilhamento) e procure pela opção 'Instalar Aplicativo' ou 'Adicionar à Tela de Início'.");
        return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowButton(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };
  
  // Do not render the component if PWA installation is not supported by the browser or already installed
  if (!showButton) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DownloadCloud /> Aplicativo
        </CardTitle>
        <CardDescription>
          Instale o FitFlow no seu dispositivo para ter acesso rápido e uma experiência otimizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleInstallClick} className="w-full ripple">
          Instalar Aplicativo
        </Button>
      </CardContent>
    </Card>
  );
}
