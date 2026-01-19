# Problem 1 – Three Ways to Sum to N

## Problem Description

Implements **Problem 1: Three ways to sum to n**.

The task is to provide **three unique implementations** of a function that computes the sum of integers from `1` to `n`:

sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15

The implementations demonstrate different **algorithmic approaches**, **performance characteristics**, and **trade-offs**.

---

## Requirements

- Input: `n` (any integer)
- Output: sum of integers from `1` to `n`
- Result is guaranteed to be less than `Number.MAX_SAFE_INTEGER`
- Implement **three different methods**
- Handle invalid input safely

---

## Implementations

### Method A – Mathematical Formula

Uses the arithmetic series formula.

```ts
sum = n × (n + 1) / 2
```

Complexity

Time: O(1)

Space: O(1)

Pros

Fastest and most efficient

No loops or recursion

Cons

Requires understanding of mathematical formula

Must validate integer bounds carefully

---

## Method B – Iterative Loop

Accumulates the sum using a loop.

```js
let sum = 0;
for (let i = 1; i <= n; i++) sum += i;
```

Complexity

Time: O(n)

Space: O(1)

Pros

Simple and readable

Easy to reason about

Cons

Slower for large n

## Method C – Divide and Conquer (Recursion)

Splits the range and sums recursively.

```js
sum(1..n) = sum(1..mid) + sum(mid+1..n)
```

Complexity

Time: O(n)

Space: O(log n) (recursion stack)

Pros

Demonstrates recursive problem solving

Avoids deep linear recursion

Cons

More complex

Slower than formula approach

## Input Validation

All methods share a common validation step:

Input must be a finite integer

Absolute value must not exceed Number.MAX_SAFE_INTEGER

Invalid input throws an appropriate error:

TypeError for non-integers

RangeError for unsafe values

## How to Run

Open index.html in a browser.
