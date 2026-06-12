"use client";

import { useEffect, useState } from "react";

type Props = {
  productSlug: string;
  productName: string;
};

export default function ExclusiveCodePanel({ productSlug, productName }: Props) {
  const [isExclusive, setIsExclusive] = useState(false);
  const [code, setCode] = useState("");
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [codeId, setCodeId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { user?: { role?: string } }) => {
        if (data.user?.role === "EXCLUSIVE") {
          setIsExclusive(true);
          return fetch("/api/mi-cuenta/codigos");
        }
        setChecked(true);
        return null;
      })
      .then((r) => r?.json())
      .then((data?: { codes?: { id: string; productSlug: string; customCode: string }[] }) => {
        if (!data) return;
        const existing = data.codes?.find((c) => c.productSlug === productSlug);
        if (existing) {
          setSavedCode(existing.customCode);
          setCodeId(existing.id);
          setCode(existing.customCode);
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [productSlug]);

  const handleSave = async () => {
    if (!code.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mi-cuenta/codigos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, productName, customCode: code.trim() }),
      });
      const data = (await res.json()) as { code?: { id: string; customCode: string } };
      if (data.code) {
        setSavedCode(data.code.customCode);
        setCodeId(data.code.id);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!codeId) return;
    setSaving(true);
    try {
      await fetch(`/api/mi-cuenta/codigos/${codeId}`, { method: "DELETE" });
      setSavedCode(null);
      setCodeId(null);
      setCode("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!checked || !isExclusive) return null;

  return (
    <div className="rounded-[1.2rem] border border-[#16384f]/10 bg-[#f0f7ff] p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#16384f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#16384f]">
          Mi referencia interna
        </p>
      </div>

      {savedCode && !editing ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-[#16384f]">{savedCode}</p>
            <p className="text-xs text-[#6e7379]">Tu código para este producto</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setEditing(true); setCode(savedCode); }}
              className="rounded-full border border-[#16384f]/20 px-3 py-1.5 text-xs font-semibold text-[#16384f] transition-colors hover:bg-[#16384f] hover:text-white"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); }}
            placeholder="Ej: PEP 2203"
            maxLength={30}
            className="flex-1 rounded-xl border border-[#16384f]/15 bg-white px-3 py-2 text-sm font-semibold text-[#16384f] outline-none placeholder:font-normal placeholder:text-[#a0a6ae] focus:border-[#16384f]/40"
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !code.trim()}
            className="rounded-xl bg-[#16384f] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f2638] disabled:opacity-50"
          >
            {saving ? "..." : "Guardar"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => { setEditing(false); setCode(savedCode ?? ""); }}
              className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-[#6e7379] transition-colors hover:bg-white"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
