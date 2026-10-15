import { render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EspacoPublicidade } from "@/components/anuncio";
import { config } from "@/lib/config";

const original = structuredClone(config.anuncios);

beforeEach(() => {
  window.adsbygoogle = [];
  document.getElementById("adsbygoogle-js")?.remove();
});
afterEach(() => {
  config.anuncios = structuredClone(original);
});

describe("EspacoPublicidade", () => {
  it("sem AdSense configurado não renderiza nada nem carrega script", () => {
    config.anuncios = { ...original, cliente: null, previa: false };
    const { container } = render(<EspacoPublicidade posicao="landing" />);
    expect(container).toBeEmptyDOMElement();
    expect(document.getElementById("adsbygoogle-js")).toBeNull();
  });

  it("posição sem bloco configurado fica de fora", () => {
    config.anuncios = { ...original, cliente: "ca-pub-1234567890123456", slots: { ...original.slots, landing: null }, previa: false };
    const { container } = render(<EspacoPublicidade posicao="landing" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("com cliente e bloco: faixa identificada, script único e um pedido por anúncio", () => {
    config.anuncios = {
      ...original,
      cliente: "ca-pub-1234567890123456",
      slots: { ...original.slots, landing: "111", fimDeCampanha: "222" },
    };
    render(
      <StrictMode>
        <EspacoPublicidade posicao="landing" />
        <EspacoPublicidade posicao="fimDeCampanha" />
      </StrictMode>,
    );
    expect(screen.getAllByRole("complementary", { name: "Publicidade" })).toHaveLength(2);
    const unidades = document.querySelectorAll("ins.adsbygoogle");
    expect([...unidades].map((u) => u.getAttribute("data-ad-slot"))).toEqual(["111", "222"]);
    expect(unidades[0]).toHaveAttribute("data-ad-client", "ca-pub-1234567890123456");
    expect(unidades[0]).not.toHaveAttribute("data-ad-format");
    expect(document.querySelectorAll("#adsbygoogle-js")).toHaveLength(1);
    expect(document.getElementById("adsbygoogle-js")?.getAttribute("src")).toContain("client=ca-pub-1234567890123456");
    // StrictMode runs the effect twice per unit: still one push each.
    expect(window.adsbygoogle).toHaveLength(2);
  });

  it("prévia mostra o espaço sem falar com o Google", () => {
    config.anuncios = { ...original, cliente: null, previa: true };
    render(<EspacoPublicidade posicao="compartilhada" />);
    expect(screen.getByText("Espaço do anúncio")).toBeInTheDocument();
    expect(document.getElementById("adsbygoogle-js")).toBeNull();
  });
});
