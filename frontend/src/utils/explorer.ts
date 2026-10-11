export function getTronscanAddressUrl(address: string): string {
  const cleanAddr = address.trim();
  return `https://tronscan.org/#/address/${cleanAddr}`;
}

export function getTronscanTxUrl(tx: string): string {
  const cleanTx = tx.trim();
  return `https://tronscan.org/#/transaction/${cleanTx}`;
}
