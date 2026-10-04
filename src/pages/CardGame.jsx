import { supabase, isSupabaseConfigured } from '../supabaseClient'
import React, { useState, useEffect, useRef } from 'react'
import { cardsData } from '../data/universeData'
import { galleryCards } from '../data/galleryCards'
import { 
  FaGamepad, 
  FaShieldAlt, 
  FaBolt, 
  FaRedo, 
  FaTrophy, 
  FaHeart, 
  FaSkull, 
  FaHistory, 
  FaPlay, 
  FaInfoCircle,
  FaGem,
  FaCrown,
  FaCheckCircle,
  FaArrowRight,
  FaUsers,
  FaUserFriends,
  FaGlobe,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaRobot,
  FaExchangeAlt,
  FaWifi,
  FaMagic,
  FaMeteor,
  FaVolumeUp,
  FaVolumeMute,
  FaCrosshairs,
  FaRandom,
  FaMusic,
  FaSignOutAlt,
  FaStar
} from 'react-icons/fa'

// Deck = the hand-authored Converging Reality cards plus every artwork in the
// Work, More Work and Surreal galleries (see data/galleryCards.js).
const CARD_POOL = [...cardsData, ...galleryCards]

// Monotonic ids so no two card copies can ever collide (Date.now()+random did,
// which surfaced as duplicate React keys once the pool grew past 90 cards).
let cardUid = 0
const nextCardUid = () => `c${++cardUid}`

// Every hero starts with a 100 HP pool.
const HERO_MAX_HP = 100

// Single-player AI presets. Easy only swings with units it already had and
// sometimes skips its deploy; Hard curves out all of its mana, picks favourable
// trades and finishes with its Hero Power.
const DIFFICULTIES = {
  easy: {
    label: 'Easy',
    title: 'Rookie Sentinel',
    icon: FaStar,
    desc: 'Deploys slowly, attacks with part of its board',
    deployChance: 0.6,
    attackRatio: 0.5,
    summoningSickness: true,
    heroPower: false
  },
  medium: {
    label: 'Medium',
    title: 'Veteran Sentinel',
    icon: FaRobot,
    desc: 'Deploys every turn and swings with everything',
    deployChance: 1,
    attackRatio: 1,
    summoningSickness: false,
    heroPower: false
  },
  hard: {
    label: 'Hard',
    title: 'Overlord Sentinel',
    icon: FaSkull,
    desc: 'Spends all mana, trades smartly, goes for lethal',
    deployChance: 1,
    attackRatio: 1,
    summoningSickness: false,
    heroPower: true,
    maxDeploys: 3
  }
}

// Verified artwork images from your site portfolio (public folder & Surreal gallery)
const heroImagePool = [
  'acd.png', 'ace.png', 'acf.png', 'acg.png', 'aci.png', 'acj.png', 'acx.png', 'acz.png',
  'adv.png', 'adw.png', 'adx.png', 'ady.png',
  'Surreal/1.png', 'Surreal/2.png', 'Surreal/3.png', 'Surreal/4.png', 'Surreal/5.png', 'Surreal/6.png',
  'Surreal/7.png', 'Surreal/8.png', 'Surreal/9.png', 'Surreal/10.png', 'Surreal/11.png', 'Surreal/12.png',
  'Surreal/13.png', 'Surreal/14.png', 'Surreal/15.png', 'Surreal/16.png', 'Surreal/17.png', 'Surreal/18.png',
  'Surreal/19.png', 'Surreal/20.png', 'Surreal/21.png', 'Surreal/23.png', 'Surreal/24.png', 'Surreal/25.png',
  'Surreal/26.png', 'Surreal/27.png', 'Surreal/28.png', 'Surreal/29.png', 'Surreal/30.png', 'Surreal/31.png', 'Surreal/32.png'
]

const heroTitlesPool = [
  'Mei-Lin (Resplendent Sovereign)',
  'Cyber-Vance (Chrono Officer)',
  'Nyx (The Dreamweaver)',
  'Kaelen (The Forge Titan)',
  'Lyra (Star Weaver)',
  'Aetherius (Sovereign of Fate)',
  'Valerius (Chrono Sentinel)',
  'Ignis (Fire Sorcerer)',
  'Zero (Void Walker)',
  'Tiago (Creative Sovereign)'
]

// Lord of the Rings Inspired Web Audio Synthesizer
// Browsers (Chrome on Android especially) cap the number of live AudioContexts,
// so every sound must reuse one shared context instead of allocating a new one.
let sharedAudioCtx = null
const getAudioCtx = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx()
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume()
  return sharedAudioCtx
}

const playSFX = (type, enabled = true) => {
  if (!enabled) return
  try {
    const ctx = getAudioCtx()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'attack') {
      // Forged Steel Blade Slash (Narsil / Sting sword clash with metallic resonance)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc1.type = 'sawtooth'
      osc2.type = 'sine'
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(1200, now)

      osc1.frequency.setValueAtTime(480, now)
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.25)
      osc2.frequency.setValueAtTime(1440, now)
      osc2.frequency.exponentialRampToValueAtTime(300, now + 0.25)

      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.25)
      osc2.stop(now + 0.25)

    } else if (type === 'hit') {
      // Dwarven Warhammer / Iron Shield Impact (Deep sub-bass thud & shield impact)
      const osc = ctx.createOscillator()
      const sub = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      sub.type = 'sine'

      osc.frequency.setValueAtTime(160, now)
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.3)
      sub.frequency.setValueAtTime(60, now)
      sub.frequency.exponentialRampToValueAtTime(20, now + 0.35)

      gain.gain.setValueAtTime(0.6, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc.connect(gain)
      sub.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      sub.start(now)
      osc.stop(now + 0.35)
      sub.stop(now + 0.35)

    } else if (type === 'spell') {
      // Elven Magic Resonance (Light of Eärendil / Galadriel Chimes)
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        const startTime = now + idx * 0.05
        osc.frequency.setValueAtTime(freq, startTime)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.4)

        gain.gain.setValueAtTime(0.2, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.45)
      })

    } else if (type === 'turn') {
      // Horn of Gondor War Horn Pulse (Dual detuned sawtooth horn)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc1.type = 'sawtooth'
      osc2.type = 'sawtooth'
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(600, now)
      filter.frequency.linearRampToValueAtTime(1400, now + 0.3)

      osc1.frequency.setValueAtTime(293.66, now)
      osc1.frequency.linearRampToValueAtTime(440, now + 0.2)
      osc2.frequency.setValueAtTime(297.0, now)
      osc2.frequency.linearRampToValueAtTime(445, now + 0.2)

      gain.gain.setValueAtTime(0.01, now)
      gain.gain.linearRampToValueAtTime(0.4, now + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.6)
      osc2.stop(now + 0.6)

    } else if (type === 'cardPlay') {
      // Heavy Armor Plate / Shield Drop Clank
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.18)

      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.18)

    } else if (type === 'draw') {
      // Parchment / Elven Scroll Whoosh
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)

    } else if (type === 'victory') {
      // Gondor / Rohan Heroic Triumphant Fanfare (D Major Arpeggio)
      const notes = [293.66, 369.99, 440.0, 587.33]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        const startTime = now + idx * 0.12
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.35, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.6)
      })

    } else if (type === 'defeat') {
      // Mordor / Nazgûl Gloom Sub-Bass Drone
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sawtooth'
      osc2.type = 'sine'

      osc1.frequency.setValueAtTime(110, now)
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.8)
      osc2.frequency.setValueAtTime(55, now)
      osc2.frequency.exponentialRampToValueAtTime(25, now + 0.8)

      gain.gain.setValueAtTime(0.5, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.8)
      osc2.stop(now + 0.8)
    }
  } catch (e) {}
}

// Procedural Lo-Fi Ambient Chill Music Generator
class ChillMusicPlayer {
  constructor() {
    this.ctx = null
    this.timer = null
    this.isPlaying = false
  }

  start() {
    if (this.isPlaying) return
    try {
      this.ctx = getAudioCtx()
      if (!this.ctx) return

      this.isPlaying = true
      let bar = 0

      // Lo-fi Chill Chords (Cmaj7, Em7, Am7, Fmaj7)
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3
        [164.81, 196.00, 246.94, 293.66], // E3, G3, B3, D4
        [110.00, 130.81, 164.81, 196.00], // A2, C3, E3, G3
        [174.61, 220.00, 261.63, 329.63]  // F3, A3, C4, E4
      ]

      const arpeggio = [329.63, 392.00, 493.88, 587.33, 659.25]

      const playBar = () => {
        if (!this.isPlaying || !this.ctx) return
        const now = this.ctx.currentTime
        const chord = chords[bar % chords.length]
        bar++

        // Warm Pad Chords
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator()
          const filter = this.ctx.createBiquadFilter()
          const gain = this.ctx.createGain()

          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, now)

          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(450, now)

          gain.gain.setValueAtTime(0.01, now)
          gain.gain.linearRampToValueAtTime(0.06, now + 1.2)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8)

          osc.connect(filter)
          filter.connect(gain)
          gain.connect(this.ctx.destination)

          osc.start(now)
          osc.stop(now + 4.0)
        })

        // Gentle Ambient Plucks
        for (let i = 0; i < 3; i++) {
          const startTime = now + i * 1.2 + Math.random() * 0.4
          const pluckFreq = arpeggio[Math.floor(Math.random() * arpeggio.length)]

          const pOsc = this.ctx.createOscillator()
          const pGain = this.ctx.createGain()
          pOsc.type = 'sine'
          pOsc.frequency.setValueAtTime(pluckFreq, startTime)

          pGain.gain.setValueAtTime(0.03, startTime)
          pGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5)

          pOsc.connect(pGain)
          pGain.connect(this.ctx.destination)

          pOsc.start(startTime)
          pOsc.stop(startTime + 1.5)
        }

        this.timer = setTimeout(playBar, 4000)
      }

      playBar()
    } catch (e) {}
  }

  stop() {
    this.isPlaying = false
    if (this.timer) clearTimeout(this.timer)
    this.ctx = null
  }
}

const chillMusic = new ChillMusicPlayer()

