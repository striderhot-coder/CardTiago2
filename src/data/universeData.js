/**
 * =========================================================================
 * UNIVERSE DATA: SCENARIO, CHARACTERS & COLLECTIBLE CARDS
 * =========================================================================
 * Comprehensive lore, character profiles, and interactive cards.
 * =========================================================================
 */

export const scenarioData = {
  title: "Converging Reality: Universe Lore",
  subtitle: "Explore the lore, environments, factions, and narrative timeline of the Converging Reality saga.",
  synopsis: "In a world where parallel dimensions overlap with cybernetic technology and ethereal sorcery, the boundaries of perception are collapsing. Ancient relics known as Chrono-Cores have re-awakened across floating sky islands and subterranean synth-cities, granting individuals supernatural control over space, time, and matter. As factions clash for control over the ultimate Convergence, heroes and outcasts alike must navigate a shifting reality.",
  
  factions: [
    {
      id: "ethereal-nexus",
      name: "Ethereal Nexus",
      badge: "Mystic & Sorcery",
      icon: "✨",
      color: "#06b6d4",
      description: "Masters of celestial magic, arcana, and multidimensional energy. They guard the ancient Chrono-Cores and strive to preserve cosmic balance.",
      leader: "Mei-Lin the Resplendent",
      territory: "Floating Sky Citadel & Astral Spire"
    },
    {
      id: "chrono-vanguard",
      name: "Chrono Vanguard",
      badge: "Cyber & Tech",
      icon: "⚡",
      color: "#3b82f6",
      description: "A coalition of cybernetically enhanced warriors and chronomancers who manipulate temporal vectors to alter battle outcomes.",
      leader: "Commander Vance",
      territory: "The Synth-Grid & Sector 9"
    },
    {
      id: "surreal-order",
      name: "Surreal Order",
      badge: "Abyss & Mind",
      icon: "🔮",
      color: "#a855f7",
      description: "Wielders of dreamscapes, illusions, and subconscious reality bending. They thrive in the spaces between sanity and illusion.",
      leader: "Nyx the Dreamweaver",
      territory: "The Mirror Void"
    },
    {
      id: "iron-cabal",
      name: "Iron Cabal",
      badge: "Heavy Armaments",
      icon: "🛡️",
      color: "#f59e0b",
      description: "Renegade mechanics, mercenaries, and forge-masters who fuse heavy steam-alloy armor with lost dark tech.",
      leader: "Kaelen Ironhand",
      territory: "Subterranean Forge-City"
    }
  ],

  locations: [
    {
      id: "loc-1",
      name: "The Celestial Spire",
      type: "Astral Sanctuary",
      src: "Surreal/28.png",
      description: "A floating monolith hovering high above cloud cover, powered by a dormant Chrono-Core crystal."
    },
    {
      id: "loc-2",
      name: "Submerged Watery Realm",
      type: "Undersea ruins",
      src: "Surreal/12.png",
      description: "Bioluminescent ruins hidden deep beneath the ocean floor where lost arcana pulses under pressure."
    },
    {
      id: "loc-3",
      name: "The Neon Grid",
      type: "Cyber Metropolis",
      src: "Surreal/19.png",
      description: "A sprawling cyberpunk metropolis illuminated by holographic light displays and energy conduit highways."
    },
    {
      id: "loc-4",
      name: "Clockwork Citadel",
      type: "Ancient Ruins",
      src: "Surreal/24.png",
      description: "A labyrinth of massive gears and organic vines where time ticks backward for those who enter."
    }
  ],

  timeline: [
    {
      era: "Era 01",
      title: "The Great Rift",
      detail: "Dimensional barriers shatter, causing reality to converge with ethereal energy streams."
    },
    {
      era: "Era 02",
      title: "Awakening of Chrono-Cores",
      detail: "Ancient relics activate across key nexus points, granting extraordinary powers to chosen champions."
    },
    {
      era: "Era 03",
      title: "The Faction War",
      detail: "Technological, magical, and surreal factions clash to claim dominance over reality's core engine."
    }
  ]
};

