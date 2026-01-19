function checkIntegerInRange(n) {
  if (!Number.isSafeInteger(n)) {
    throw new RangeError(
      `Value ${n} exceeds JavaScript safe integer limits (±${Number.MAX_SAFE_INTEGER}).`
    );
  }
}

var sum_to_n_a = function (n) {
  checkIntegerInRange(n);
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n) {
  checkIntegerInRange(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

function sum_to_n_c(n) {
  checkIntegerInRange(n);

  function helper(lo, hi) {
    if (lo === hi) return lo;
    if (hi - lo === 1) return lo + hi;

    const mid = (lo + hi) >> 1;
    return helper(lo, mid) + helper(mid + 1, hi);
  }

  return helper(1, n);
}
