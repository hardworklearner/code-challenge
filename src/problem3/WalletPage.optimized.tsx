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
