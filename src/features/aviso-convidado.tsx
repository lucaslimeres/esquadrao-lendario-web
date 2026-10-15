import { Link, useLocation } from "@tanstack/react-router";
import { useSessao } from "@/stores/sessao";

/** Shown while playing without an account: this game is not kept in any history. */
export function AvisoConvidado() {
  const modo = useSessao((s) => s.modo);
  const { pathname } = useLocation();
  if (modo === "conta") return null;
  return (
    <div className="mb-6 flex flex-col gap-2 border-2 border-neutro-400 bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p>
        <strong>Jogando sem conta.</strong> Esta campanha não fica salva no seu histórico.
      </p>
      <span className="flex shrink-0 gap-4 font-semibold">
        <Link to="/cadastro" search={{ redirect: pathname }} className="text-verde underline">
          Criar conta e salvar
        </Link>
        <Link to="/entrar" search={{ redirect: pathname }} className="underline">
          Entrar
        </Link>
      </span>
    </div>
  );
}
