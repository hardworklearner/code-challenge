# Problem 4 – Three Ways to Sum to N (TypeScript)

## Problem Description

Implemented **Problem 4: Three ways to sum to n** using **TypeScript**.

The task is to provide **three unique implementations** of a function that computes the sum of integers from `1` to `n`, along with a brief explanation of the **time and space complexity** of each approach.
sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15

---

## Requirements

- Language: **TypeScript**
- Input: `n` (any integer)
- Output: sum of integers from `1` to `n`
- The result is guaranteed to be less than `Number.MAX_SAFE_INTEGER`
- Provide **three different implementations**
- Explain **complexity / efficiency** of each method
- Handle invalid input safely

---

## Implementations

### Common Input Validation

All methods share a validation step:

- Input must be a finite integer
- Absolute value must not exceed `Number.MAX_SAFE_INTEGER`

Invalid input throws:

- `TypeError` for non-integer values
- `RangeError` for unsafe values

---

### Method A – Mathematical Formula

Uses the arithmetic series formula:

```ts
sum = n × (n + 1) / 2
```

### Complexity

- Time: O(1)

- Space: O(1)

## Pros

- Fastest and most efficient

- No loops or recursion

## Cons

- Requires careful input validation

- Relies on mathematical insight

---

## Method B – Iterative Loop

Uses a simple loop to accumulate the sum.

```js
let sum = 0;
for (let i = 1; i <= n; i++) {
  sum += i;
}
```

### Complexity

- Time: O(n)

- Space: O(1)

### Pros

- Easy to read and understand

- Straightforward implementation

## Cons

- Slower for large n compared to formula

## Method C – Divide and Conquer (Recursion)

Splits the range and sums recursively.

```js
sum(1..n) = sum(1..mid) + sum(mid+1..n)
```

### Complexity

- Time: O(n)

- Space: O(log n) (recursion depth)

### Pros

- Demonstrates recursive problem solving

- Avoids linear recursion depth

### Cons

- More complex than iterative approach

- Additional stack usage

## Example Output

For n = 5, all methods produce:

```js
For n = 5, all methods produce:
all of methods return 15.
```

## How to Run

### Compile TypeScript

```bash
tsc
```

### Run in Broswer

Run command

```bash
npm serve .
```

Then open:

```bash
http://localhost:3000
```

### Notes

Method A is preferred in production due to constant time complexity.

Methods B and C are included to demonstrate alternative reasoning styles.

The UI is intentionally minimal; focus is on algorithmic correctness.Notes

Method A is preferred in production due to constant time complexity.

Methods B and C are included to demonstrate alternative reasoning styles.

The UI is intentionally minimal; focus is on algorithmic correctness.
