import { describe, expect, it } from 'vitest';
import {
  confirmTownFacility,
  createInitialAdventureState,
  moveTownSelection,
  selectTownFacility,
} from '../../src/domain/adventure-state';

describe('adventure state', () => {
  it('starts directly in Lumina with the town menu focused on the guild', () => {
    const state = createInitialAdventureState();

    expect(state.screen).toBe('town');
    expect(state.townId).toBe('lumina');
    expect(state.selectedFacility).toBe('guild');
    expect(state.facilities).toHaveLength(5);
    expect(state.party).toHaveLength(1);
  });

  it('cycles town menu selection in both directions', () => {
    const state = createInitialAdventureState();

    expect(moveTownSelection(state, 1).selectedFacility).toBe('inn');
    expect(moveTownSelection(state, -1).selectedFacility).toBe('gate');
  });

  it('confirms a town facility without entering combat', () => {
    const state = selectTownFacility(createInitialAdventureState(), 'gate');
    const confirmed = confirmTownFacility(state);

    expect(confirmed.screen).toBe('town');
    expect(confirmed.selectedFacility).toBe('gate');
    expect(confirmed.message).toContain('不会启动旧战斗原型');
  });
});
