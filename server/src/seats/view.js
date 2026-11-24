export function calculateSeatView(seat, layout) {
  const seatsInRow = layout.filter((candidate) => candidate.row === seat.row);
  const centre = (seatsInRow.length + 1) / 2;
  const horizontal = seat.number - centre;
  const offsetMetres = Number((horizontal * 0.65).toFixed(2));
  const distanceMetres = Number((4.5 + seat.rowIndex * 1.15).toFixed(2));
  const angleDegrees = Number((Math.atan2(offsetMetres, distanceMetres) * 180 / Math.PI).toFixed(1));
  const absoluteAngle = Math.abs(angleDegrees);
  return {
    distanceMetres,
    offsetMetres,
    angleDegrees,
    qualityLabel: absoluteAngle < 6 ? 'Central view' : absoluteAngle < 14 ? 'Good angled view' : 'Side view',
    transform: {
      translateXPercent: Math.max(-24, Math.min(24, Number((angleDegrees * 1.35).toFixed(1)))),
      scale: Number(Math.max(0.78, 1 - seat.rowIndex * 0.035).toFixed(2)),
    },
  };
}
