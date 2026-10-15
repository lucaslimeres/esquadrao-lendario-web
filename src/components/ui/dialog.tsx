import { X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import type { ReactNode } from "react";

interface Props {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
}

/** Modal with square corners and 2px rule (brand), built on radix-ui's Dialog. */
export function Dialogo({ aberto, aoMudar, titulo, descricao, children }: Props) {
  return (
    <D.Root open={aberto} onOpenChange={aoMudar}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-40 bg-tinta/60" />
        <D.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border-2 border-tinta bg-papel p-5 focus:outline-none">
          <div className="mb-4 flex items-start justify-between gap-4 border-b-2 border-tinta pb-3">
            <div>
              <D.Title className="text-xl font-bold">{titulo}</D.Title>
              {descricao ? (
                <D.Description className="mt-1 text-sm text-neutro-700">{descricao}</D.Description>
              ) : (
                <D.Description className="sr-only">{titulo}</D.Description>
              )}
            </div>
            <D.Close className="inline-flex size-9 items-center justify-center hover:bg-gramado" aria-label="Fechar">
              <X className="size-5" aria-hidden />
            </D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
