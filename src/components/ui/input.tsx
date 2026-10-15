import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full border-2 border-neutro-400 bg-white px-3 text-base text-tinta placeholder:text-neutro-500 focus:border-tinta focus:outline-none aria-invalid:border-tinta",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("rotulo mb-2 block text-tinta", className)} {...props} />;
}

export function MensagemErro({ children, id }: { children?: string; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-semibold text-tinta">
      {children}
    </p>
  );
}
