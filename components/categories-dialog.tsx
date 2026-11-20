"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetFrame,
  SheetHeader,
  sheetBodyClass,
  sheetFooterClass,
  sheetFormClass,
} from "@/components/sheet-frame";
import { useI18n } from "@/components/i18n";
import { type Category, sameName } from "@/lib/budget";
import { displayCategoryName } from "@/lib/i18n";

function CategoryRow({
  category,
  canRemove,
  used,
  siblings,
  onRename,
  onRemove,
}: {
  category: Category;
  canRemove: boolean;
  used: boolean;
  siblings: Category[];
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const { locale, t } = useI18n();
  const shown = displayCategoryName(category, locale);
  const [name, setName] = useState(shown);
  const [error, setError] = useState("");

  function commit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(shown);
      setError("");
      return;
    }
    if (sameName(trimmed, shown, locale)) {
      setError("");
      return;
    }
    const taken = siblings.some(
      (item) =>
        item.id !== category.id &&
        (sameName(item.name, trimmed, locale) || sameName(displayCategoryName(item, locale), trimmed, locale)),
    );
    if (taken) {
      setError(t("nameExists"));
      return;
    }
    setError("");
    setName(trimmed);
    onRename(trimmed);
  }

  return (
    <li className="grid gap-2 border-b border-border py-4">
      <Label htmlFor={`category-${category.id}`} className="sr-only">
        {t("nameOf", { name: shown })}
      </Label>
      <Input
        id={`category-${category.id}`}
        value={name}
        maxLength={40}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {error || (used ? t("alreadyUsed") : t("unused"))}
        </p>
        {canRemove && !used && (
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={onRemove}>
            {t("remove")}
          </button>
        )}
      </div>
    </li>
  );
}

export function CategoriesDialog({
  categories,
  usedIds,
  onClose,
  onRename,
  onAdd,
  onRemove,
}: {
  categories: Category[];
  usedIds: Set<string>;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  const { locale, t } = useI18n();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (
      categories.some(
        (category) =>
          sameName(category.name, trimmed, locale) || sameName(displayCategoryName(category, locale), trimmed, locale),
      )
    ) {
      setError(t("nameExists"));
      return;
    }
    onAdd(trimmed);
    setDraft("");
    setError("");
  }

  return (
    <SheetFrame open onOpenChange={(next) => !next && onClose()}>
      <form
        className={sheetFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <SheetHeader title={t("envelopes")} description={t("categoriesHelp")} />
        <div className={sheetBodyClass}>
          <ul>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                siblings={categories}
                canRemove={categories.length > 1}
                used={usedIds.has(category.id)}
                onRename={(name) => onRename(category.id, name)}
                onRemove={() => onRemove(category.id)}
              />
            ))}
          </ul>
          <div className="mt-6 grid gap-2">
            <Label htmlFor="new-category">{t("newEnvelope")}</Label>
            <Input
              id="new-category"
              value={draft}
              maxLength={40}
              placeholder={t("categoryPlaceholder")}
              onChange={(event) => {
                setDraft(event.target.value);
                setError("");
              }}
            />
            {error && <p className="text-sm text-primary">{error}</p>}
          </div>
        </div>
        <div className={sheetFooterClass}>
          <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={draft.trim() === ""}>
            {t("add")}
          </Button>
        </div>
      </form>
    </SheetFrame>
  );
}
