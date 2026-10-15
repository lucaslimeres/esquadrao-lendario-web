import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialogo } from "@/components/ui/dialog";
import { Erro } from "@/components/ui/estados";
import { mensagemErro } from "@/lib/api";

/** Delete button with a confirmation dialog; shows the API's refusal (e.g. "em uso") inline. */
export function BotaoExcluir({ rotulo = "Excluir", titulo, mensagem, aoConfirmar, aoConcluir }: {
  rotulo?: string;
  titulo: string;
  mensagem: string;
  aoConfirmar: () => Promise<unknown>;
  aoConcluir?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const excluir = useMutation({
    mutationFn: aoConfirmar,
    onSuccess: () => {
      setAberto(false);
      aoConcluir?.();
    },
  });
  return (
    <>
      <Button variant="contorno" tamanho="pequeno" onClick={() => { excluir.reset(); setAberto(true); }}>
        {rotulo} <Trash2 aria-hidden />
      </Button>
      <Dialogo aberto={aberto} aoMudar={setAberto} titulo={titulo}>
        <p className="mb-4">{mensagem}</p>
        {excluir.error && (
          <div className="mb-4">
            <Erro mensagem={mensagemErro(excluir.error, "Não deu para excluir.")} />
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="tinta" disabled={excluir.isPending} onClick={() => excluir.mutate()} className="sm:w-48">
            {excluir.isPending ? "Excluindo…" : "Sim, excluir"}
          </Button>
          <Button variant="contorno" onClick={() => setAberto(false)} className="sm:w-40">
            Cancelar
          </Button>
        </div>
      </Dialogo>
    </>
  );
}
