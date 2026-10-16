import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useSessao } from "@/stores/sessao";
import { Logo } from "./logo";
import { Button } from "./ui/button";

export function Cabecalho() {
  const { modo, sessao, sair } = useSessao();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const logado = modo === "conta";

  const links = (
    <>
      <Link to="/" hash="como-funciona" className="font-semibold hover:text-verde" onClick={() => setAberto(false)}>
        Como funciona
      </Link>
      <Link to="/" hash="app" className="font-semibold hover:text-verde" onClick={() => setAberto(false)}>
        Baixe o app
      </Link>
      <Link to="/grupos" className="font-semibold hover:text-verde" onClick={() => setAberto(false)}>
        Em grupo
      </Link>
      {logado ? (
        <>
          <Link to="/minhas-campanhas" className="font-semibold hover:text-verde" onClick={() => setAberto(false)}>
            Minhas campanhas
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 font-semibold hover:text-verde"
            onClick={() => {
              sair();
              setAberto(false);
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" aria-hidden /> Sair{sessao?.usuario.nome ? ` (${sessao.usuario.nome.split(" ")[0]})` : ""}
          </button>
        </>
      ) : (
        <Link to="/entrar" className="font-semibold hover:text-verde" onClick={() => setAberto(false)}>
          Entrar
        </Link>
      )}
    </>
  );

  return (
    <header className="border-b-2 border-tinta bg-papel">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" aria-label="Esquadrão Lendário — início">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {links}
          <Button asChild tamanho="pequeno">
            <Link to="/jogar">Jogar agora</Link>
          </Button>
        </nav>
        <button type="button" className="inline-flex size-11 items-center justify-center md:hidden" aria-label={aberto ? "Fechar menu" : "Abrir menu"} aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>
          {aberto ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>
      {aberto && (
        <nav className="flex flex-col gap-4 border-t-2 border-tinta px-4 py-4 md:hidden" aria-label="Principal">
          {links}
          <Button asChild>
            <Link to="/jogar" onClick={() => setAberto(false)}>
              Jogar agora
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="mt-16 border-t-2 border-tinta">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[auto_1fr] sm:items-start">
        <Logo />
        <div className="space-y-2 text-sm text-neutro-700 sm:justify-self-end sm:text-right">
          <p>
            <Link to="/" hash="fale-conosco" className="font-semibold text-tinta underline-offset-4 hover:underline">
              Fale conosco
            </Link>
            {" · "}
            <Link to="/privacidade" className="font-semibold text-tinta underline-offset-4 hover:underline">
              Privacidade
            </Link>
          </p>
          <p>Clubes aparecem só pelo nome e ano. Nenhum escudo, logo ou foto oficial é usado.</p>
          <p>© {new Date().getFullYear()} Esquadrão Lendário</p>
        </div>
      </div>
    </footer>
  );
}

export function Pagina({ children, larga = false }: { children: ReactNode; larga?: boolean }) {
  return <main className={larga ? "mx-auto w-full max-w-6xl px-4 py-8" : "mx-auto w-full max-w-3xl px-4 py-8"}>{children}</main>;
}

export function TituloPagina({ rotulo, children }: { rotulo?: string; children: ReactNode }) {
  return (
    <div className="mb-8 border-b-2 border-tinta pb-4">
      {rotulo && <p className="rotulo mb-2 text-verde">{rotulo}</p>}
      <h1 className="font-display text-4xl sm:text-5xl">{children}</h1>
    </div>
  );
}
