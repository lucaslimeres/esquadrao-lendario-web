import { LoaderCircle, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-neutro-700">
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      <span>{texto}</span>
    </div>
  );
}

export function Erro({ mensagem, tentarDeNovo, children }: { mensagem: string; tentarDeNovo?: () => void; children?: ReactNode }) {
  return (
    <div role="alert" className="regua border-neutro-400 bg-white p-4">
      <p className="flex items-start gap-2 font-semibold">
        <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        {mensagem}
      </p>
      {tentarDeNovo && (
        <Button variant="link" className="mt-2" onClick={tentarDeNovo}>
          Tentar de novo
        </Button>
      )}
      {children}
    </div>
  );
}
