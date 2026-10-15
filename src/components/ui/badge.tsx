import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      lendario: "bg-verde-100 text-verde",
      avancou: "bg-verde-100 text-verde",
      eliminado: "bg-white text-neutro-800",
      embreve: "bg-white text-neutro-700",
      contorno: "border-2 border-verde text-verde",
      tinta: "bg-tinta text-papel",
    },
  },
  defaultVariants: { variant: "embreve" },
});

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