export const charactersData = [
  {
    id: "char-1",
    name: "Mei-Lin",
    title: "The Resplendent Sovereign",
    faction: "Ethereal Nexus",
    role: "Mystic Leader",
    src: "acd.png",
    quote: "Inner strength weaves the threads of destiny far stronger than steel ever could.",
    bio: "Dressed in kimonos with gold and crimson silk, Mei-Lin wields cosmic energy with grace. Her amber eyes can pierce illusions and glimpse impending futures.",
    abilities: ["Astral Flare", "Celestial Ward", "Time Ripple", "Resplendent Strike"],
    stats: {
      attack: 85,
      defense: 78,
      magic: 98,
      tech: 60,
      speed: 88
    },
    gear: "Silk of the Phoenix & Astral Orb"
  },
  {
    id: "char-2",
    name: "Cyber-Vance",
    title: "Chrono Officer",
    faction: "Chrono Vanguard",
    role: "Tactical Operative",
    src: "img/projects/project21.jpg",
    quote: "Every microsecond lost is a victory handed to entropy.",
    bio: "Enhanced with glowing cybernetic ocular implants and high-speed temporal processors, Vance leads strike teams into temporal distortion zones.",
    abilities: ["Phase Dash", "Overclock Pulse", "Emp Shockwave", "Chronoshift"],
    stats: {
      attack: 90,
      defense: 82,
      magic: 45,
      tech: 96,
      speed: 92
    },
    gear: "Cyber-Collar & Pulse Rifle"
  },
  {
    id: "char-3",
    name: "Nyx",
    title: "The Dreamweaver",
    faction: "Surreal Order",
    role: "Mind Sorcerer",
    src: "Surreal/10.png",
    quote: "Reality is merely a draft; I hold the quill that rewrites it.",
    bio: "Enigmatic entity who dwells within mirror realms. Nyx manipulates subconscious fear and dreamscape geometry to disorient adversaries.",
    abilities: ["Nightmare Mirror", "Shadow Warp", "Mind Frag", "Phantasm Veil"],
    stats: {
      attack: 88,
      defense: 70,
      magic: 95,
      tech: 50,
      speed: 90
    },
    gear: "Obsidian Mirror Pendant"
  },
  {
    id: "char-4",
    name: "Kaelen",
    title: "The Forge Titan",
    faction: "Iron Cabal",
    role: "Heavy Defender",
    src: "Surreal/15.png",
    quote: "Let them strike like lightning; our armor stands like the anvil.",
    bio: "A legendary mechanic and battle forged titan. Kaelen wields heavy steam-powered armor and magma-infused gauntlets.",
    abilities: ["Magma Slam", "Fortress Barrier", "Steam Blast", "Iron Overload"],
    stats: {
      attack: 92,
      defense: 98,
      magic: 30,
      tech: 88,
      speed: 55
    },
    gear: "Steam-Forged Gauntlet & Heavy Plate"
  },
  {
    id: "char-5",
    name: "Lyra",
    title: "Star Weaver",
    faction: "Ethereal Nexus",
    role: "Support Mage",
    src: "ace.png",
    quote: "The cosmos sings in frequencies only the pure-hearted can hear.",
    bio: "A prodigy scholar of astral cartography who channels starlight into protective barriers and healing pulses.",
    abilities: ["Starlight Shield", "Nova Healing", "Cosmic Chain", "Silence Aura"],
    stats: {
      attack: 65,
      defense: 80,
      magic: 92,
      tech: 70,
      speed: 85
    },
    gear: "Stardust Prism Rod"
  },
  {
    id: "char-6",
    name: "Zero-X",
    title: "Glitch Assassin",
    faction: "Surreal Order",
    role: "Infiltrator",
    src: "Surreal/26.png",
    quote: "Now you see me. Now you're history.",
    bio: "A solitary specter born from corrupt digital data code, able to phase through physical walls and leave digital shadows behind.",
    abilities: ["Code Glitch", "Data Dagger", "Void Camouflage", "Execute Protocol"],
    stats: {
      attack: 94,
      defense: 60,
      magic: 75,
      tech: 92,
      speed: 99
    },
    gear: "Mono-Molecular Energy Dagger"
  }
];

