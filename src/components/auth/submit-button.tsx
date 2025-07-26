"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Props = ComponentProps<typeof Button> & {
  children: React.ReactNode;
};

export function SubmitButton({ children, className, ...props }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" aria-disabled={pending} disabled={pending} className={cn(className)}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
