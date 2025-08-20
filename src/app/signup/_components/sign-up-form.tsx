"use client";

import { signUpAction } from "@/actions/sign-up";
import { SubmitButton } from "@/components/auth/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail em formato inválido" }),
  terms: z.boolean(),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
    .regex(/[A-Z]/, { message: "Senha deve conter pelo menos uma letra maiúscula" })
    .regex(/[a-z]/, { message: "Senha deve conter pelo menos uma letra minúscula" })
    .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" })
    .regex(/[@$!%*?&]/, { message: "Senha deve conter pelo menos um caractere especial" }),
  confirmPassword: z.string()
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // mostra o erro no campo confirmPassword
  });

type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [accepted, setAccepted] = useState(false)

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      terms: false,
    }
  })

  const { mutateAsync: signUp } = useMutation({
    mutationFn: async (data: SignUpFormSchema) => {
      const origin = window.location.origin
      return await signUpAction({
        name: data.name,
        email: data.email,
        password: data.password,
        terms: data.terms,
        origin,
      })
    },
    onSuccess: (data) => {
      if (!data.success) {
        setMessageType("error")
        setMessage(data.message)
        return
      }
    
      setMessageType("success")
      setMessage(data.message)
      reset()
    },
    onError: (error: unknown) => {
      setMessageType("error");
      setMessage(error instanceof Error ? error?.message : "Não foi possível realizar o cadastro. O e-mail pode já estar em uso ou a senha é muito fraca.")
    }
  })

  const handleSignUp = async (data: SignUpFormSchema) => {
    await signUp(data);
  }

  const handleAcceptTerms = (value: boolean) => {
    setAccepted(value)
    setValue("terms", value)
  }

  return (
    <>
      {message && (
        <div className={`mb-4 p-4 text-center text-sm rounded-md ${messageType === 'error' ? 'text-destructive bg-destructive/10' : 'text-foreground bg-accent/20'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit(handleSignUp)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            placeholder="John Doe"
            required
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@exemplo.com"
            required
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirme Sua Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <div className="items-top flex space-x-2">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(val) => handleAcceptTerms(!!val)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aceitar termos e condições
            </label>
            <p className="text-sm text-muted-foreground">
              Você concorda com nossos <Link href="/terms-and-conditions" className="underline">Termos de Uso</Link> e <Link href="/privacy-policy" className="underline">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
        <SubmitButton
          type="submit"
          className="w-full ripple"
          disabled={isSubmitting}
        >
          Cadastrar
        </SubmitButton>
      </form>
    </>

  )
}