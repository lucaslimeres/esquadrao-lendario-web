import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Brand: square corners, left-aligned labels, 44px+ touch targets.
const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-between gap-3 px-4 text-left font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primario: "bg-verde text-white hover:bg-verde-800",
        contorno: "border-2 border-neutro-400 bg-transparent text-tinta hover:border-tinta",
        tinta: "bg-tinta text-papel hover:bg-neutro-800",
        link: "min-h-0 justify-start px-0 text-verde underline-offset-4 hover:underline",
      },
      tamanho: {
        padrao: "h-12 text-base",
        grande: "h-14 text-lg",
        pequeno: "h-11 text-sm",
      },
    },
    defaultVariants: { variant: "primario", tamanho: "padrao" },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, tamanho, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, tamanho }), className)} {...props} />;
}
