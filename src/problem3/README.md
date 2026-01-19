# Problem 3 – Messy React (Analysis & Refactor)

## Overview

This task reviews a React + TypeScript component containing logic bugs, performance inefficiencies, and React anti-patterns.

## Key Issues Identified

**Type mismatch**: WalletBalance uses blockchain but the field is not defined.

**Broken filter logic**: references lhsPriority (undefined) and keeps balances with amount <= 0.

**Repeated computation**: getPriority is recalculated multiple times during sorting.

**Incorrect useMemo deps**: prices included but unused in the original memo.

**Unused work**: formattedBalances is computed but never used.

**Multiple unnecessary passes**: redundant map operations.

**Unstable React keys**: uses array index while sorting.

**Unsafe price access**: prices[currency] may be undefined → NaN.

**Inline helpers & unused props**: getPriority defined inline; children unused.

## Refactoring Approach

Fix type definitions and runtime bugs.

Precompute derived values once.

Combine filtering, formatting, and USD calculation into a single memoized pass.

Use stable keys.

Align memo dependencies with actual usage.

## Refactored Code

```js
interface WalletBalance {
currency: string;
amount: number;
blockchain: string;
}

interface ProcessedBalance extends WalletBalance {
formatted: string;
usdValue: number;
priority: number;
}

const PRIORITY: Record<string, number> = {
Osmosis: 100,
Ethereum: 50,
Arbitrum: 30,
Zilliqa: 20,
Neo: 20,
};

const getPriority = (chain: string) => PRIORITY[chain] ?? -99;

const WalletPage: React.FC<Props> = ({ ...rest }) => {
const balances = useWalletBalances();
const prices = usePrices();

const processedBalances = useMemo(() => {
return balances
.map((b) => {
const priority = getPriority(b.blockchain);
return {
...b,
priority,
formatted: b.amount.toFixed(2),
usdValue: (prices[b.currency] ?? 0) \* b.amount,
};
})
.filter((b) => b.priority > -99 && b.amount > 0)
.sort((a, b) => b.priority - a.priority);
}, [balances, prices]);

return (

<div {...rest}>
{processedBalances.map((b) => (
<WalletRow
key={`${b.blockchain}:${b.currency}`}
className={classes.row}
amount={b.amount}
usdValue={b.usdValue}
formattedAmount={b.formatted}
/>
))}
</div>
);
};
```

## Outcome

- ✔ Fixed runtime and type errors

- ✔ Removed redundant computations

- ✔ Reduced sorting overhead

- ✔ Stabilized React reconciliation

- ✔ Improved readability and maintainability
