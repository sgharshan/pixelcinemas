export function generateSeatLayout({ rows, seatsPerRow, accessibleSeats = [], premiumRows = [], reclinerRows = [] }) {
  const accessible = new Set(accessibleSeats);
  const premium = new Set(premiumRows);
  const recliner = new Set(reclinerRows);
  return rows.flatMap((row, rowIndex) => Array.from({ length: seatsPerRow }, (_, index) => {
    const id = `${row}-${index + 1}`;
    return {
      id,
      row,
      rowIndex,
      number: index + 1,
      type: recliner.has(row) ? 'recliner' : premium.has(row) ? 'premium' : 'standard',
      accessible: accessible.has(id),
    };
  }));
}
