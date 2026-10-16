import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CampoCodigo, ReenviarCodigo } from "@/features/codigo";
import { api } from "@/lib/api";

function Campo({ onCompleto }: { onCompleto: (v: string) => void }) {
  const [valor, setValor] = useState("");
  return <CampoCodigo valor={valor} onChange={setValor} onCompleto={onCompleto} />;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CampoCodigo", () => {
  it("aceita só números, no máximo 6, e avisa quando completa", () => {
    const onCompleto = vi.fn();
    render(<Campo onCompleto={onCompleto} />);
    const campo = screen.getByLabelText("Código");
    expect(campo).toHaveAttribute("autocomplete", "one-time-code");
    expect(campo).toHaveAttribute("inputmode", "numeric");
    fireEvent.change(campo, { target: { value: "12a3" } });
    expect(campo).toHaveValue("123");
    expect(onCompleto).not.toHaveBeenCalled();
    // Pasting "123 456" from the e-mail works too.
    fireEvent.change(campo, { target: { value: "123 4567" } });
    expect(campo).toHaveValue("123456");
    expect(onCompleto).toHaveBeenCalledWith("123456");
  });
});

describe("ReenviarCodigo", () => {
  it("só libera depois de 60 segundos e reinicia a espera", async () => {
    vi.useFakeTimers();
    const reenviar = vi.spyOn(api, "reenviarCodigo").mockResolvedValue({ enviado: true });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ReenviarCodigo email="ana@exemplo.com" finalidade="confirmar_email" />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("button", { name: "Reenviar código em 60s" })).toBeDisabled();
    for (let i = 0; i < 60; i++) {
      await act(async () => vi.advanceTimersByTime(1000));
    }
    const botao = screen.getByRole("button", { name: "Reenviar código" });
    expect(botao).toBeEnabled();
    await act(async () => fireEvent.click(botao));
    expect(reenviar).toHaveBeenCalledWith({ email: "ana@exemplo.com", finalidade: "confirmar_email" });
    expect(screen.getByRole("status")).toHaveTextContent("Código novo enviado");
    expect(screen.getByRole("button", { name: /Reenviar código em 60s/ })).toBeDisabled();
  });
});
