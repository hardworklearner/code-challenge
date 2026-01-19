import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rightHint?: React.ReactNode;
};

export function NumberInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  rightHint,
}: Props) {
  return (
    <div style={{ width: "100%" }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="label">{label}</div>
        <div className="label">{rightHint}</div>
      </div>

      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? "0.0"}
        style={{
          width: "100%",
          padding: "14px 12px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.92)",
          outline: "none",
          fontSize: 18,
          fontWeight: 650,
        }}
      />
    </div>
  );
}
