import React, { useMemo, useState } from "react";
import type { Token } from "../lib/tokens";

type Props = {
  label: string;
  pricingLabel?: string;
  tokens: Token[];
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
};

export function TokenSelect({
  label,
  pricingLabel,
  tokens,
  value,
  onChange,
  disabled,
}: Props)
{
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tokens;
    return tokens.filter((t) => t.symbol.toLowerCase().includes(query));
  }, [q, tokens]);

  const selected = tokens.find((t) => t.symbol === value);

  return (
    <div style={{ width: "100%" }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="label">{label}</div>
        <div className="label">{pricingLabel ?? "USD pricing"}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: 10,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div className="row">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {selected ? (
              <img
                src={selected.iconUrl}
                alt={selected.symbol}
                width={22}
                height={22}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : null}
            <div style={{ fontWeight: 650 }}>
              {selected?.symbol ?? "Select token"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {selected ? `$${selected.price}` : ""}
            </div>
          </div>

          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.92)",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {tokens.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={disabled}
          placeholder="Search token (e.g., SWTH)"
          style={{
            width: "100%",
            padding: "10px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
          }}
        />

        <div
          style={{
            maxHeight: 140,
            overflow: "auto",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {filtered.map((t) => (
            <button
              key={t.symbol}
              type="button"
              disabled={disabled}
              onClick={() => onChange(t.symbol)}
              style={{
                width: "100%",
                textAlign: "left",
                background:
                  t.symbol === value ? "rgba(124,92,255,0.20)" : "transparent",
                border: 0,
                color: "rgba(255,255,255,0.92)",
                padding: "10px 10px",
                cursor: disabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={t.iconUrl}
                alt={t.symbol}
                width={18}
                height={18}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div style={{ fontWeight: 650, minWidth: 56 }}>{t.symbol}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                ${t.price}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
