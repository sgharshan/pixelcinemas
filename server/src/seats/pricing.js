export function calculatePrice(seats, priceMap) {
  const items = {};
  let total = 0;
  for (const seat of seats) {
    const price = priceMap[seat.type];
    if (!Number.isFinite(price)) throw new Error(`No price configured for ${seat.type} seats`);
    items[seat.type] = (items[seat.type] ?? 0) + price;
    total += price;
  }
  return { total: Number(total.toFixed(2)), items };
}
