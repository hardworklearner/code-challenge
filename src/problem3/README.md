# Problem 3 – Messy React Code Review & Refactor

## Problem Description

This project addresses **Problem 3: Messy React**.

The task is to:

1. Identify **computational inefficiencies**, **anti-patterns**, and **logic errors** in a given React + TypeScript code snippet.
2. Explain why they are problematic.
3. Provide a **refactored and improved version** of the code.

---

## Original Context

- ReactJS with TypeScript
- Functional components
- React Hooks (`useMemo`)
- A wallet page that displays user balances sorted by blockchain priority

---

## Key Issues Identified

### 1. Type Safety Violations

- `WalletBalance` interface does not define `blockchain`, yet it is accessed.
- Leads to compile-time and runtime errors.

### 2. Inline Helper Functions

- `getPriority` is defined inside the component.
- Recreated on every render.
- Reduces effectiveness of memoization.

### 3. Broken Filtering Logic

- Uses an undefined variable (`lhsPriority`).
- Logic incorrectly keeps balances with `amount <= 0`.
- Likely opposite of intended behavior.

### 4. Inefficient Sorting

- Priority is recomputed repeatedly inside `sort`.
- Causes unnecessary recalculations.

### 5. Incorrect `useMemo` Dependencies

- `prices` included in dependency array but never used.
- Causes needless recomputation.

### 6. Unused Computed Data

- `formattedBalances` is computed but never used.
- Dead code increases cognitive load.

### 7. Multiple Passes Over the Same Data

- Mapping the same array multiple times.
- Avoidable with a single transformation pipeline.

### 8. Unstable React Keys

- Uses array index as `key`.
- Causes reconciliation issues and unnecessary re-renders.

### 9. Missing Defensive Checks

- Accessing `prices[balance.currency]` without fallback.
- Results in `NaN` values.

### 10. Misuse of `useMemo`

- Used as a premature optimization.
- Logic inside is still inefficient.

---

## Refactored Design

### Improvements Made

- Fixed type definitions
- Extracted constants and helpers outside the component
- Combined filtering, mapping, and sorting into one pipeline
- Cached priority and USD values
- Used stable keys
- Corrected memo dependencies
- Improved readability and maintainability

---

## Refactored Code Example

```tsx
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

const getPriority = (chain: string): number => PRIORITY[chain] ?? -99;

const WalletPage: React.FC<Props> = ({ ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const processedBalances = useMemo<ProcessedBalance[]>(() => {
    return balances
      .map((b) => {
        const priority = getPriority(b.blockchain);
        const usdPrice = prices[b.currency] ?? 0;
        return {
          ...b,
          priority,
          formatted: b.amount.toFixed(2),
          usdValue: usdPrice * b.amount,
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

## Complexity Analysis

| Aspect               | Before                        | After                |
| -------------------- | ----------------------------- | -------------------- |
| Priority computation | Repeated                      | Cached               |
| Data passes          | Multiple                      | Single               |
| Sorting cost         | O(n log n) with recomputation | O(n log n) optimized |
| React keys           | Index                         | Stable               |
| Type safety          | Broken                        | Correct              |