export const cardsData = [
  {
    id: "card-001",
    name: "Sovereign Mei-Lin",
    rarity: "Legendary",
    type: "Hero",
    cost: 7,
    attack: 8,
    health: 7,
    faction: "Ethereal Nexus",
    src: "acd.png",
    ability: "Battlecry: Deal 4 astral damage to all enemy units and restore 4 health to your hero.",
    lore: "Her presence alone turns the tide of multidimensional skirmishes.",
    flavor: "Beauty and cosmic power united."
  },
  {
    id: "card-002",
    name: "Cyber Vance",
    rarity: "Legendary",
    type: "Hero",
    cost: 6,
    attack: 7,
    health: 6,
    faction: "Chrono Vanguard",
    src: "img/projects/project21.jpg",
    ability: "Rush. Overclock: Whenever this unit attacks, grant +2 Speed and redraw 1 tactic card.",
    lore: "Outrunning time itself is just another day on duty.",
    flavor: "Precision down to the nanosecond."
  },
  {
    id: "card-003",
    name: "Nyx the Dreamweaver",
    rarity: "Legendary",
    type: "Hero",
    cost: 8,
    attack: 6,
    health: 9,
    faction: "Surreal Order",
    src: "Surreal/10.png",
    ability: "Stealth. End of Turn: Mind-control an enemy unit with 4 or less Attack for 1 turn.",
    lore: "She walks through dreams leaving nightmares in her wake.",
    flavor: "Close your eyes if you dare."
  },
  {
    id: "card-004",
    name: "Chrono-Core Catalyst",
    rarity: "Epic",
    type: "Artifact",
    cost: 4,
    attack: 0,
    health: 5,
    faction: "Chrono Vanguard",
    src: "Surreal/23.png",
    ability: "Your Tactic and Spell cards cost (2) less mana. Gain 1 extra mana crystal each turn.",
    lore: "A humming orb of pure temporal energy, vibrating across past and future.",
    flavor: "Infinite power in the palm of your hand."
  },
  {
    id: "card-005",
    name: "Floating Citadel",
    rarity: "Epic",
    type: "Realm",
    cost: 5,
    attack: 0,
    health: 10,
    faction: "Ethereal Nexus",
    src: "Surreal/28.png",
    ability: "All allied units gain +2 Health and Spell Immunity while this realm is active.",
    lore: "Suspended between heavens and clouds, unreachable by earthbound foes.",
    flavor: "High above the tempest."
  },
  {
    id: "card-006",
    name: "Clockwork Titan",
    rarity: "Epic",
    type: "Unit",
    cost: 8,
    attack: 9,
    health: 9,
    faction: "Iron Cabal",
    src: "Surreal/24.png",
    ability: "Taunt. Whenever this unit takes damage, deal 3 damage to all enemies.",
    lore: "Forged in ancient magma chambers, its gears grind with unstoppable force.",
    flavor: "Tick. Tock. Oblivion."
  },
  {
    id: "card-007",
    name: "Bioluminescent Siren",
    rarity: "Rare",
    type: "Unit",
    cost: 4,
    attack: 4,
    health: 5,
    faction: "Surreal Order",
    src: "aci.png",
    ability: "Deathrattle: Freeze 2 random enemy units for 2 turns.",
    lore: "Her underwater glow beckons travelers into deep watery graves.",
    flavor: "Don't look directly into the light."
  },
  {
    id: "card-008",
    name: "Astral Portal",
    rarity: "Rare",
    type: "Spell",
    cost: 3,
    attack: 0,
    health: 0,
    faction: "Ethereal Nexus",
    src: "Surreal/29.png",
    ability: "Summon two 2/3 Astral Spirits with Taunt. Draw 1 Card.",
    lore: "A rift tear leading directly to the cosmic realm.",
    flavor: "Step through into infinity."
  },
  {
    id: "card-009",
    name: "Glitch Specter",
    rarity: "Rare",
    type: "Unit",
    cost: 3,
    attack: 4,
    health: 2,
    faction: "Surreal Order",
    src: "Surreal/26.png",
    ability: "Has +3 Attack when attacking damaged targets.",
    lore: "A digital anomaly that strikes faster than code can compile.",
    flavor: "Syntax error: Target eliminated."
  },
  {
    id: "card-010",
    name: "Hourglass of Fate",
    rarity: "Common",
    type: "Artifact",
    cost: 2,
    attack: 0,
    health: 3,
    faction: "Chrono Vanguard",
    src: "acf.png",
    ability: "Pay 2 Mana: Take an additional action this turn.",
    lore: "Grains of golden sand that fall upwards.",
    flavor: "Time waits for no one... except you."
  },
  {
    id: "card-011",
    name: "Submerged Temple",
    rarity: "Common",
    type: "Realm",
    cost: 3,
    attack: 0,
    health: 6,
    faction: "Surreal Order",
    src: "Surreal/12.png",
    ability: "Enemy spell costs are increased by (1).",
    lore: "Drowned under miles of water, yet its fires still burn cold.",
    flavor: "Pressure builds."
  },
  {
    id: "card-012",
    name: "Nebula Dragon",
    rarity: "Mythic",
    type: "Unit",
    cost: 10,
    attack: 12,
    health: 12,
    faction: "Ethereal Nexus",
    src: "Surreal/8.png",
    ability: "Flying, Charge. Destroy all enemy artifacts when played.",
    lore: "A legendary dragon born from exploding supernovas at the birth of the galaxy.",
    flavor: "Starfall incarnate."
  }
];
