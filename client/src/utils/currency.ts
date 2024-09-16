export const convertToCurrency = (value: number) => {
  const currency = {
    platinum: 0,
    gold: 0,
    silver: 0,
    copper: 0,
  };

  currency.platinum = Math.floor(value / 1000);
  value %= 1000;

  currency.gold = Math.floor(value / 100);
  value %= 100;

  currency.silver = Math.floor(value / 10);
  value %= 10;

  currency.copper = value;

  const parts: string[] = [];

  if (currency.platinum > 0) {
    parts.push(`${currency.platinum} pp`);
  }
  if (currency.gold > 0) {
    parts.push(`${currency.gold} gp`);
  }
  if (currency.silver > 0) {
    parts.push(`${currency.silver} sp`);
  }
  if (currency.copper > 0) {
    parts.push(`${currency.copper} cp`);
  }

  return parts.join(', ');
};
