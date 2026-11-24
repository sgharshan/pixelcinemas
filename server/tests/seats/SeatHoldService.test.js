import { SeatHoldService } from '../../src/seats/SeatHoldService.js';

test('holds atomically, renews for owner, expires and releases by owner', () => {
  let now = 1_000;
  const service = new SeatHoldService({ ttlMs: 500, now: () => now });
  expect(service.hold('show-1', ['A-1', 'A-2'], 'alex').ok).toBe(true);
  expect(service.hold('show-1', ['A-2', 'A-3'], 'sam')).toMatchObject({ ok: false, conflictSeatIds: ['A-2'] });
  expect(service.getActive('show-1')).toHaveLength(2);
  now = 1_200;
  const renewed = service.hold('show-1', ['A-1'], 'alex');
  expect(renewed.holds[0].expiresAt).toBe(1_700);
  service.releaseOwner('sam');
  expect(service.getActive('show-1')).toHaveLength(2);
  now = 2_000;
  expect(service.expire()).toHaveLength(2);
  expect(service.getActive('show-1')).toHaveLength(0);
});
