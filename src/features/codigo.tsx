import { useMutation } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, MensagemErro } from "@/components/ui/input";
import { api, mensagemErro } from "@/lib/api";
import type { FinalidadeCodigo } from "@/lib/tipos";

export const DIGITOS_CODIGO = 6;
/** Same gap the API enforces between two codes. */
export const ESPERA_REENVIO_S = 60;

/** One numeric field (the phone offers the code from the e-mail/SMS bar): only digits, 6 max. */
export function CampoCodigo({ valor, onChange, erro, onCompleto }: { valor: string; onChange: (v: string) => void; erro?: string; onCompleto?: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>Código</Label>
      <Input
        id={id}
        value={valor}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={DIGITOS_CODIGO}
        placeholder="000000"
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="h-16 font-display text-3xl tracking-[0.4em] placeholder:text-neutro-300"
        onChange={(e) => {
          const digitos = e.target.value.replace(/\D/g, "").slice(0, DIGITOS_CODIGO);
          onChange(digitos);
          if (digitos.length === DIGITOS_CODIGO && digitos !== valor) onCompleto?.(digitos);
        }}
      />
      <MensagemErro id={`${id}-erro`}>{erro}</MensagemErro>
    </div>
  );
}

/** "Reenviar código", available again after the same wait the API applies. */
export function ReenviarCodigo({ email, finalidade }: { email: string; finalidade: FinalidadeCodigo }) {
  const [restante, setRestante] = useState(ESPERA_REENVIO_S);
  const reenviar = useMutation({
    mutationFn: () => api.reenviarCodigo({ email, finalidade }),
    onSuccess: () => setRestante(ESPERA_REENVIO_S),
  });

  useEffect(() => {
    if (restante <= 0) return;
    const t = window.setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [restante]);

  return (
    <div className="space-y-2 text-sm">
      {reenviar.isSuccess && restante > 0 && <p role="status">Código novo enviado. Confira a caixa de entrada e o spam.</p>}
      {reenviar.isError && <p role="alert" className="font-semibold">{mensagemErro(reenviar.error)}</p>}
      <Button variant="link" disabled={restante > 0 || reenviar.isPending} onClick={() => reenviar.mutate()}>
        {restante > 0 ? `Reenviar código em ${restante}s` : reenviar.isPending ? "Enviando…" : "Reenviar código"}
      </Button>
    </div>
  );
}
