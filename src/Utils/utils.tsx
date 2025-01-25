export const convertDollarsToNaira = (dollars: number): number => {
    const conversionRate = 1700; // 1 USD = 750 NGN
    return dollars * conversionRate;
  };