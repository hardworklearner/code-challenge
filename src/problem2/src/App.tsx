// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import "./style/styles.css";
import { fetchTokens, type Token } from "./lib/tokens";
import { formatNumber } from "./lib/format";
import { TokenSelect } from "./components/TokenSelect";
import { NumberInput } from "./components/NumberInput";
import { Toast } from "./components/Toast";

type Quote = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  rate: number; // to per from
  fromUsd: number;
  toUsd: number;
};

const USD_PREFER_ORDER = ["USD", "USDC", "USDT", "DAI", "BUSD"];

function pickUsdToken(tokens: Token[]): string {
  for (const sym of USD_PREFER_ORDER) {
    const found = tokens.find((t) => t.symbol === sym);
    if (found) return found.symbol;
  }
  return tokens[0]?.symbol ?? "";
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export default function App() {
  const [tokens, setTokens] = useState<Token[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // Requirement: From defaults to "any token" (first), To defaults to USD-like
  const [fromSymbol, setFromSymbol] = useState<string>("");
  const [toSymbol, setToSymbol] = useState<string>("");

  const [amountRaw, setAmountRaw] = useState<string>("5");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchTokens();
        if (!alive) return;

        setTokens(list);

        const fromDefault = list[0]?.symbol ?? "";
        const usd = pickUsdToken(list);

        setFromSymbol(fromDefault);

        // Ensure To defaults to USD-like AND is different from From if possible
        const toDefault =
          usd && usd !== fromDefault
            ? usd
            : (list.find((t) => t.symbol !== fromDefault)?.symbol ??
              usd ??
              fromDefault);

        setToSymbol(toDefault);
      } catch (e) {
        if (!alive) return;
        setLoadErr(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const fromToken = useMemo(
    () => tokens?.find((t) => t.symbol === fromSymbol) ?? null,
    [tokens, fromSymbol],
  );
  const toToken = useMemo(
    () => tokens?.find((t) => t.symbol === toSymbol) ?? null,
    [tokens, toSymbol],
  );

  const fromPricingLabel = useMemo(() => {
    return fromToken ? `${fromToken.symbol} pricing` : "Pricing";
  }, [fromToken]);

  const toPricingLabel = useMemo(() => {
    if (!toToken) return "USD pricing";
    return `${toToken.symbol} pricing`;
  }, [toToken]);

  const amount = useMemo(() => parseAmount(amountRaw), [amountRaw]);

  const quote: Quote | null = useMemo(() => {
    if (!fromToken || !toToken) return null;
    if (!Number.isFinite(amount) || amount <= 0) return null;

    // USD pivot conversion
    const fromUsd = amount * fromToken.price;
    const toAmount = fromUsd / toToken.price;
    const rate = toAmount / amount;
    const toUsd = toAmount * toToken.price;

    return {
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      fromAmount: amount,
      toAmount,
      rate,
      fromUsd,
      toUsd,
    };
  }, [fromToken, toToken, amount]);

  const validationError = useMemo(() => {
    if (!tokens) return null;
    if (!fromSymbol || !toSymbol) return "Please select both tokens.";
    if (fromSymbol === toSymbol) return "From and To tokens must be different.";
    if (!Number.isFinite(amount)) return "Enter a valid number.";
    if (amount <= 0) return "Amount must be greater than 0.";
    return null;
  }, [tokens, fromSymbol, toSymbol, amount]);

  function flip() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validationError || !quote) return;

    setSubmitting(true);
    setToast(null);

    await new Promise((r) => setTimeout(r, 900)); // simulated backend delay

    setSubmitting(false);
    setToast(
      `Swap submitted: ${formatNumber(quote.fromAmount)} ${
        quote.fromSymbol
      } → ${formatNumber(quote.toAmount)} ${quote.toSymbol}`,
    );
    window.setTimeout(() => setToast(null), 2600);
  }

  function reset() {
    setAmountRaw("5");

    if (tokens) {
      const fromDefault = tokens[0]?.symbol ?? "";
      const usd = pickUsdToken(tokens);

      setFromSymbol(fromDefault);

      const toDefault =
        usd && usd !== fromDefault
          ? usd
          : (tokens.find((t) => t.symbol !== fromDefault)?.symbol ??
            usd ??
            fromDefault);

      setToSymbol(toDefault);
    }

    setToast("Reset form");
    window.setTimeout(() => setToast(null), 1400);
  }

  return (
    <div className="container">
      <Toast message={toast} />

      <div className="card">
        <div className="hero">
          <div className="heroTop">
            <div className="pill">Currency Swap</div>
            <div className="pill">
              {tokens ? `${tokens.length} tokens` : "Loading…"}
            </div>
          </div>

          <p className="heroKicker">Live pricing • USD pivot</p>

          <h1 className="heroTitle">
            Swap <span className="accent">Tokens</span>
            <br />
            With <span>Instant Quotes</span>
          </h1>

          <p className="heroSub">
            Pricing updates from a live feed. We compute rates via USD and
            simulate a backend submit for a realistic swap experience.
          </p>
        </div>

        <div className="body">
          {loadErr ? (
            <div className="panel">
              <div style={{ fontWeight: 650, marginBottom: 6 }}>
                Failed to load token prices
              </div>
              <div className="label">{loadErr}</div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="panel">
              {!tokens ? (
                <div>
                  <div className="row">
                    <div className="label">Fetching prices</div>
                    <div className="skeleton" />
                  </div>
                  <div className="divider" />
                  <div
                    className="skeleton"
                    style={{ width: "100%", height: 44 }}
                  />
                </div>
              ) : (
                <>
                  <TokenSelect
                    label="From"
                    pricingLabel={fromPricingLabel}
                    tokens={tokens}
                    value={fromSymbol}
                    onChange={setFromSymbol}
                    disabled={submitting}
                  />

                  <div className="divider" />

                  <NumberInput
                    label="Amount"
                    value={amountRaw}
                    onChange={setAmountRaw}
                    disabled={submitting}
                    placeholder="0.0"
                    rightHint={
                      fromToken && Number.isFinite(amount)
                        ? `≈ $${formatNumber(
                            (amount || 0) * fromToken.price,
                            2,
                          )}`
                        : ""
                    }
                  />

                  <div className="swapBtnWrap">
                    <button
                      className="swapBtn"
                      type="button"
                      onClick={flip}
                      disabled={submitting}
                      aria-label="Swap direction"
                    >
                      ⇅
                    </button>
                  </div>

                  <TokenSelect
                    label="To"
                    pricingLabel={toPricingLabel}
                    tokens={tokens}
                    value={toSymbol}
                    onChange={setToSymbol}
                    disabled={submitting}
                  />

                  <div className="quote" aria-live="polite">
                    {quote ? (
                      <>
                        <div className="row">
                          <span>Rate</span>
                          <span>
                            1 {quote.fromSymbol} ≈ {formatNumber(quote.rate)}{" "}
                            {quote.toSymbol}
                          </span>
                        </div>
                        <div className="row">
                          <span>You receive</span>
                          <span
                            style={{
                              color: "rgba(255,255,255,0.92)",
                              fontWeight: 650,
                            }}
                          >
                            {formatNumber(quote.toAmount)} {quote.toSymbol}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="label">
                        Enter an amount to see the quote.
                      </div>
                    )}
                  </div>

                  {validationError ? (
                    <div className="error">{validationError}</div>
                  ) : null}

                  <div className="actions">
                    <button
                      className="primary"
                      type="submit"
                      disabled={!!validationError || submitting || !quote}
                    >
                      {submitting ? "Swapping…" : "Swap"}
                    </button>

                    <button
                      className="secondary"
                      type="button"
                      disabled={submitting}
                      onClick={reset}
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
