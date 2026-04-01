import { upgradeIsAvailable } from './utils';

describe('upgradeIsAvailable', () => {
  it('returns true when course has a verifiedMode object', () => {
    expect(upgradeIsAvailable({ course: { verifiedMode: { price: 100, currency: 'USD' } } })).toBe(true);
  });

  it('returns true when verifiedMode is truthy (non-null)', () => {
    expect(upgradeIsAvailable({ course: { verifiedMode: {} } })).toBe(true);
  });

  it('returns false when verifiedMode is null', () => {
    expect(upgradeIsAvailable({ course: { verifiedMode: null } })).toBe(false);
  });

  it('returns false when verifiedMode is undefined', () => {
    expect(upgradeIsAvailable({ course: { verifiedMode: undefined } })).toBe(false);
  });

  it('returns false when course is null', () => {
    expect(upgradeIsAvailable({ course: null })).toBe(false);
  });

  it('returns false when course is undefined', () => {
    expect(upgradeIsAvailable({ course: undefined })).toBe(false);
  });

  it('returns false when called with an empty object', () => {
    expect(upgradeIsAvailable({})).toBe(false);
  });

  it('returns false when verifiedMode is false', () => {
    expect(upgradeIsAvailable({ course: { verifiedMode: false } })).toBe(false);
  });
});
