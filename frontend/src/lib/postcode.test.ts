import { describe, it, expect } from 'vitest';
import { isValidUkPostcode } from './postcode';

describe('isValidUkPostcode', () => {
  it('accepts standard UK postcodes', () => {
    expect(isValidUkPostcode('SW1A 1AA')).toBe(true);
    expect(isValidUkPostcode('M1 1AA')).toBe(true);
    expect(isValidUkPostcode('HA3 7JT')).toBe(true);
    expect(isValidUkPostcode('EC1A 1BB')).toBe(true);
  });

  it('accepts postcodes without a space', () => {
    expect(isValidUkPostcode('SW1A1AA')).toBe(true);
    expect(isValidUkPostcode('M11AA')).toBe(true);
  });

  it('rejects clearly invalid postcodes', () => {
    expect(isValidUkPostcode('HELLO123')).toBe(false);
    expect(isValidUkPostcode('12345')).toBe(false);
    expect(isValidUkPostcode('ABC')).toBe(false);
    expect(isValidUkPostcode('INVALID')).toBe(false);
  });

  it('accepts an empty string (no postcode entered)', () => {
    expect(isValidUkPostcode('')).toBe(true);
  });

  it('accepts postcodes with extra whitespace', () => {
    expect(isValidUkPostcode('  SW1A 1AA  ')).toBe(true);
  });
});
