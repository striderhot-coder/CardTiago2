/**
 * =========================================================================
 * GALLERY CARD POOL
 * =========================================================================
 * Every artwork in the Work, More Work and Surreal galleries becomes a
 * playable card, so a match is played with the whole portfolio as the deck.
 * Stats come from a card's fixed position in the pool (never randomised at
 * import time) so both players always draw from identical decks.
 * =========================================================================
 */
import { projectsData } from './projectsData'
import { moreWorkData } from './moreWorkData'
import { surrealData } from './surrealData'

const GALLERIES = [
  { key: 'work', label: 'Work', items: projectsData },
  { key: 'more-work', label: 'More Work', items: moreWorkData },
  { key: 'surreal', label: 'Surreal', items: surrealData }
]

// attack / health per mana cost: [aggressive line, sturdy line]
const STAT_LINES = {
  1: [[2, 1], [1, 3]],
  2: [[3, 2], [2, 4]],
  3: [[4, 3], [3, 5]],
  4: [[5, 4], [4, 6]],
  5: [[6, 5], [5, 7]],
  6: [[7, 6], [6, 8]],
  7: [[8, 7], [7, 9]],
  8: [[9, 8], [8, 10]]
}

const RARITIES = ['Common', 'Common', 'Rare', 'Rare', 'Epic', 'Legendary']
const KEYWORDS = ['', 'Taunt. ', '', '', 'Rush. ', '']
const TYPES = ['Unit', 'Unit', 'Unit', 'Unit', 'Realm']

// The engine grants Taunt/Rush by substring-scanning the ability text, so
// flavour text must never contain those letters (e.g. "brushstrokes").
const cleanDescription = (item) => (item.description || '').replace(/\s+/g, ' ').trim()

const flavourText = (item, label) => {
  const sentence = cleanDescription(item).split('.')[0].trim()
  if (!sentence || /(taunt|rush)/i.test(sentence)) return `From the ${label} gallery.`
  return sentence.length > 62 ? `${sentence.slice(0, 59).trimEnd()}…` : `${sentence}.`
}

// The zoomed inspector has room for the whole blurb, so it keeps an uncut copy.
// Held without any keyword prefix so re-rolled keywords can never desync from it.
const fullFlavourText = (item, label) => {
  const whole = cleanDescription(item)
  if (!whole || /(taunt|rush)/i.test(whole)) return `From the ${label} gallery.`
  return whole.endsWith('.') ? whole : `${whole}.`
}

const buildCards = () => {
  const cards = []

  GALLERIES.forEach(gallery => {
    gallery.items.forEach((item, index) => {
      const position = cards.length
      const cost = (position % 8) + 1
      const [attack, health] = STAT_LINES[cost][position % 2]
      const type = TYPES[position % TYPES.length]
      // Realms always taunt, so they trade attack for the extra defence
      const isRealm = type === 'Realm'
      const keyword = isRealm ? 'Taunt. ' : KEYWORDS[position % KEYWORDS.length]

      cards.push({
        id: `gal-${gallery.key}-${item.id || index + 1}`,
        name: item.title || `${gallery.label} Art ${index + 1}`,
        rarity: RARITIES[position % RARITIES.length],
        type,
        cost,
        attack: isRealm ? Math.max(1, Math.round(attack * 0.6)) : attack,
        health,
        src: item.src,
        ability: `${keyword}${flavourText(item, gallery.label)}`,
        flavour: fullFlavourText(item, gallery.label)
      })
    })
  })

  return cards
}

export const galleryCards = buildCards()
