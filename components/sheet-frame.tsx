"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";

const sheetClass = cn(
  "top-0 left-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none bg-background p-0 ring-0",
  "sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[min(92dvh,880px)] sm:w-[min(28rem,calc(100%-2rem))] sm:max-w-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-y-auto sm:rounded-[1.75rem]",
);

export function SheetFrame({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={sheetClass}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function SheetHeader({ title, description }: { title: string; description: string }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 bg-background px-5 pt-6 pb-3">
      <DialogHeader className="gap-1">
        <DialogTitle className="font-heading text-[1.65rem] leading-none font-normal tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
      </DialogHeader>
      <DialogClose className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        {t("close")}
      </DialogClose>
    </header>
  );
}

export const sheetFormClass = "flex min-h-0 flex-1 flex-col sm:flex-none";
export const sheetBodyClass = "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 sm:flex-none sm:overflow-visible";
export const sheetFooterClass =
  "shrink-0 border-t border-border/80 bg-background px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]";
