export type PriceRow = {
  currency: string;
  date: string; // ISO string
  price: number;
};

export type Token = {
  symbol: string;
  price: number; // USD price
  iconUrl: string; // token icon
};

const PRICES_URL = "https://interview.switcheo.com/prices.json";
const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export async function fetchTokens(): Promise<Token[]> {
  const res = await fetch(PRICES_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch prices: ${res.status}`);

  const rows = (await res.json()) as PriceRow[];

  // If there are duplicates per currency, keep the latest-by-date.
  const latestBySymbol = new Map<string, PriceRow>();

  for (const r of rows) {
    const symbol = r?.currency?.trim();
    const price = r?.price;

    if (!symbol) continue;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0)
      continue;

    const prev = latestBySymbol.get(symbol);
    if (!prev) {
      latestBySymbol.set(symbol, r);
      continue;
    }

    // Compare ISO dates (fallback to "last seen" if date is invalid)
    const prevT = Date.parse(prev.date);
    const curT = Date.parse(r.date);
    if (Number.isFinite(curT) && (!Number.isFinite(prevT) || curT >= prevT)) {
      latestBySymbol.set(symbol, r);
    }
  }

  return Array.from(latestBySymbol.values())
    .map((r) => ({
      symbol: r.currency,
      price: r.price,
      iconUrl: `${ICON_BASE}/${encodeURIComponent(r.currency)}.svg`,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
