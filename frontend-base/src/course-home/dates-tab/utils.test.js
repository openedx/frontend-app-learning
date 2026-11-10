import { daycmp } from './utils';

describe('daycmp', () => {
  const day = new Date(2020, 5, 15, 12);

  it.each([
    ['an earlier year', new Date(2019, 5, 15), -1],
    ['a later year', new Date(2021, 5, 15), 1],
    ['an earlier month', new Date(2020, 4, 15), -1],
    ['a later month', new Date(2020, 6, 15), 1],
    ['an earlier day', new Date(2020, 5, 14), -1],
    ['a later day', new Date(2020, 5, 16), 1],
    ['another time the same day', new Date(2020, 5, 15, 23), 0],
  ])('compares %s as %i', (_, other, expected) => {
    expect(daycmp(other, day)).toBe(expected);
  });
});
