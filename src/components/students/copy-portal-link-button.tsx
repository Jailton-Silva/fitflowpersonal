
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, Check } from "lucide-react";

type CopyPortalLinkButtonProps = {
  studentId: string;
};

export default function CopyPortalLinkButton({ studentId }: CopyPortalLinkButtonProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    // Garante que o link copiado SEMPRE aponte para o site em produção.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fitflowpersonal.vercel.app';
    const portalUrl = `${siteUrl}/portal/${studentId}`;
    
    navigator.clipboard.writeText(portalUrl).then(() => {
      toast({
        title: "Sucesso!",
        description: "Link do portal copiado para a área de transferência.",
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Erro!",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    });
  };

  return (
    <Button onClick={handleCopy} variant="outline">
      {isCopied ? (
        <Check className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <Link className="mr-2 h-4 w-4" />
      )}
      Copiar Link do Portal
    </Button>
  );
}
