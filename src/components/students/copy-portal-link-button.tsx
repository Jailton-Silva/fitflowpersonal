
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
    // Ensure this code runs only in the browser
    if (typeof window !== "undefined") {
      const portalUrl = `${window.location.origin}/portal/${studentId}`;
      navigator.clipboard.writeText(portalUrl).then(() => {
        toast({
          title: "Sucesso!",
          description: "Link do portal copiado para a área de transferência.",
        });
        setIsCopied(true);
        // Reset the check icon after a few seconds
        setTimeout(() => setIsCopied(false), 3000);
      }).catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Erro!",
          description: "Não foi possível copiar o link.",
          variant: "destructive",
        });
      });
    }
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
