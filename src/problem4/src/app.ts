function checkIntegerInRange(n: number): void {
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new TypeError("Input must be a finite integer number.");
  }
  if (Math.abs(n) > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(
      `Input ${n} exceeds Number.MAX_SAFE_INTEGER (${Number.MAX_SAFE_INTEGER}).`
    );
  }
}

function sum_to_n_a(n: number): number {
  // O(1) time, O(1) space
  checkIntegerInRange(n);
  return (n * (n + 1)) / 2;
}

function sum_to_n_b(n: number): number {
  // O(n) time, O(1) space
  checkIntegerInRange(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}

function sum_to_n_c(n: number): number {
  // O(n) time, O(log n) space (recursion depth)
  checkIntegerInRange(n);

  function rangeSum(lo: number, hi: number): number {
    if (lo === hi) return lo;
    if (hi - lo === 1) return lo + hi;
    const mid = (lo + hi) >> 1;
    return rangeSum(lo, mid) + rangeSum(mid + 1, hi);
  }

  return rangeSum(1, n);
}

function renderResult(n: number): void {
  const resultEl = document.getElementById("result") as HTMLPreElement | null;
  if (!resultEl) throw new Error("Missing #result element.");

  const a = sum_to_n_a(n);
  const b = sum_to_n_b(n);
  const c = sum_to_n_c(n);

  resultEl.textContent =
    `The sum of integers from 1 to ${n} using method A is ${a}.\n` +
    `The sum of integers from 1 to ${n} using method B is ${b}.\n` +
    `The sum of integers from 1 to ${n} using method C is ${c}.\n`;
}

function main(): void {
  const inputEl = document.getElementById("nInput") as HTMLInputElement | null;
  const btnEl = document.getElementById("calcBtn") as HTMLButtonElement | null;
  const resultEl = document.getElementById("result") as HTMLPreElement | null;

  if (!inputEl || !btnEl || !resultEl) {
    throw new Error("UI elements not found. Check index.html ids.");
  }

  const run = () => {
    try {
      const n = Number(inputEl.value);
      renderResult(n);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      resultEl.textContent = `Error: ${message}\n`;
    }
  };

  btnEl.addEventListener("click", run);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run();
  });

  run(); // initial render
}

window.addEventListener("DOMContentLoaded", main);
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
