import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm, type FieldValues, type Path, type Resolver } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input, Label, MensagemErro } from "@/components/ui/input";
import { ApiError } from "@/lib/api";

interface Campo<T> {
  nome: Path<T>;
  rotulo: string;
  tipo: "text" | "email" | "password";
  autoComplete: string;
}

interface Props<T extends FieldValues> {
  schema: z.ZodType<T, T>;
  campos: Campo<T>[];
  textoBotao: string;
  aoEnviar: (dados: T) => Promise<void>;
}

/** Shared form for sign-in / sign-up: Zod validation + API error banner. */
export function FormularioAuth<T extends FieldValues>({ schema, campos, textoBotao, aoEnviar }: Props<T>) {
  const [erroApi, setErroApi] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({ resolver: zodResolver(schema) as Resolver<T> });

  const enviar = handleSubmit(async (dados) => {
    setErroApi(null);
    try {
      await aoEnviar(dados);
    } catch (err) {
      setErroApi(err instanceof ApiError ? err.message : "Algo deu errado. Tente de novo.");
    }
  });

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {erroApi && <Erro mensagem={erroApi} />}
      {campos.map((campo) => {
        const erro = errors[campo.nome]?.message as string | undefined;
        const id = `campo-${String(campo.nome)}`;
        return (
          <div key={String(campo.nome)}>
            <Label htmlFor={id}>{campo.rotulo}</Label>
            <Input
              id={id}
              type={campo.tipo}
              autoComplete={campo.autoComplete}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? `${id}-erro` : undefined}
              {...register(campo.nome)}
            />
            <MensagemErro id={`${id}-erro`}>{erro}</MensagemErro>
          </div>
        );
      })}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Aguarde…" : textoBotao} <ArrowRight aria-hidden />
      </Button>
    </form>
  );
}
