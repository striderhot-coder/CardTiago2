/**
 * =========================================================================
 * SPELL POOL
 * =========================================================================
 * Magic-style spells. Each one carries a machine-readable `effect` so the
 * game resolves it generically instead of switching on the card name, plus a
 * `targeting` mode that decides whether the player picks a target:
 *
 *   'none'         resolves automatically when cast
 *   'enemyUnit'    tap an enemy unit
 *   'friendlyUnit' tap one of your own units
 *   'anyEnemy'     tap an enemy unit or the enemy Hero
 * =========================================================================
 */

export const spellCards = [
  {
    id: 'spell-01',
    name: 'Lightning Bolt',
    rarity: 'Common',
    type: 'Spell',
    cost: 1,
    attack: 0,
    health: 0,
    src: 'Surreal/2.png',
    ability: 'Deal 3 damage to any enemy target.',
    effect: { kind: 'damageAny', value: 3 },
    targeting: 'anyEnemy'
  },
  {
    id: 'spell-02',
    name: 'Giant Growth',
    rarity: 'Common',
    type: 'Spell',
    cost: 1,
    attack: 0,
    health: 0,
    src: 'Surreal/6.png',
    ability: 'Target friendly unit gets +3/+3.',
    effect: { kind: 'buff', attack: 3, health: 3 },
    targeting: 'friendlyUnit'
  },
  {
    id: 'spell-03',
    name: 'Dark Ritual',
    rarity: 'Common',
    type: 'Spell',
    cost: 1,
    attack: 0,
    health: 0,
    src: 'Surreal/9.png',
    ability: 'Gain 3 Mana this turn.',
    effect: { kind: 'mana', value: 3 },
    targeting: 'none'
  },
  {
    id: 'spell-04',
    name: 'Doom Blade',
    rarity: 'Rare',
    type: 'Spell',
    cost: 2,
    attack: 0,
    health: 0,
    src: 'Surreal/12.png',
    ability: 'Destroy target enemy unit.',
    effect: { kind: 'destroy' },
    targeting: 'enemyUnit'
  },
  {
    id: 'spell-05',
    name: 'Arc Lightning',
    rarity: 'Common',
    type: 'Spell',
    cost: 2,
    attack: 0,
    health: 0,
    src: 'Surreal/14.png',
    ability: 'Deal 2 damage to all enemy units.',
    effect: { kind: 'damageAll', value: 2 },
    targeting: 'none'
  },
  {
    id: 'spell-06',
    name: 'Healing Salve',
    rarity: 'Common',
    type: 'Spell',
    cost: 2,
    attack: 0,
    health: 0,
    src: 'Surreal/16.png',
    ability: 'Restore 8 Health to your Hero.',
    effect: { kind: 'heal', value: 8 },
    targeting: 'none'
  },
  {
    id: 'spell-07',
    name: 'Divination',
    rarity: 'Common',
    type: 'Spell',
    cost: 3,
    attack: 0,
    health: 0,
    src: 'Surreal/18.png',
    ability: 'Draw 2 cards.',
    effect: { kind: 'draw', value: 2 },
    targeting: 'none'
  },
  {
    id: 'spell-08',
    name: 'Chain Lightning',
    rarity: 'Rare',
    type: 'Spell',
    cost: 3,
    attack: 0,
    health: 0,
    src: 'Surreal/19.png',
    ability: 'Deal 3 damage to 2 random enemy units. Hits the enemy Hero if their board is empty.',
    effect: { kind: 'damageRandom', value: 3, hits: 2 },
    targeting: 'none'
  },
  {
    id: 'spell-09',
    name: 'Spirit Bonds',
    rarity: 'Common',
    type: 'Spell',
    cost: 3,
    attack: 0,
    health: 0,
    src: 'Surreal/27.png',
    ability: 'Summon two 2/2 Spirits with Taunt.',
    effect: {
      kind: 'summon',
      count: 2,
      attack: 2,
      health: 2,
      taunt: true,
      tokenName: 'Bound Spirit',
      tokenSrc: 'Surreal/27.png'
    },
    targeting: 'none'
  },
  {
    id: 'spell-10',
    name: 'Fireball',
    rarity: 'Rare',
    type: 'Spell',
    cost: 4,
    attack: 0,
    health: 0,
    src: 'Surreal/21.png',
    ability: 'Deal 6 damage to any enemy target.',
    effect: { kind: 'damageAny', value: 6 },
    targeting: 'anyEnemy'
  },
  {
    id: 'spell-11',
    name: 'Soul Drain',
    rarity: 'Epic',
    type: 'Spell',
    cost: 4,
    attack: 0,
    health: 0,
    src: 'Surreal/24.png',
    ability: 'Deal 4 damage to any enemy target and restore 4 Health to your Hero.',
    effect: { kind: 'drain', value: 4 },
    targeting: 'anyEnemy'
  },
  {
    id: 'spell-12',
    name: 'Wrath of the Cosmos',
    rarity: 'Epic',
    type: 'Spell',
    cost: 6,
    attack: 0,
    health: 0,
    src: 'Surreal/30.png',
    ability: 'Deal 5 damage to all enemy units.',
    effect: { kind: 'damageAll', value: 5 },
    targeting: 'none'
  },
  {
    id: 'spell-13',
    name: 'Mind Control',
    rarity: 'Legendary',
    type: 'Spell',
    cost: 7,
    attack: 0,
    health: 0,
    src: 'Surreal/31.png',
    ability: 'Take control of target enemy unit. It cannot attack until your next turn.',
    effect: { kind: 'steal' },
    targeting: 'enemyUnit'
  }
]

// Astral Portal and Hourglass of Fate predate the effect system, so they are
// described here rather than edited inside the hand-authored universe data.
export const legacySpellEffects = {
  'Astral Portal': {
    kind: 'summon',
    count: 2,
    attack: 2,
    health: 3,
    taunt: true,
    tokenName: 'Astral Spirit',
    tokenSrc: 'Surreal/29.png'
  },
  'Hourglass of Fate': { kind: 'mana', value: 2 }
}
