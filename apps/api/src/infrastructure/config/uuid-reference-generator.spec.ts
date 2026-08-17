import { UuidReferenceGenerator } from './uuid-reference-generator';

describe('UuidReferenceGenerator', () => {
  it('generates unique prefixed references', () => {
    const generator = new UuidReferenceGenerator();
    const first = generator.generate();
    const second = generator.generate();

    expect(first).toMatch(/^PGP-[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
  });
});
