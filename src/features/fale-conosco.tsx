import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Send } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Erro } from "@/components/ui/estados";
import { Input, Label } from "@/components/ui/input";
import { api, mensagemErro } from "@/lib/api";

const vazio = { nome: "", email: "", assunto: "", mensagem: "", site: "" };

/** Landing page contact form. Messages land in the admin panel (/admin/mensagens). */
export function FormFaleConosco() {
  const id = useId();
  const [dados, setDados] = useState(vazio);
  const enviar = useMutation({ mutationFn: () => api.enviarContato(dados) });
  const set = (campo: keyof typeof vazio) => (e: { target: { value: string } }) => setDados((d) => ({ ...d, [campo]: e.target.value }));

  if (enviar.isSuccess) {
    return (
      <div role="status" className="regua flex flex-col gap-4 border-verde bg-white p-6">
        <p className="flex items-center gap-3 text-2xl font-bold">
          <CheckCircle2 className="size-7 text-verde" aria-hidden /> Mensagem enviada!
        </p>
        <p>Valeu por escrever, {dados.nome.split(" ")[0]}. A resposta chega no {dados.email}.</p>
        <Button
          variant="link"
          onClick={() => {
            setDados(vazio);
            enviar.reset();
          }}
        >
          Mandar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        enviar.mutate();
      }}
    >
      {enviar.error && (
        <div className="sm:col-span-2">
          <Erro mensagem={mensagemErro(enviar.error)} />
        </div>
      )}
      <div>
        <Label htmlFor={`${id}-nome`}>Nome</Label>
        <Input id={`${id}-nome`} required minLength={2} maxLength={80} autoComplete="name" value={dados.nome} onChange={set("nome")} />
      </div>
      <div>
        <Label htmlFor={`${id}-email`}>E-mail</Label>
        <Input id={`${id}-email`} type="email" required maxLength={190} autoComplete="email" value={dados.email} onChange={set("email")} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${id}-assunto`}>Assunto</Label>
        <Input id={`${id}-assunto`} required minLength={3} maxLength={120} placeholder="Ex.: sugestão de competição" value={dados.assunto} onChange={set("assunto")} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${id}-mensagem`}>Mensagem</Label>
        <textarea
          id={`${id}-mensagem`}
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className="w-full border-2 border-neutro-400 bg-white p-3 text-base text-tinta placeholder:text-neutro-500 focus:border-tinta focus:outline-none"
          value={dados.mensagem}
          onChange={set("mensagem")}
        />
      </div>
      {/* Honeypot: invisible to people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-site`}>Site</label>
        <input id={`${id}-site`} tabIndex={-1} autoComplete="off" value={dados.site} onChange={set("site")} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutro-700">A gente usa seu e-mail só para responder esta mensagem.</p>
        <Button type="submit" className="sm:w-60" disabled={enviar.isPending}>
          {enviar.isPending ? "Enviando…" : "Enviar mensagem"} <Send aria-hidden />
        </Button>
      </div>
    </form>
  );
}