const CardGame = () => {
  // Game state mode: 'menu' | 'playing' | 'victory' | 'defeat'
  const [gameMode, setGameMode] = useState('menu')
  
  // Play Mode: 'single' (vs AI) | 'local_2p' (Pass & Play) | 'online_2p' (realtime 2 devices)
  const [playMode, setPlayMode] = useState('single')

  // AI difficulty for Single Player: 'easy' | 'medium' | 'hard'
  const [difficulty, setDifficulty] = useState('medium')
  
  // Multiplayer Role: 'p1' | 'p2'
  const [myRole, setMyRole] = useState('p1')

  // Audio Toggle
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)

  // Randomized Hero Artwork & Titles
  const [p1HeroImg, setP1HeroImg] = useState('acd.png')
  const [p2HeroImg, setP2HeroImg] = useState('Surreal/10.png')
  const [p1HeroName, setP1HeroName] = useState('Mei-Lin (Resplendent Sovereign)')
  const [p2HeroName, setP2HeroName] = useState('Nyx (Chrono Sentinel)')

  // Online Room State
  const [roomCode, setRoomCode] = useState('')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [onlineStatus, setOnlineStatus] = useState('idle')
  const [onlineError, setOnlineError] = useState('')
  const [peerConnected, setPeerConnected] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [syncNonce, setSyncNonce] = useState(0)

  // Pass & Play options
  const [hideHand, setHideHand] = useState(false)
  const [showTurnTransition, setShowTurnTransition] = useState(false)

  // Health & Mana for P1 & P2
  const [p1Hp, setP1Hp] = useState(HERO_MAX_HP)
  const [p2Hp, setP2Hp] = useState(HERO_MAX_HP)
  
  const [p1MaxMana, setP1MaxMana] = useState(1)
  const [p1Mana, setP1Mana] = useState(1)
  
  const [p2MaxMana, setP2MaxMana] = useState(1)
  const [p2Mana, setP2Mana] = useState(1)
  
  // Decks & Hands
  const [p1Deck, setP1Deck] = useState([])
  const [p2Deck, setP2Deck] = useState([])

  // Live mirror of the decks: the AI's chained timeouts capture stale state, so
  // draws read/write these refs to avoid handing the same card out twice.
  const p1DeckRef = useRef([])
  const p2DeckRef = useRef([])
  const commitDeck = (player, next) => {
    if (player === 'p1') {
      p1DeckRef.current = next
      setP1Deck(next)
    } else {
      p2DeckRef.current = next
      setP2Deck(next)
    }
  }
  
  const [p1Hand, setP1Hand] = useState([])
  const [p2Hand, setP2Hand] = useState([])
  
  // Boards
  const [p1Board, setP1Board] = useState([])
  const [p2Board, setP2Board] = useState([])

  // Live mirror so the AI can read its own board without side effects in an updater
  const p2BoardRef = useRef([])
  useEffect(() => { p2BoardRef.current = p2Board }, [p2Board])

  // The AI sequences several attacks per turn, so it also needs live views of
  // the player's board and HP (state values would be stale between timeouts).
  const p1BoardRef = useRef([])
  useEffect(() => { p1BoardRef.current = p1Board }, [p1Board])
  const p1HpRef = useRef(HERO_MAX_HP)
  useEffect(() => { p1HpRef.current = p1Hp }, [p1Hp])
  
  // Combat selection (click fallback & drag)
  const [selectedAttacker, setSelectedAttacker] = useState(null)

  // Card currently shown in the zoomed inspection overlay
  const [selectedCard, setSelectedCard] = useState(null)
  
  // Drag-and-Drop Targeting Arrow & Floating Card State
  const [dragState, setDragState] = useState(null)
  const arenaRef = useRef(null)

  // Touch drags start as "pending" and only become real drags once the finger
  // moves past a threshold, so a sideways swipe still scrolls the hand row.
  const pendingDragRef = useRef(null)
  const suppressClickRef = useRef(false)

  // Turn state: 'p1' | 'p2'
  const [turn, setTurn] = useState('p1')
  const [turnCount, setTurnCount] = useState(1)
  const [winner, setWinner] = useState(null)

  // Visual Effects & Animations state
  const [attackingId, setAttackingId] = useState(null)
  const [impactId, setImpactId] = useState(null)
  const [screenShake, setScreenShake] = useState(false)
  const [turnBanner, setTurnBanner] = useState({ show: false, text: '', type: 'p1' })
  const [floatingDmg, setFloatingDmg] = useState([])
  const [spellBursts, setSpellBursts] = useState([])
  const [dyingIds, setDyingIds] = useState([])

  // Log Feed
  const [logs, setLogs] = useState([])
  
  // Stats tracking
  const [stats, setStats] = useState({
    damageDealt: 0,
    cardsPlayed: 0,
    unitsDestroyed: 0
  })

  // Channel ref for realtime multiplayer
  const channelRef = useRef(null)
  const snapshotRef = useRef({})
  const syncQueuedRef = useRef(false)
  const applyingRemoteRef = useRef(false)
  const playModeRef = useRef(playMode)
  const myRoleRef = useRef(myRole)
  const gameModeRef = useRef(gameMode)
  const startedOnlineRef = useRef(false)

  playModeRef.current = playMode
  myRoleRef.current = myRole
  gameModeRef.current = gameMode

  // Add message to battle log
  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev.slice(0, 24)])
  }

  // Randomize Heroes Helper
  const randomizeHeroes = () => {
    const img1 = heroImagePool[Math.floor(Math.random() * heroImagePool.length)]
    let img2 = heroImagePool[Math.floor(Math.random() * heroImagePool.length)]
    while (img2 === img1) {
      img2 = heroImagePool[Math.floor(Math.random() * heroImagePool.length)]
    }

    const name1 = heroTitlesPool[Math.floor(Math.random() * heroTitlesPool.length)]
    let name2 = heroTitlesPool[Math.floor(Math.random() * heroTitlesPool.length)]
    while (name2 === name1) {
      name2 = heroTitlesPool[Math.floor(Math.random() * heroTitlesPool.length)]
    }

    setP1HeroImg(img1)
    setP2HeroImg(img2)
    setP1HeroName(name1)
    setP2HeroName(name2)
    addLog(`🎲 Heroes randomized! P1: ${name1}, P2: ${name2}`)
    if (playModeRef.current === 'online_2p') queueSync()
  }

  // Trigger floating damage popup
  const triggerFloatingDmg = (targetId, text, type = 'dmg') => {
    const popupId = `dmg-${Date.now()}-${Math.random()}`
    setFloatingDmg(prev => [...prev, { id: popupId, targetId, text, type }])
    setTimeout(() => {
      setFloatingDmg(prev => prev.filter(p => p.id !== popupId))
    }, 1200)
  }

  // Trigger turn banner
  const triggerTurnBanner = (text, type = 'p1') => {
    setTurnBanner({ show: true, text, type })
    playSFX('turn', sfxEnabled)
    setTimeout(() => {
      setTurnBanner({ show: false, text: '', type: 'p1' })
    }, 1400)
  }

  // Trigger screen shake
  const triggerScreenShake = () => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 450)
  }

  // Create randomized deck
  const createDeck = () => {
    return [...CARD_POOL].sort(() => Math.random() - 0.5).map(card => ({
      ...card,
      instanceId: `${card.id}-${nextCardUid()}`
    }))
  }

  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const buildSnapshot = (extraPayload = {}) => ({
    type: extraPayload.type || 'STATE_UPDATE',
    p1Hp,
    p2Hp,
    p1Mana,
    p1MaxMana,
    p2Mana,
    p2MaxMana,
    p1Hand,
    p2Hand,
    p1Deck,
    p2Deck,
    p1Board,
    p2Board,
    p1HeroImg,
    p2HeroImg,
    p1HeroName,
    p2HeroName,
    turn,
    turnCount,
    logs,
    winner,
    gameMode,
    ...extraPayload
  })

  snapshotRef.current = buildSnapshot()

  const queueSync = () => {
    if (playModeRef.current !== 'online_2p') return
    syncQueuedRef.current = true
    setSyncNonce((n) => n + 1)
  }

  const broadcastState = (extraPayload = {}) => {
    if (playModeRef.current !== 'online_2p' || !channelRef.current?.send) return
    const payload = { ...snapshotRef.current, ...extraPayload }
    channelRef.current.send({
      type: 'broadcast',
      event: 'game_state',
      payload
    }).catch((error) => {
      console.error('Supabase broadcast error:', error)
    })
  }

  const applyRemoteState = (data) => {
    if (!data) return
    applyingRemoteRef.current = true
    setPeerConnected(true)

    if (data.p1Hp !== undefined) setP1Hp(data.p1Hp)
    if (data.p2Hp !== undefined) setP2Hp(data.p2Hp)
    if (data.p1Mana !== undefined) setP1Mana(data.p1Mana)
    if (data.p1MaxMana !== undefined) setP1MaxMana(data.p1MaxMana)
    if (data.p2Mana !== undefined) setP2Mana(data.p2Mana)
    if (data.p2MaxMana !== undefined) setP2MaxMana(data.p2MaxMana)
    if (Array.isArray(data.p1Hand)) setP1Hand(data.p1Hand)
    if (Array.isArray(data.p2Hand)) setP2Hand(data.p2Hand)
    if (Array.isArray(data.p1Deck)) commitDeck('p1', data.p1Deck)
    if (Array.isArray(data.p2Deck)) commitDeck('p2', data.p2Deck)
    if (Array.isArray(data.p1Board)) setP1Board(data.p1Board)
    if (Array.isArray(data.p2Board)) setP2Board(data.p2Board)
    if (data.p1HeroImg) setP1HeroImg(data.p1HeroImg)
    if (data.p2HeroImg) setP2HeroImg(data.p2HeroImg)
    if (data.p1HeroName) setP1HeroName(data.p1HeroName)
    if (data.p2HeroName) setP2HeroName(data.p2HeroName)
    if (data.turn) {
      setTurn((prev) => {
        if (prev !== data.turn) {
          triggerTurnBanner(data.turn === 'p1' ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN', data.turn)
        }
        return data.turn
      })
    }
    if (data.turnCount !== undefined) setTurnCount(data.turnCount)
    if (Array.isArray(data.logs)) setLogs(data.logs)
    if (data.winner !== undefined) setWinner(data.winner)
    if (data.gameMode) setGameMode(data.gameMode)
  }

  useEffect(() => {
    const hash = window.location.hash || ''
    const queryIndex = hash.indexOf('?')
    if (queryIndex === -1) return
    const params = new URLSearchParams(hash.slice(queryIndex))
    const code = (params.get('room') || '').replace(/\D/g, '').slice(0, 6)
    const role = params.get('role')
    if (code.length === 6 && role !== 'p1') {
      setPlayMode('online_2p')
      setInputRoomCode(code)
      setRoomCode(code)
      setMyRole('p2')
      setOnlineStatus('joining')
    }
  }, [])

  useEffect(() => {
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false
      syncQueuedRef.current = false
      return
    }
    if (!syncQueuedRef.current) return
    if (playMode !== 'online_2p' || !channelRef.current?.send) return
    syncQueuedRef.current = false
    broadcastState()
  }, [
    playMode, p1Hp, p2Hp, p1Mana, p1MaxMana, p2Mana, p2MaxMana,
    p1Hand, p2Hand, p1Deck, p2Deck, p1Board, p2Board,
    p1HeroImg, p2HeroImg, p1HeroName, p2HeroName,
    turn, turnCount, logs, winner, gameMode, syncNonce
  ])

  // Chill Background Music Controller
  useEffect(() => {
    if (gameMode === 'playing' && musicEnabled) {
      chillMusic.start()
    } else {
      chillMusic.stop()
    }
    return () => chillMusic.stop()
  }, [gameMode, musicEnabled])

  // Phones get a full-bleed arena that hides the site chrome, so the match has
  // to provide its own way out (the Exit button in the arena's top bar).
  useEffect(() => {
    if (gameMode !== 'playing') return
    document.body.classList.add('arena-fullscreen')
    window.scrollTo(0, 0)
    return () => document.body.classList.remove('arena-fullscreen')
  }, [gameMode])

  useEffect(() => {
    if (playMode !== 'online_2p' || !roomCode || !myRole) return
    if (!isSupabaseConfigured || !supabase) {
      setOnlineError('Online play is missing Supabase keys. Add VITE_SUPABASE_URL and the publishable key to .env.')
      setOnlineStatus('error')
      return
    }

    const channelName = `card_game_room_${roomCode}`
    const sessionKey = `${myRole}-${Math.random().toString(36).slice(2, 8)}`
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: sessionKey }
      }
    })

    channelRef.current = channel

    const markOpponentPresent = () => {
      const players = Object.values(channel.presenceState()).flat()
      const hasOpponent = players.some((player) => player.role && player.role !== myRole)
      if (hasOpponent) {
        setPeerConnected(true)
        setOnlineError('')
        if (myRole === 'p1' && gameModeRef.current === 'playing') {
          queueSync()
        }
      }
    }

    channel
      .on('broadcast', { event: 'game_state' }, ({ payload }) => {
        applyRemoteState(payload)
      })
      .on('broadcast', { event: 'peer_joined' }, ({ payload }) => {
        if (payload?.role && payload.role !== myRole) {
          setPeerConnected(true)
          setOnlineError('')
          addLog('🌐 Opponent connected to the arena!')
          if (myRole === 'p1' && gameModeRef.current === 'playing') {
            queueSync()
          }
        }
      })
      .on('presence', { event: 'sync' }, markOpponentPresent)
      .on('presence', { event: 'join' }, markOpponentPresent)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role: myRole, joinedAt: Date.now() })
          await channel.send({
            type: 'broadcast',
            event: 'peer_joined',
            payload: { role: myRole }
          })
          if (myRole === 'p1' && gameModeRef.current === 'playing') {
            queueSync()
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setOnlineStatus('error')
          setOnlineError('Could not reach the realtime server. Check your connection and try again.')
        }
      })

    return () => {
      if (channelRef.current === channel) {
        channelRef.current = null
      }
      supabase.removeChannel(channel)
    }
  }, [playMode, roomCode, myRole])

  useEffect(() => {
    if (playMode !== 'online_2p' || myRole !== 'p1' || !peerConnected) return
    if (gameMode === 'menu' && !startedOnlineRef.current) {
      startedOnlineRef.current = true
      handleStartGame('online_2p', 'p1')
      return
    }
    if (gameMode === 'playing') {
      queueSync()
    }
  }, [peerConnected, playMode, myRole, gameMode])

  // Global Pointer Move & Pointer Up Listener for Drag-and-Drop Targeting.
  // Pointer events cover mouse, touch and pen with one code path.
  useEffect(() => {
    const beginDrag = (pending, x, y) => {
      const rect = pending.el?.getBoundingClientRect?.()
      const startX = rect ? rect.left + rect.width / 2 : x
      const startY = rect ? rect.top + rect.height / 2 : y
      setDragState({
        isDragging: true,
        type: pending.type,
        item: pending.item,
        startX,
        startY,
        currentX: x,
        currentY: y
      })
      playSFX('draw', sfxEnabled)
    }

    const handlePointerMove = (e) => {
      const pending = pendingDragRef.current
      if (pending) {
        const dx = e.clientX - pending.originX
        const dy = e.clientY - pending.originY
        // Any real upward movement means drag-to-play; a flat sideways swipe
        // stays with the scrolling hand row (the card declares touch-action: pan-x).
        const moved = pending.axis === 'vertical'
          ? Math.abs(dy) > 10
          : Math.abs(dx) > 10 || Math.abs(dy) > 10
        if (moved) {
          pendingDragRef.current = null
          suppressClickRef.current = true
          beginDrag(pending, e.clientX, e.clientY)
        }
        return
      }

      if (!dragState || !dragState.isDragging) return
      setDragState(prev => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY
      }))
    }

    const handlePointerUp = (e) => {
      pendingDragRef.current = null
      if (!dragState || !dragState.isDragging) return

      const elem = document.elementFromPoint(e.clientX, e.clientY)
      if (elem) {
        const targetUnitElem = elem.closest('[data-unit-id]')
        const targetHeroElem = elem.closest('[data-hero-id]')
        const boardElem = elem.closest('.board-cards-container')

        if (dragState.type === 'attack') {
          if (targetUnitElem) {
            const unitId = targetUnitElem.getAttribute('data-unit-id')
            const owner = targetUnitElem.getAttribute('data-owner')
            const defenderUnit = (owner === 'p1' ? p1Board : p2Board).find(u => u.instanceId === unitId)
            if (defenderUnit && owner !== turn) {
              handleAttackOpponentUnit(defenderUnit, owner)
            }
          } else if (targetHeroElem) {
            const heroTag = targetHeroElem.getAttribute('data-hero-id')
            if (heroTag !== turn) {
              handleAttackOpponentHero(heroTag)
            }
          }
        } else if (dragState.type === 'play') {
          if (boardElem || targetUnitElem || targetHeroElem) {
            handlePlayCard(dragState.item)
          }
        }
      }

      setDragState(null)
    }

    const handlePointerCancel = () => {
      pendingDragRef.current = null
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [dragState, turn, p1Board, p2Board])

  // Start Dragging an Attacker Unit
  const handleStartDragAttacker = (e, unit, ownerPlayer) => {
    if (playMode === 'online_2p' && turn !== myRole) return
    if (ownerPlayer !== turn || !unit.readyToAttack) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    // Selection is owned by the click/tap handler so a plain tap selects
    // instead of being toggled straight back off.
    setDragState({
      isDragging: true,
      type: 'attack',
      item: unit,
      startX,
      startY,
      currentX: e.clientX || startX,
      currentY: e.clientY || startY
    })
    playSFX('draw', sfxEnabled)
  }

  // Start Dragging a Card from Hand
  const handleStartDragHandCard = (e, card) => {
    const isP1 = turn === 'p1'
    if (playMode === 'online_2p' && turn !== myRole) return
    const currentMana = isP1 ? p1Mana : p2Mana
    if (currentMana < card.cost) return
    if (e.pointerType === 'mouse' && e.button !== 0) return

    suppressClickRef.current = false

    const rect = e.currentTarget.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    // Touch waits for a real move so a sideways swipe still scrolls the hand
    // row (the card declares `touch-action: pan-x`).
    if (e.pointerType === 'touch') {
      pendingDragRef.current = {
        type: 'play',
        item: card,
        el: e.currentTarget,
        originX: e.clientX,
        originY: e.clientY,
        axis: 'vertical'
      }
      return
    }

    setDragState({
      isDragging: true,
      type: 'play',
      item: card,
      startX,
      startY,
      currentX: e.clientX || startX,
      currentY: e.clientY || startY
    })
    playSFX('draw', sfxEnabled)
  }

  // Hearthstone-style zoom: tap a card to inspect it full size with its stats
  const handleCardPreview = (card) => {
    setSelectedCard(card)
    playSFX('draw', sfxEnabled)
  }

  const closeCardPreview = () => {
    setSelectedCard(null)
  }

  useEffect(() => {
    if (!selectedCard) return
    const onKey = (e) => { if (e.key === 'Escape') setSelectedCard(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedCard])

  // Start Game initialization
  const handleStartGame = (overrideMode = playMode, overrideRole = myRole) => {
    const deck1 = createDeck()
    const deck2 = createDeck()

    const hand1 = deck1.slice(0, 3)
    const deck1Rem = deck1.slice(3)

    const hand2 = deck2.slice(0, 3)
    const deck2Rem = deck2.slice(3)

    // Randomize Hero pictures & names for every new battle
    randomizeHeroes()

    setP1Hp(HERO_MAX_HP)
    setP2Hp(HERO_MAX_HP)
    setP1MaxMana(1)
    setP1Mana(1)
    setP2MaxMana(1)
    setP2Mana(1)

    setP1Hand(hand1)
    commitDeck('p1', deck1Rem)
    setP2Hand(hand2)
    commitDeck('p2', deck2Rem)

    setP1Board([])
    setP2Board([])
    setSelectedAttacker(null)

    setTurn('p1')
    setTurnCount(1)
    setWinner(null)
    setStats({ damageDealt: 0, cardsPlayed: 0, unitsDestroyed: 0 })

    const modeName = overrideMode === 'single' ? 'Single Player vs AI' : overrideMode === 'local_2p' ? 'Local 2-Player (Pass & Play)' : 'Online 2-Player'
    const startMsg = `⚔️ Battle initiated in ${modeName}! Tap cards to play & tap units to attack (drag works on desktop)!`
    setLogs([startMsg])

    setGameMode('playing')
    triggerTurnBanner(overrideRole === 'p1' ? 'BATTLE START! YOUR TURN' : 'BATTLE START!', 'p1')

    if (overrideMode === 'online_2p') {
      queueSync()
    }
  }

  const handleCancelOnline = () => {
    startedOnlineRef.current = false
    setPeerConnected(false)
    setOnlineStatus('idle')
    setRoomCode('')
    setOnlineError('')
    setGameMode('menu')
  }

  const handleCopyRoomCode = async () => {
    if (!roomCode) return
    const shareUrl = `${window.location.origin}${window.location.pathname}#/game?room=${roomCode}&role=p2`
    try {
      await navigator.clipboard.writeText(`${roomCode}\n${shareUrl}`)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 1800)
    } catch (err) {
      setOnlineError('Could not copy. Select the code and copy it manually.')
    }
  }

  const handleHostRoom = () => {
    if (!isSupabaseConfigured) {
      setOnlineStatus('error')
      setOnlineError('Online play is not configured. Add Supabase keys to .env and restart the dev server.')
      return
    }
    const code = generateRoomCode()
    startedOnlineRef.current = false
    setPeerConnected(false)
    setOnlineError('')
    setRoomCode(code)
    setMyRole('p1')
    setPlayMode('online_2p')
    setOnlineStatus('hosting')
    setGameMode('menu')
  }

  const handleJoinRoom = () => {
    const code = (inputRoomCode || '').replace(/\D/g, '').slice(0, 6)
    if (code.length < 6) {
      setOnlineStatus('error')
      setOnlineError('Enter the 6-digit room code from the host.')
      return
    }
    if (!isSupabaseConfigured) {
      setOnlineStatus('error')
      setOnlineError('Online play is not configured. Add Supabase keys to .env and restart the dev server.')
      return
    }
    startedOnlineRef.current = false
    setPeerConnected(false)
    setOnlineError('')
    setRoomCode(code)
    setMyRole('p2')
    setPlayMode('online_2p')
    setOnlineStatus('joining')
    setGameMode('menu')
  }

  // Draw card for player
  const drawCard = (targetPlayer, count = 1) => {
    playSFX('draw', sfxEnabled)
    const deck = targetPlayer === 'p1' ? p1DeckRef.current : p2DeckRef.current

    if (deck.length === 0) {
      const label = targetPlayer === 'p1' ? 'Player 1' : 'Player 2'
      addLog(`⚠️ ${label} deck is empty! 2 fatigue damage.`)
      if (targetPlayer === 'p1') {
        setP1Hp(prev => Math.max(0, prev - 2))
        triggerFloatingDmg('hero-p1', '-2 Fatigue', 'dmg')
      } else {
        setP2Hp(prev => Math.max(0, prev - 2))
        triggerFloatingDmg('hero-p2', '-2 Fatigue', 'dmg')
      }
      return
    }

    // Fresh ids per drawn copy keep hand keys unique even if a chained timeout
    // fires the same draw twice.
    const drawn = deck.slice(0, count).map(c => ({ ...c, instanceId: `${c.id}-${nextCardUid()}` }))
    commitDeck(targetPlayer, deck.slice(count))

    if (targetPlayer === 'p1') {
      setP1Hand(prev => [...prev, ...drawn])
    } else {
      setP2Hand(prev => [...prev, ...drawn])
    }
    addLog(`🎴 ${targetPlayer === 'p1' ? 'Player 1' : 'Player 2'} drew ${drawn.map(c => c.name).join(', ')}.`)
  }

  // Use Hero Power
  const handleUseHeroPower = (playerTag) => {
    if (playMode === 'online_2p' && turn !== myRole) return
    const isP1 = playerTag === 'p1'
    const currentMana = isP1 ? p1Mana : p2Mana

    if (currentMana < 2) {
      addLog("❌ Need 2 Mana to use Hero Power!")
      return
    }

    if (isP1) setP1Mana(prev => prev - 2)
    else setP2Mana(prev => prev - 2)

    playSFX('spell', sfxEnabled)
    triggerScreenShake()

    const targetHeroTag = isP1 ? 'p2' : 'p1'
    const dmg = 2
    triggerFloatingDmg(`hero-${targetHeroTag}`, `-${dmg}`, 'dmg')

    if (isP1) {
      setP2Hp(prev => {
        const nextHp = Math.max(0, prev - dmg)
        if (nextHp === 0) {
          setGameMode('victory')
          setWinner('p1')
          playSFX('victory', sfxEnabled)
        }
        return nextHp
      })
    } else {
      setP1Hp(prev => {
        const nextHp = Math.max(0, prev - dmg)
        if (nextHp === 0) {
          setGameMode(playMode === 'single' ? 'defeat' : 'victory')
          setWinner('p2')
          playSFX(playMode === 'single' ? 'defeat' : 'victory', sfxEnabled)
        }
        return nextHp
      })
    }

    addLog(`⚡ ${isP1 ? p1HeroName : p2HeroName} used Hero Power for ${dmg} direct damage!`)

    if (playMode === 'online_2p') {
      queueSync()
    }
  }

  // Play a card from hand with Hearthstone Slam/Spell effects
  const handlePlayCard = (card) => {
    const isP1 = turn === 'p1'

    if (playMode === 'online_2p' && turn !== myRole) {
      addLog("❌ It is not your turn!")
      return
    }

    const currentMana = isP1 ? p1Mana : p2Mana
    if (currentMana < card.cost) {
      addLog(`❌ Not enough Mana! Needs ${card.cost} Mana.`)
      return
    }

    playSFX(card.type === 'Spell' ? 'spell' : 'cardPlay', sfxEnabled)

    if (isP1) {
      setP1Mana(prev => prev - card.cost)
      setP1Hand(prev => prev.filter(c => c.instanceId !== card.instanceId))
    } else {
      setP2Mana(prev => prev - card.cost)
      setP2Hand(prev => prev.filter(c => c.instanceId !== card.instanceId))
    }

    setStats(prev => ({ ...prev, cardsPlayed: prev.cardsPlayed + 1 }))

    const activePlayerName = isP1 ? p1HeroName : (playMode === 'single' ? 'AI Sentinel' : p2HeroName)

    if (card.type === 'Hero' || card.type === 'Unit') {
      const isRush = card.ability && card.ability.toLowerCase().includes('rush')
      const newUnit = {
        instanceId: card.instanceId,
        card: card,
        currentHp: card.health,
        maxHp: card.health,
        attack: card.attack,
        hasTaunt: card.ability && card.ability.toLowerCase().includes('taunt'),
        readyToAttack: isRush,
        isJustSummoned: true
      }

      if (isP1) setP1Board(prev => [...prev, newUnit])
      else setP2Board(prev => [...prev, newUnit])

      addLog(`✨ ${activePlayerName} summoned ${card.name} (${card.attack}/${card.health}).`)
    } else if (card.type === 'Spell') {
      addLog(`🔮 ${activePlayerName} cast ${card.name}!`)

      const burstId = `burst-${Date.now()}`
      setSpellBursts(prev => [...prev, { id: burstId, name: card.name }])
      setTimeout(() => setSpellBursts(prev => prev.filter(b => b.id !== burstId)), 800)

      if (card.name === 'Astral Portal') {
        const spirit1 = {
          instanceId: `spirit-1-${Date.now()}-${Math.random()}`,
          card: { name: 'Astral Spirit', src: 'Surreal/29.png' },
          currentHp: 3, maxHp: 3, attack: 2, hasTaunt: true, readyToAttack: false, isJustSummoned: true
        }
        const spirit2 = {
          instanceId: `spirit-2-${Date.now()}-${Math.random()}`,
          card: { name: 'Astral Spirit', src: 'Surreal/29.png' },
          currentHp: 3, maxHp: 3, attack: 2, hasTaunt: true, readyToAttack: false, isJustSummoned: true
        }

        if (isP1) setP1Board(prev => [...prev, spirit1, spirit2])
        else setP2Board(prev => [...prev, spirit1, spirit2])
        addLog(`✨ Astral Portal summoned two 2/3 Spirits with Taunt!`)
      } else if (card.name === 'Hourglass of Fate') {
        if (isP1) {
          setP1Mana(prev => prev + 2)
          triggerFloatingDmg('hero-p1', '+2 Mana', 'mana')
        } else {
          setP2Mana(prev => prev + 2)
          triggerFloatingDmg('hero-p2', '+2 Mana', 'mana')
        }
        addLog(`⏳ Hourglass of Fate granted +2 Mana!`)
      } else {
        const dmg = 4
        triggerScreenShake()
        if (isP1) {
          triggerFloatingDmg('hero-p2', `-${dmg}`, 'dmg')
          setP2Hp(prev => {
            const nextHp = Math.max(0, prev - dmg)
            if (nextHp === 0) {
              setGameMode('victory')
              setWinner('p1')
              playSFX('victory', sfxEnabled)
            }
            return nextHp
          })
        } else {
          triggerFloatingDmg('hero-p1', `-${dmg}`, 'dmg')
          setP1Hp(prev => {
            const nextHp = Math.max(0, prev - dmg)
            if (nextHp === 0) {
              setGameMode(playMode === 'single' ? 'defeat' : 'victory')
              setWinner('p2')
              playSFX(playMode === 'single' ? 'defeat' : 'victory', sfxEnabled)
            }
            return nextHp
          })
        }
        setStats(prev => ({ ...prev, damageDealt: prev.damageDealt + dmg }))
        addLog(`💥 ${card.name} dealt ${dmg} damage to opponent Hero!`)
      }
    } else {
      const realmUnit = {
        instanceId: card.instanceId,
        card: card,
        currentHp: card.health || 5,
        maxHp: card.health || 5,
        attack: card.attack || 0,
        hasTaunt: true,
        readyToAttack: false,
        isJustSummoned: true
      }
      if (isP1) setP1Board(prev => [...prev, realmUnit])
      else setP2Board(prev => [...prev, realmUnit])
      addLog(`🏰 ${activePlayerName} deployed ${card.name}.`)
    }

    if (playMode === 'online_2p') {
      queueSync()
    }
  }

  // Select unit to attack (click fallback)
  const handleSelectAttacker = (unit, ownerPlayer) => {
    if (playMode === 'online_2p' && turn !== myRole) {
      addLog("❌ It is not your turn!")
      return
    }

    if (ownerPlayer !== turn) {
      addLog("❌ You can only select units on your board!")
      return
    }

    if (!unit.readyToAttack) {
      addLog(`⏳ ${unit.card.name} cannot attack this turn (Exhausted).`)
      return
    }

    if (selectedAttacker && selectedAttacker.instanceId === unit.instanceId) {
      setSelectedAttacker(null)
    } else {
      setSelectedAttacker(unit)
      playSFX('draw', sfxEnabled)
      addLog(`🎯 Selected ${unit.card.name}. Tap an opponent unit or Hero to attack!`)
    }
  }

  // Attack Opponent Unit with Lunge, Hit Impact & Disintegration
  const handleAttackOpponentUnit = (targetUnit, targetOwner) => {
    const attacker = selectedAttacker || (dragState && dragState.type === 'attack' ? dragState.item : null)
    if (!attacker) return

    if (playMode === 'online_2p' && turn !== myRole) {
      addLog("❌ It is not your turn!")
      return
    }

    const defenderBoard = targetOwner === 'p1' ? p1Board : p2Board
    const tauntUnits = defenderBoard.filter(u => u.hasTaunt && u.currentHp > 0)

    if (tauntUnits.length > 0 && !targetUnit.hasTaunt) {
      addLog('🛡️ You must attack an opponent unit with Taunt first!')
      return
    }

    const attackerDmg = attacker.attack
    const defenderDmg = targetUnit.attack

    setAttackingId(attacker.instanceId)
    setImpactId(targetUnit.instanceId)
    playSFX('attack', sfxEnabled)

    setTimeout(() => {
      playSFX('hit', sfxEnabled)
      triggerScreenShake()

      triggerFloatingDmg(targetUnit.instanceId, `-${attackerDmg}`, 'dmg')
      if (defenderDmg > 0) {
        triggerFloatingDmg(attacker.instanceId, `-${defenderDmg}`, 'dmg')
      }

      if (targetUnit.currentHp - attackerDmg <= 0) {
        setDyingIds(prev => [...prev, targetUnit.instanceId])
      }
      if (attacker.currentHp - defenderDmg <= 0) {
        setDyingIds(prev => [...prev, attacker.instanceId])
      }

      setTimeout(() => {
        const updateBoard = (board, targetInstId, dmg, isAttacker = false) => {
          return board.map(u => {
            if (u.instanceId === targetInstId) {
              const nextHp = u.currentHp - dmg
              return {
                ...u,
                currentHp: nextHp,
                readyToAttack: isAttacker ? false : u.readyToAttack
              }
            }
            return u
          }).filter(u => u.currentHp > 0)
        }

        if (turn === 'p1') {
          setP2Board(prev => updateBoard(prev, targetUnit.instanceId, attackerDmg))
          setP1Board(prev => updateBoard(prev, attacker.instanceId, defenderDmg, true))
        } else {
          setP1Board(prev => updateBoard(prev, targetUnit.instanceId, attackerDmg))
          setP2Board(prev => updateBoard(prev, attacker.instanceId, defenderDmg, true))
        }

        setStats(s => ({ ...s, damageDealt: s.damageDealt + attackerDmg, unitsDestroyed: s.unitsDestroyed + 1 }))
        addLog(`💥 ${attacker.card.name} attacked ${targetUnit.card.name}!`)
        
        setAttackingId(null)
        setImpactId(null)
        setSelectedAttacker(null)

        if (playMode === 'online_2p') {
          queueSync()
        }
      }, 350)
    }, 250)
  }

  // Attack Opponent Hero with Lunge, Screen Shake & Hit SFX
  const handleAttackOpponentHero = (targetHeroPlayer) => {
    const attacker = selectedAttacker || (dragState && dragState.type === 'attack' ? dragState.item : null)
    if (!attacker) return

    if (playMode === 'online_2p' && turn !== myRole) {
      addLog("❌ It is not your turn!")
      return
    }

    const defenderBoard = targetHeroPlayer === 'p1' ? p1Board : p2Board
    const tauntUnits = defenderBoard.filter(u => u.hasTaunt && u.currentHp > 0)

    if (tauntUnits.length > 0) {
      addLog('🛡️ Opponent has Taunt units protecting their Hero!')
      return
    }

    const dmg = attacker.attack

    setAttackingId(attacker.instanceId)
    setImpactId(`hero-${targetHeroPlayer}`)
    playSFX('attack', sfxEnabled)

    setTimeout(() => {
      playSFX('hit', sfxEnabled)
      triggerScreenShake()
      triggerFloatingDmg(`hero-${targetHeroPlayer}`, `-${dmg}`, 'dmg')

      if (targetHeroPlayer === 'p2') {
        setP2Hp(prev => {
          const nextHp = Math.max(0, prev - dmg)
          if (nextHp === 0) {
            setGameMode('victory')
            setWinner('p1')
            playSFX('victory', sfxEnabled)
            addLog(`👑 VICTORY! ${p1HeroName} has defeated ${p2HeroName}!`)
          }
          return nextHp
        })
        setP1Board(prev => prev.map(u => u.instanceId === attacker.instanceId ? { ...u, readyToAttack: false } : u))
      } else {
        setP1Hp(prev => {
          const nextHp = Math.max(0, prev - dmg)
          if (nextHp === 0) {
            setGameMode(playMode === 'single' ? 'defeat' : 'victory')
            setWinner('p2')
            playSFX(playMode === 'single' ? 'defeat' : 'victory', sfxEnabled)
            addLog(`👑 VICTORY! ${p2HeroName} has defeated ${p1HeroName}!`)
          }
          return nextHp
        })
        setP2Board(prev => prev.map(u => u.instanceId === attacker.instanceId ? { ...u, readyToAttack: false } : u))
      }

      setStats(s => ({ ...s, damageDealt: s.damageDealt + dmg }))
      addLog(`⚔️ ${attacker.card.name} struck opponent Hero for ${dmg} damage!`)

      setAttackingId(null)
      setImpactId(null)
      setSelectedAttacker(null)

      if (playMode === 'online_2p') {
        queueSync()
      }
    }, 250)
  }

  // End Turn button click
  const handleEndTurn = () => {
    if (playMode === 'online_2p' && turn !== myRole) return

    setSelectedAttacker(null)
    const nextTurn = turn === 'p1' ? 'p2' : 'p1'
    setTurn(nextTurn)
    addLog(`⌛ ${turn === 'p1' ? p1HeroName : p2HeroName} ended their turn.`)
    triggerTurnBanner(nextTurn === 'p1' ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN', nextTurn)

    if (playMode === 'local_2p') {
      setShowTurnTransition(true)
    }

    if (nextTurn === 'p2' && playMode === 'single') {
      // AI handles turn automatically via useEffect
    } else {
      if (nextTurn === 'p1') {
        const nextP1Max = Math.min(10, p1MaxMana + 1)
        setP1MaxMana(nextP1Max)
        setP1Mana(nextP1Max)
        setP1Board(board => board.map(u => ({ ...u, readyToAttack: true })))
        drawCard('p1', 1)
      } else {
        const nextP2Max = Math.min(10, p2MaxMana + 1)
        setP2MaxMana(nextP2Max)
        setP2Mana(nextP2Max)
        setP2Board(board => board.map(u => ({ ...u, readyToAttack: true })))
        drawCard('p2', 1)
      }
      setTurnCount(c => c + 1)
    }

    if (playMode === 'online_2p') {
      queueSync()
    }
  }

  // AI Turn Logic for Single Player
  useEffect(() => {
    if (playMode !== 'single' || turn !== 'p2' || gameMode !== 'playing') return

    const cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.medium
    const timers = []
    const after = (fn, ms) => { timers.push(setTimeout(fn, ms)) }

    const damagePlayerHero = (amount, sourceName) => {
      const nextHp = Math.max(0, p1HpRef.current - amount)
      p1HpRef.current = nextHp
      setP1Hp(nextHp)
      triggerFloatingDmg('hero-p1', `-${amount}`, 'dmg')
      playSFX('hit', sfxEnabled)
      triggerScreenShake()
      addLog(`💥 ${sourceName} hit your Hero for ${amount} damage!`)
      if (nextHp === 0) {
        setGameMode('defeat')
        setWinner('p2')
        playSFX('defeat', sfxEnabled)
        addLog('💀 DEFEAT! Your Hero has fallen.')
      }
    }

    const deploy = (card) => {
      const unit = {
        instanceId: `ai-unit-${nextCardUid()}`,
        card,
        currentHp: card.health,
        maxHp: card.health,
        attack: card.attack,
        hasTaunt: card.rarity === 'Legendary' || card.rarity === 'Epic' || /taunt/i.test(card.ability || ''),
        readyToAttack: false,
        isJustSummoned: true
      }
      setP2Board(prev => [...prev, unit])
      playSFX('cardPlay', sfxEnabled)
      addLog(`🤖 ${p2HeroName} deployed ${card.name} (${card.attack}/${card.health})!`)
    }

    // Units already on board when the turn started — Easy only swings with these.
    const veterans = p2BoardRef.current.map(u => u.instanceId)

    after(() => {
      const nextP2Max = Math.min(10, p2MaxMana + 1)
      setP2MaxMana(nextP2Max)
      setP2Mana(nextP2Max)
      addLog(`🤖 ${cfg.title} — Turn ${turnCount + 1}: Refilled Mana (${nextP2Max}/${nextP2Max}).`)

      // ---- Deployment plan ----
      const plan = []
      if (Math.random() < cfg.deployChance) {
        const affordable = CARD_POOL.filter(c => c.cost <= nextP2Max && c.type !== 'Spell')
        if (cfg.maxDeploys) {
          // Hard curves out: biggest affordable card first, keeping 2 mana aside
          // for its Hero Power once it has 4 or more.
          let manaLeft = nextP2Max >= 4 ? nextP2Max - 2 : nextP2Max
          for (let i = 0; i < cfg.maxDeploys && manaLeft > 0; i++) {
            const opts = affordable.filter(c => c.cost <= manaLeft)
            if (!opts.length) break
            const best = opts.reduce((a, b) => (b.cost > a.cost ? b : a))
            plan.push(best)
            manaLeft -= best.cost
          }
        } else if (affordable.length) {
          // Easy sticks to cheap cards, Medium picks freely
          const cheap = affordable.filter(c => c.cost <= Math.max(1, Math.ceil(nextP2Max / 2)))
          const pool = difficulty === 'easy' && cheap.length ? cheap : affordable
          plan.push(pool[Math.floor(Math.random() * pool.length)])
        }
      }

      const spent = plan.reduce((sum, c) => sum + c.cost, 0)
      plan.forEach((card, i) => after(() => deploy(card), 380 * i))

      // ---- Attack phase ----
      after(() => {
        let attackers = p2BoardRef.current.filter(u => u.attack > 0 && u.currentHp > 0)
        if (cfg.summoningSickness) attackers = attackers.filter(u => veterans.includes(u.instanceId))
        if (cfg.attackRatio < 1 && attackers.length > 1) {
          attackers = attackers.slice(0, Math.max(1, Math.round(attackers.length * cfg.attackRatio)))
        }

        const totalAttack = attackers.reduce((sum, u) => sum + u.attack, 0)
        const goFace = !!cfg.heroPower && totalAttack >= p1HpRef.current
        let liveBoard = [...p1BoardRef.current]

        attackers.forEach((aiUnit, i) => {
          after(() => {
            if (p1HpRef.current <= 0) return
            setAttackingId(aiUnit.instanceId)
            playSFX('attack', sfxEnabled)

            after(() => {
              setAttackingId(null)
              if (p1HpRef.current <= 0) return

              const taunts = liveBoard.filter(u => u.hasTaunt && u.currentHp > 0)
              let target = null
              if (taunts.length) {
                // Hard kills the cheapest taunt it can, otherwise chips the weakest
                target = cfg.heroPower
                  ? (taunts.find(u => u.currentHp <= aiUnit.attack) || taunts.reduce((a, b) => (a.currentHp <= b.currentHp ? a : b)))
                  : taunts[0]
              } else if (cfg.heroPower && !goFace) {
                const trades = liveBoard.filter(u => u.currentHp > 0 && u.currentHp <= aiUnit.attack && u.attack < aiUnit.currentHp)
                if (trades.length) target = trades.sort((a, b) => (b.attack + b.currentHp) - (a.attack + a.currentHp))[0]
              }

              if (target) {
                playSFX('hit', sfxEnabled)
                triggerScreenShake()
                triggerFloatingDmg(target.instanceId, `-${aiUnit.attack}`, 'dmg')
                addLog(`🚨 AI ${aiUnit.card.name} attacked your ${target.card.name} for ${aiUnit.attack} damage!`)
                liveBoard = liveBoard
                  .map(u => (u.instanceId === target.instanceId ? { ...u, currentHp: u.currentHp - aiUnit.attack } : u))
                  .filter(u => u.currentHp > 0)
                setP1Board(liveBoard)
              } else {
                damagePlayerHero(aiUnit.attack, `AI ${aiUnit.card.name}`)
              }
            }, 250)
          }, 400 * i)
        })

        // ---- Hero Power (Hard) then hand the turn back ----
        after(() => {
          if (p1HpRef.current <= 0) return
          const manaLeft = Math.max(0, nextP2Max - spent)
          if (cfg.heroPower && manaLeft >= 2) {
            setP2Mana(manaLeft - 2)
            playSFX('spell', sfxEnabled)
            addLog(`🔮 ${p2HeroName} used their Hero Power!`)
            damagePlayerHero(2, `${p2HeroName}'s Hero Power`)
          }

          after(() => {
            if (p1HpRef.current <= 0) return
            const nextP1Max = Math.min(10, p1MaxMana + 1)
            setP1MaxMana(nextP1Max)
            setP1Mana(nextP1Max)
            setTurnCount(c => c + 1)
            setP1Board(board => board.map(u => ({ ...u, readyToAttack: true })))
            drawCard('p1', 1)
            setTurn('p1')
            triggerTurnBanner('YOUR TURN', 'p1')
            addLog(`⚡ Your turn begins! Mana refilled (${nextP1Max}/${nextP1Max}).`)
          }, 900)
        }, 400 * attackers.length + 500)
      }, 380 * plan.length + 700)
    }, 900)

    return () => timers.forEach(clearTimeout)
  }, [turn, gameMode, playMode, difficulty])

  // Derive perspective views
  const isMeP1 = playMode === 'online_2p' ? myRole === 'p1' : (playMode === 'local_2p' ? turn === 'p1' : true)

  const myHp = isMeP1 ? p1Hp : p2Hp
  const myMana = isMeP1 ? p1Mana : p2Mana
  const myMaxMana = isMeP1 ? p1MaxMana : p2MaxMana
  const myHand = isMeP1 ? p1Hand : p2Hand
  const myDeck = isMeP1 ? p1Deck : p2Deck
  const myBoard = isMeP1 ? p1Board : p2Board
  const myPlayerTag = isMeP1 ? 'p1' : 'p2'
  const myHeroTitle = isMeP1 ? p1HeroName : p2HeroName
  const myHeroImg = isMeP1 ? p1HeroImg : p2HeroImg

  const oppHp = isMeP1 ? p2Hp : p1Hp
  const oppMana = isMeP1 ? p2Mana : p1Mana
  const oppMaxMana = isMeP1 ? p2MaxMana : p1MaxMana
  const oppHand = isMeP1 ? p2Hand : p1Hand
  const oppBoard = isMeP1 ? p2Board : p1Board
  const oppPlayerTag = isMeP1 ? 'p2' : 'p1'
  const oppHeroTitle = isMeP1 ? p2HeroName : p1HeroName
  const oppHeroImg = isMeP1 ? p2HeroImg : p1HeroImg

  const isMyTurn = playMode === 'online_2p' ? turn === myRole : true

  return (
    <div className="work-page card-game-page">
      {/* Header Title */}
      <h1 className="lg-heading">
        Card <span className="text-secondary">Battle Arena</span>
      </h1>
      <h2 className="sm-heading">
        Artwork from your site portfolio!
      </h2>

      {/* ========================================================================= */}
      {/* MENU STATE                                                                */}
      {/* ========================================================================= */}
      {gameMode === 'menu' && (
        <div className="game-menu-card">
          <div className="game-menu-banner">
            <FaGamepad className="game-banner-icon" />
            <h2>Converging Reality: Card Tactics</h2>
            <p>
              Construct your strategy using heroes, artifacts, and elemental spells from the Converging Reality saga.
            </p>
          </div>

          {/* PLAY MODE SELECTOR */}
          <div className="mode-selection-container">
            <h3>Choose Game Mode</h3>
            <div className="mode-selector-grid">
              <button 
                className={`mode-btn ${playMode === 'single' ? 'active' : ''}`}
                onClick={() => setPlayMode('single')}
              >
                <FaRobot className="mode-icon" />
                <span className="mode-title">Single Player</span>
                <span className="mode-desc">Challenge AI Sentinel</span>
              </button>

              <button 
                className={`mode-btn ${playMode === 'local_2p' ? 'active' : ''}`}
                onClick={() => setPlayMode('local_2p')}
              >
                <FaUserFriends className="mode-icon" />
                <span className="mode-title">Local 2-Player</span>
                <span className="mode-desc">Pass & Play on 1 Device</span>
              </button>

              <button 
                className={`mode-btn ${playMode === 'online_2p' ? 'active' : ''}`}
                onClick={() => setPlayMode('online_2p')}
              >
                <FaGlobe className="mode-icon" />
                <span className="mode-title">Online 2-Player</span>
                <span className="mode-desc">Two devices, one room code</span>
              </button>
            </div>
          </div>

          {/* AI DIFFICULTY SELECTOR */}
          {playMode === 'single' && (
            <div className="mode-selection-container difficulty-selection-container">
              <h3>Choose AI Difficulty</h3>
              <div className="mode-selector-grid difficulty-grid">
                {Object.entries(DIFFICULTIES).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <button
                      key={key}
                      className={`mode-btn difficulty-btn ${key} ${difficulty === key ? 'active' : ''}`}
                      onClick={() => setDifficulty(key)}
                    >
                      <Icon className="mode-icon" />
                      <span className="mode-title">{cfg.label}</span>
                      <span className="mode-desc">{cfg.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ONLINE ROOM CONFIGURATION */}
          {playMode === 'online_2p' && (
            <div className="room-config-box">
              <h3><FaWifi /> Online match</h3>
              <p className="room-subtext">
                Host creates a room, then the other player joins from any phone or computer using the code.
                You do not need to be on the same Wi‑Fi.
              </p>

              {onlineStatus === 'hosting' && (
                <div className="room-lobby" role="status" aria-live="polite">
                  <p className="room-lobby-label">Share this room code</p>
                  <div className="room-code-display">{roomCode}</div>
                  <p className="room-subtext">
                    {peerConnected
                      ? 'Opponent found — starting the match…'
                      : 'Waiting for Player 2 to join…'}
                  </p>
                  <div className="room-actions">
                    <button type="button" className="join-room-btn" onClick={handleCopyRoomCode}>
                      <FaCopy /> {copiedCode ? 'Copied' : 'Copy code & link'}
                    </button>
                    <button type="button" className="host-room-btn" onClick={handleCancelOnline}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {onlineStatus === 'joining' && (
                <div className="room-lobby" role="status" aria-live="polite">
                  <p className="room-lobby-label">Joining room {roomCode}</p>
                  <p className="room-subtext">
                    {peerConnected
                      ? 'Connected. Waiting for the host to start…'
                      : 'Looking for the host…'}
                  </p>
                  <button type="button" className="host-room-btn" onClick={handleCancelOnline}>
                    Leave lobby
                  </button>
                </div>
              )}

              {(onlineStatus === 'idle' || onlineStatus === 'error') && (
                <div className="room-actions">
                  <button type="button" className="host-room-btn" onClick={handleHostRoom}>
                    <FaUsers /> Host New Game (Player 1)
                  </button>

                  <form
                    className="join-room-group"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleJoinRoom()
                    }}
                  >
                    <label className="sr-only" htmlFor="room-code-input">Room code</label>
                    <input
                      id="room-code-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="6-digit room code"
                      value={inputRoomCode}
                      maxLength={6}
                      onChange={(e) => setInputRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="room-code-input"
                      aria-invalid={onlineStatus === 'error'}
                    />
                    <button type="submit" className="join-room-btn">
                      Join Game (Player 2)
                    </button>
                  </form>
                </div>
              )}

              {onlineError && (
                <p className="room-error" role="alert">{onlineError}</p>
              )}
            </div>
          )}

          <div className="game-rules-box">
            <h3><FaInfoCircle /> Battle Rules & Controls</h3>
            <ul>
              <li><strong>Randomized Hero Pictures:</strong> Every match generates fresh random hero portraits selected directly from your site work gallery!</li>
              <li><strong>Random Heroes:</strong> Authentic ornate hero portraits with Hero Power abilities & crystal mana!</li>
              <li><strong>Tap or Drag to Attack:</strong> On a phone, tap a ready unit on your board then tap an enemy unit or Hero to strike. On desktop you can also drag it onto the target!</li>
              <li><strong>Tap or Drag to Play:</strong> Tap a card in your hand to summon/cast it, or drag it onto the battlefield with a mouse!</li>
              <li><strong>AI Difficulty:</strong> Single Player offers Easy, Medium and Hard Sentinels — Easy holds back attacks, Hard spends every crystal, trades smartly and uses its Hero Power.</li>
              <li><strong>Portfolio Deck:</strong> Every artwork from the Work, More Work and Surreal galleries is a playable card — {CARD_POOL.length} unique cards in each deck!</li>
            </ul>
          </div>

          {playMode !== 'online_2p' && (
            <button className="start-game-btn" onClick={() => handleStartGame(playMode, 'p1')}>
              <FaPlay /> Start Card Battle
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLAYING STATE                                                             */}
      {/* ========================================================================= */}
      {gameMode === 'playing' && (
        <div ref={arenaRef} className={`battle-arena ${screenShake ? 'screen-shake' : ''}`}>
          
          {/* HEARTHSTONE TARGETING ARROW CANVAS */}
          {dragState && dragState.isDragging && (
            <svg className="hs-targeting-canvas">
              <defs>
                <filter id="hsGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Curved Arrow Line */}
              <path
                d={`M ${dragState.startX} ${dragState.startY} Q ${(dragState.startX + dragState.currentX)/2} ${(dragState.startY + dragState.currentY)/2 - 50} ${dragState.currentX} ${dragState.currentY}`}
                stroke={dragState.type === 'attack' ? '#ef4444' : '#06b6d4'}
                strokeWidth="6"
                strokeDasharray="10 6"
                fill="none"
                filter="url(#hsGlow)"
              />

              {/* Target Reticle Outer Ring */}
              <circle
                cx={dragState.currentX}
                cy={dragState.currentY}
                r="24"
                fill={dragState.type === 'attack' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.25)'}
                stroke={dragState.type === 'attack' ? '#ef4444' : '#06b6d4'}
                strokeWidth="3"
                filter="url(#hsGlow)"
              />

              {/* Target Reticle Center Dot */}
              <circle
                cx={dragState.currentX}
                cy={dragState.currentY}
                r="8"
                fill={dragState.type === 'attack' ? '#ef4444' : '#06b6d4'}
              />
            </svg>
          )}

          {/* FLOATING DRAGGED CARD PREVIEW */}
          {dragState && dragState.isDragging && dragState.item && (
            <div 
              className="hs-dragged-card-preview"
              style={{
                left: dragState.currentX,
                top: dragState.currentY
              }}
            >
              <div className="dragged-card-inner">
                <img src={dragState.item.card ? dragState.item.card.src : dragState.item.src} alt="Dragging" />
                <span className="dragged-card-name">{dragState.item.card ? dragState.item.card.name : dragState.item.name}</span>
                <span className="dragged-card-atk">⚔️ {dragState.item.attack || (dragState.item.card && dragState.item.card.attack) || 0}</span>
              </div>
            </div>
          )}

          {/* HEARTHSTONE TURN BANNER ANNOUNCER */}
          {turnBanner.show && (
            <div className={`turn-announcer-overlay ${turnBanner.type}`}>
              <div className="turn-announcer-banner">
                <FaMeteor className="banner-icon" />
                <span>{turnBanner.text}</span>
              </div>
            </div>
          )}

          {/* SPELL BURST OVERLAYS */}
          {spellBursts.map(b => (
            <div key={b.id} className="spell-burst-overlay">
              <FaMagic className="spell-magic-icon" />
              <span className="spell-title">{b.name}</span>
            </div>
          ))}

          {/* TOP BAR: GAME MODE & MULTIPLAYER STATUS */}
          <div className="arena-top-status-bar">
            <div className="arena-mode-badge">
              {playMode === 'single' && <span><FaRobot /> Mode: vs AI Sentinel</span>}
              {playMode === 'local_2p' && <span><FaUserFriends /> Mode: Local 2-Player (Pass & Play)</span>}
              {playMode === 'online_2p' && (
                <span className="online-badge">
                  <FaGlobe /> Room <strong>{roomCode}</strong> · {myRole === 'p1' ? 'Host / P1' : 'Guest / P2'}
                  {peerConnected
                    ? <span className="status-pill connected">Connected</span>
                    : <span className="status-pill waiting">Opponent disconnected</span>}
                  {isMyTurn
                    ? <span className="status-pill connected">Your turn</span>
                    : <span className="status-pill waiting">Opponent turn</span>}
                </span>
              )}
            </div>

            <div className="arena-top-actions">
              <button className="toggle-sfx-btn arena-exit-btn" onClick={() => setGameMode('menu')} title="Leave the match and return to the game menu">
                <FaSignOutAlt /> Exit
              </button>

              <button className={`toggle-sfx-btn ${musicEnabled ? 'active-music' : ''}`} onClick={() => setMusicEnabled(!musicEnabled)} title="Toggle Chill Background Music">
                <FaMusic /> {musicEnabled ? 'Chill Music ON' : 'Chill Music OFF'}
              </button>

              <button className="toggle-sfx-btn" onClick={randomizeHeroes} title="Reroll Random Hero Pictures">
                <FaRandom /> Reroll Heroes
              </button>

              <button className="toggle-sfx-btn" onClick={() => setSfxEnabled(!sfxEnabled)} title="Toggle Sound Effects">
                {sfxEnabled ? <FaVolumeUp /> : <FaVolumeMute />} {sfxEnabled ? 'SFX ON' : 'SFX OFF'}
              </button>

              {playMode === 'single' && (
                <span className={`difficulty-badge ${difficulty}`} title={`AI difficulty: ${DIFFICULTIES[difficulty].title}`}>
                  AI · {DIFFICULTIES[difficulty].label}
                </span>
              )}

              {playMode === 'local_2p' && (
                <button className="toggle-hand-btn" onClick={() => setHideHand(!hideHand)}>
                  {hideHand ? <FaEye /> : <FaEyeSlash />} {hideHand ? 'Show Hand' : 'Hide Hand'}
                </button>
              )}
            </div>
          </div>

          {/* HEARTHSTONE HERO PORTRAIT: OPPONENT (TOP) */}
          <div 
            data-hero-id={oppPlayerTag}
            className={`hs-hero-portrait-card opp-hero ${impactId === `hero-${oppPlayerTag}` ? 'hero-impact-shake' : ''}`}
          >
            {floatingDmg.filter(p => p.targetId === `hero-${oppPlayerTag}`).map(p => (
              <div key={p.id} className={`floating-dmg-popup ${p.type}`}>{p.text}</div>
            ))}

            <div 
              className={`hs-hero-frame ${selectedAttacker || (dragState && dragState.type === 'attack') ? 'targetable-hero-glow' : ''}`}
              onClick={() => handleAttackOpponentHero(oppPlayerTag)}
              title={`Tap to attack ${oppHeroTitle}!`}
            >
              <div className="hs-hero-img-wrapper">
                <img src={oppHeroImg} alt={oppHeroTitle} className="hs-hero-img" />
              </div>
              <div className="hs-hero-gold-border"></div>
              <div className="hs-hero-hp-badge">
                <FaHeart className="hp-badge-icon" />
                <span>{oppHp}</span>
              </div>
            </div>

            <div className="hs-hero-details">
              <div className="hs-hero-name">{oppHeroTitle}</div>
              <div className="hs-hero-power-btn disabled">
                <FaBolt className="power-icon" /> Hero Power (2)
              </div>
            </div>

            {/* Mana Crystals */}
            <div className="hs-hero-mana-bar">
              <div className="mana-text"><FaGem /> {oppMana} / {oppMaxMana}</div>
              <div className="mana-crystals-grid">
                {Array.from({ length: oppMaxMana }).map((_, i) => (
                  <span key={i} className={`mana-crystal ${i < oppMana ? 'filled' : 'empty'}`}>💎</span>
                ))}
              </div>
            </div>
          </div>

          {/* OPPONENT BOARD */}
          <div className="board-row enemy-board-row">
            <div className="board-label">Opponent Battlefield ({oppBoard.length})</div>
            <div className="board-cards-container">
              {oppBoard.length > 0 ? (
                oppBoard.map(unit => {
                  const isAttacking = attackingId === unit.instanceId
                  const isImpacted = impactId === unit.instanceId
                  const isDying = dyingIds.includes(unit.instanceId)

                  return (
                    <div 
                      key={unit.instanceId} 
                      data-unit-id={unit.instanceId}
                      data-owner={oppPlayerTag}
                      className={`board-unit-card enemy-unit ${selectedAttacker || (dragState && dragState.type === 'attack') ? 'targetable' : ''} ${unit.hasTaunt ? 'taunt-unit' : ''} ${isAttacking ? 'attacking-lunge-down' : ''} ${isImpacted ? 'impact-shake' : ''} ${isDying ? 'disintegrating' : ''}`}
                      onClick={() => handleAttackOpponentUnit(unit, oppPlayerTag)}
                    >
                      {floatingDmg.filter(p => p.targetId === unit.instanceId).map(p => (
                        <div key={p.id} className={`floating-dmg-popup ${p.type}`}>{p.text}</div>
                      ))}

                      {unit.hasTaunt && <span className="taunt-badge">🛡️ Taunt</span>}
                      <img src={unit.card.src} alt={unit.card.name} />
                      <div className="unit-name">{unit.card.name}</div>
                      <div className="unit-stats">
                        <span className="atk"><FaBolt /> {unit.attack}</span>
                        <span className="hp"><FaShieldAlt /> {unit.currentHp}/{unit.maxHp}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="empty-board-slot">Opponent Battlefield is empty</div>
              )}
            </div>
          </div>

          {/* CENTER DIVISION & BATTLE LOG */}
          <div className="arena-center-divider">
            <div className="log-container">
              <div className="log-header"><FaHistory /> Battle Log</div>
              <div className="log-messages">
                {logs.map((log, idx) => (
                  <div key={idx} className="log-line">{log}</div>
                ))}
              </div>
            </div>

            <div className="turn-actions">
              <button 
                className="end-turn-btn"
                disabled={playMode === 'online_2p' ? turn !== myRole : (playMode === 'single' && turn !== 'p1')}
                onClick={handleEndTurn}
              >
                End Turn <FaArrowRight />
              </button>
            </div>
          </div>

          {/* YOUR BOARD */}
          <div className="board-row player-board-row">
            <div className="board-label">Your Battlefield ({myBoard.length}) - Tap a ready unit, then tap a target to attack!</div>
            <div className="board-cards-container">
              {myBoard.length > 0 ? (
                myBoard.map(unit => {
                  const isSelected = selectedAttacker && selectedAttacker.instanceId === unit.instanceId
                  const isAttacking = attackingId === unit.instanceId
                  const isImpacted = impactId === unit.instanceId
                  const isDying = dyingIds.includes(unit.instanceId)

                  return (
                    <div 
                      key={unit.instanceId} 
                      data-unit-id={unit.instanceId}
                      data-owner={myPlayerTag}
                      className={`board-unit-card player-unit ${unit.readyToAttack ? 'ready drag-targetable' : 'exhausted'} ${isSelected ? 'selected' : ''} ${unit.hasTaunt ? 'taunt-unit' : ''} ${isAttacking ? 'attacking-lunge-up' : ''} ${isImpacted ? 'impact-shake' : ''} ${isDying ? 'disintegrating' : ''}`}
                      onPointerDown={(e) => handleStartDragAttacker(e, unit, myPlayerTag)}
                      onClick={() => handleSelectAttacker(unit, myPlayerTag)}
                    >
                      {floatingDmg.filter(p => p.targetId === unit.instanceId).map(p => (
                        <div key={p.id} className={`floating-dmg-popup ${p.type}`}>{p.text}</div>
                      ))}

                      {unit.hasTaunt && <span className="taunt-badge">🛡️ Taunt</span>}
                      {unit.readyToAttack && <span className="ready-indicator">✨ Ready</span>}
                      <img src={unit.card.src} alt={unit.card.name} />
                      <div className="unit-name">{unit.card.name}</div>
                      <div className="unit-stats">
                        <span className="atk"><FaBolt /> {unit.attack}</span>
                        <span className="hp"><FaShieldAlt /> {unit.currentHp}/{unit.maxHp}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="empty-board-slot">Your Battlefield is empty. Tap cards in your hand to play them!</div>
              )}
            </div>
          </div>

          {/* HEARTHSTONE HERO PORTRAIT: PLAYER 1 (BOTTOM) */}
          <div 
            data-hero-id={myPlayerTag}
            className={`hs-hero-portrait-card my-hero ${impactId === `hero-${myPlayerTag}` ? 'hero-impact-shake' : ''}`}
          >
            {floatingDmg.filter(p => p.targetId === `hero-${myPlayerTag}`).map(p => (
              <div key={p.id} className={`floating-dmg-popup ${p.type}`}>{p.text}</div>
            ))}

            <div className="hs-hero-frame">
              <div className="hs-hero-img-wrapper">
                <img src={myHeroImg} alt={myHeroTitle} className="hs-hero-img" />
              </div>
              <div className="hs-hero-gold-border"></div>
              <div className="hs-hero-hp-badge">
                <FaHeart className="hp-badge-icon" />
                <span>{myHp}</span>
              </div>
            </div>

            <div className="hs-hero-details">
              <div className="hs-hero-name">{myHeroTitle}</div>
              <button 
                className={`hs-hero-power-btn ${myMana >= 2 && isMyTurn ? 'usable' : 'disabled'}`}
                onClick={() => handleUseHeroPower(myPlayerTag)}
              >
                <FaBolt className="power-icon" /> Hero Power: Astral Flare (2)
              </button>
            </div>

            {/* Mana Crystals */}
            <div className="hs-hero-mana-bar">
              <div className="mana-text"><FaGem /> {myMana} / {myMaxMana}</div>
              <div className="mana-crystals-grid">
                {Array.from({ length: myMaxMana }).map((_, i) => (
                  <span key={i} className={`mana-crystal ${i < myMana ? 'filled' : 'empty'}`}>💎</span>
                ))}
              </div>
            </div>
          </div>

          {/* YOUR HAND CARDS */}
          <div className="player-hand-section">
            <div className="hand-title">
              Your Hand ({myHand.length}) {hideHand ? '- [HIDDEN FOR PASS & PLAY]' : '- Tap a card to play it!'}
            </div>

            {hideHand ? (
              <div className="hidden-hand-notice">
                <FaEyeSlash className="notice-icon" />
                <p>Hand is hidden for secret Pass & Play mode.</p>
                <button className="start-game-btn" onClick={() => setHideHand(false)}>
                  Reveal Hand
                </button>
              </div>
            ) : (
              <div className="player-hand-grid">
                {myHand.map(card => {
                  const canAfford = myMana >= card.cost && isMyTurn
                  const rarityClass = `rarity-${card.rarity.toLowerCase()}`

                  return (
                    <div 
                      key={card.instanceId} 
                      className={`hand-card ${rarityClass} ${canAfford ? 'playable hs-glow draggable-hand-card' : 'unplayable'}`}
                      onPointerDown={(e) => canAfford && handleStartDragHandCard(e, card)}
                      onClick={() => {
                        if (suppressClickRef.current) {
                          suppressClickRef.current = false
                          return
                        }
                        handleCardPreview(card)
                      }}
                    >
                      <div className="hand-card-top">
                        <span className="hand-card-cost">{card.cost}</span>
                        <span className="hand-card-name">{card.name}</span>
                      </div>

                      <div className="hand-card-art">
                        <img src={card.src} alt={card.name} />
                        <span className="hand-card-type">{card.type}</span>
                      </div>

                      <div className="hand-card-ability">{card.ability}</div>

                      <div className="hand-card-bottom">
                        {card.attack > 0 ? <span className="hand-stat atk"><FaBolt /> {card.attack}</span> : <span></span>}
                        {card.health > 0 ? <span className="hand-stat hp"><FaShieldAlt /> {card.health}</span> : <span></span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ZOOMED CARD INSPECTION (Hearthstone-style amplify)                        */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="card-preview-overlay" onClick={closeCardPreview}>
          <div
            className={`card-preview-modal rarity-${(selectedCard.rarity || 'common').toLowerCase()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="card-preview-close" onClick={closeCardPreview} aria-label="Close card preview">
              ×
            </button>

            <div className="card-preview-card">
              <div className="card-preview-top">
                <span className="card-preview-cost">{selectedCard.cost}</span>
                <span className="card-preview-name">{selectedCard.name}</span>
              </div>

              <div className="card-preview-art">
                <img src={selectedCard.src} alt={selectedCard.name} />
                <span className="card-preview-type">{selectedCard.type}</span>
              </div>

              <div className="card-preview-description">
                {selectedCard.ability || 'No special ability.'}
              </div>

              <div className="card-preview-bottom">
                {selectedCard.attack > 0 && (
                  <span className="card-preview-stat attack"><FaBolt /> {selectedCard.attack}</span>
                )}
                {selectedCard.health > 0 && (
                  <span className="card-preview-stat health"><FaShieldAlt /> {selectedCard.health}</span>
                )}
              </div>
            </div>

            {(() => {
              const canAffordPreview = myMana >= selectedCard.cost && isMyTurn
              return (
                <button
                  className={`card-preview-play-btn ${!canAffordPreview ? 'disabled' : ''}`}
                  disabled={!canAffordPreview}
                  onClick={() => {
                    if (!canAffordPreview) return
                    handlePlayCard(selectedCard)
                    closeCardPreview()
                  }}
                >
                  {canAffordPreview
                    ? `Play Card — ${selectedCard.cost} Mana`
                    : `Need ${selectedCard.cost} Mana`}
                </button>
              )
            })()}

            <p className="card-preview-hint">Tap outside or press Esc to close</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASS & PLAY TURN TRANSITION OVERLAY                                       */}
      {/* ========================================================================= */}
      {showTurnTransition && (
        <div className="lightbox-modal">
          <div className="modal-content victory-modal transition-modal">
            <FaExchangeAlt className="result-icon victory-crown" />
            <h2>TURN SWITCH!</h2>
            <p className="result-subtitle">Pass the device to <strong>{turn === 'p1' ? p1HeroName : p2HeroName}</strong></p>
            <button className="start-game-btn" onClick={() => setShowTurnTransition(false)}>
              Ready to Play!
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VICTORY OVERLAY                                                           */}
      {/* ========================================================================= */}
      {gameMode === 'victory' && (
        <div className="lightbox-modal">
          <div className="modal-content victory-modal">
            <FaCrown className="result-icon victory-crown" />
            <h2>VICTORY!</h2>
            <p className="result-subtitle">
              {winner === 'p1' ? `${p1HeroName} has conquered the battlefield!` : `${p2HeroName} has conquered the battlefield!`}
            </p>

            <div className="game-stats-summary">
              <div className="stat-box">
                <span className="stat-num">{stats.damageDealt}</span>
                <span className="stat-lbl">Damage Dealt</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">{stats.cardsPlayed}</span>
                <span className="stat-lbl">Cards Played</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">{stats.unitsDestroyed}</span>
                <span className="stat-lbl">Units Destroyed</span>
              </div>
            </div>

            <button className="start-game-btn" onClick={() => setGameMode('menu')}>
              <FaRedo /> Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEFEAT OVERLAY                                                            */}
      {/* ========================================================================= */}
      {gameMode === 'defeat' && (
        <div className="lightbox-modal">
          <div className="modal-content defeat-modal">
            <FaSkull className="result-icon defeat-skull" />
            <h2>DEFEAT</h2>
            <p className="result-subtitle">Your Hero was overwhelmed by temporal entropy. Re-evaluate your strategy and try again!</p>

            <button className="start-game-btn" onClick={() => setGameMode('menu')}>
              <FaRedo /> Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardGame