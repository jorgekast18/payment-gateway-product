import { andThen, andThenAsync, err, isErr, isOk, map, ok } from './result';

describe('Result', () => {
  it('builds an ok result', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    expect(result.ok ? result.value : null).toBe(42);
  });

  it('builds an err result', () => {
    const result = err('boom');
    expect(isErr(result)).toBe(true);
    expect(isOk(result)).toBe(false);
    expect(result.ok ? null : result.error).toBe('boom');
  });

  it('maps over an ok value', () => {
    const result = map(ok(2), (value) => value * 3);
    expect(result).toEqual(ok(6));
  });

  it('does not map over an err value', () => {
    const result = map(err<string>('nope'), (value: number) => value * 3);
    expect(result).toEqual(err('nope'));
  });

  it('chains ok values with andThen', () => {
    const result = andThen(ok(2), (value) => ok(value + 1));
    expect(result).toEqual(ok(3));
  });

  it('short-circuits andThen on err', () => {
    const result = andThen(err<string>('stop'), (value: number) => ok(value + 1));
    expect(result).toEqual(err('stop'));
  });

  it('chains ok values with andThenAsync', async () => {
    const result = await andThenAsync(ok(2), (value) => Promise.resolve(ok(value + 5)));
    expect(result).toEqual(ok(7));
  });

  it('short-circuits andThenAsync on err', async () => {
    const result = await andThenAsync(err<string>('stop'), (value: number) =>
      Promise.resolve(ok(value + 5)),
    );
    expect(result).toEqual(err('stop'));
  });
});
