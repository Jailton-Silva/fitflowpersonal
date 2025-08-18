"use client";

import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { signInAction } from "@/actions/sign-in";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"

const signInFormSchema = z.object({
  email: z.string().email({ message: "E-mail do formato inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
})

type SignInFormSchema = z.infer<typeof signInFormSchema>;

export function SignInForm() {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
  })

  const { mutateAsync: signIn } = useMutation({
    mutationFn: async (data: SignInFormSchema) => {
      return await signInAction({
        email: data.email,
        password: data.password,
      })
    },
    onSuccess: () => {
      toast.success("Login realizado com sucesso!", {
        position: "bottom-center"
      })
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      console.error("Erro no login:", error)
      toast.error(error.message || "Credenciais inválidas", {
        position: "bottom-center"
      })
    }
  })

  const handleSignIn = async (data: SignInFormSchema) => {
    try {
      await signIn(data)
    } catch (err) {
      // O erro já é tratado no onError da mutation
      console.log("Erro capturado no handleSignIn:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSignIn)} className="grid gap-4">
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
        <div className="flex items-center">
          <Label htmlFor="password">Senha</Label>
        </div>
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
      <Link
        href="/forgot"
        className="ml-auto inline-block text-sm underline"
      >
        Esqueceu sua senha?
      </Link>
      <SubmitButton
        type="submit"
        className="w-full ripple"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Login"}
      </SubmitButton>
    </form>
  )
}