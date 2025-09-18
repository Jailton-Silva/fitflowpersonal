
"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Check } from "lucide-react";

// Componente foi refatorado para ser "burro" (stateless).
// Ele não gerencia mais o próprio estado.

type CopyWorkoutLinkButtonProps = {
  isCopied: boolean;
  onClick: () => void;
};

export default function CopyWorkoutLinkButton({ isCopied, onClick }: CopyWorkoutLinkButtonProps) {
  
  // O botão agora apenas exibe o estado que recebe via props
  // e chama a função que o pai lhe passou.
  return (
    <Button onClick={onClick} variant="outline" size="sm">
      {isCopied ? (
        <Check className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <LinkIcon className="mr-2 h-4 w-4" />
      )}
      Link
    </Button>
  );
}
