import { describe, expect, it } from 'vitest';
import { DeterministicRng } from '../../src/simulation/rng/DeterministicRng';

describe('DeterministicRng', () => {
  it('replays the same sequence for the same seed', () => {
    const first = new DeterministicRng(0x12345678);
    const second = new DeterministicRng(0x12345678);

    const firstSequence = Array.from({ length: 8 }, () => first.nextUint32());
    const secondSequence = Array.from({ length: 8 }, () => second.nextUint32());

    expect(firstSequence).toEqual(secondSequence);
  });
});
