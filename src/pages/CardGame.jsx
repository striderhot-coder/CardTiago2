import React, { useState, useEffect, useRef } from 'react'
import { cardsData } from '../data/universeData'
import { galleryCards } from '../data/galleryCards'
import { projectsData } from '../data/projectsData'
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
  FaStar
} from 'react-icons/fa'

// Deck = the hand-authored Converging Reality cards plus every artwork in the
// Work, More Work and Surreal galleries (see data/galleryCards.js).
const CARD_POOL = [...cardsData, ...galleryCards]

// Monotonic ids so no two card copies can ever collide (Date.now()+random did,
// which surfaced as duplicate React keys once the pool grew past 90 cards).
let cardUid = 0
const nextCardUid = () => `c${++cardUid}`

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
const playSFX = (type, enabled = true) => {
  if (!enabled) return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

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
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      this.ctx = new AudioCtx()
      if (this.ctx.state === 'suspended') this.ctx.resume()

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
    if (this.ctx) {
      try { this.ctx.close() } catch (e) {}
      this.ctx = null
    }
  }
}

const chillMusic = new ChillMusicPlayer()

const CardGame = () => {
  // Game state mode: 'menu' | 'playing' | 'victory' | 'defeat'
  const [gameMode, setGameMode] = useState('menu')
  
  // Play Mode: 'single' (vs AI) | 'local_2p' (Pass & Play) | 'online_2p' (P2P Tab Sync)
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
  const [roomCode, setRoomCode] = useState('7842')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [onlineStatus, setOnlineStatus] = useState('idle')
  const [peerConnected, setPeerConnected] = useState(false)

  // Pass & Play options
  const [hideHand, setHideHand] = useState(false)
  const [showTurnTransition, setShowTurnTransition] = useState(false)

  // Health & Mana for P1 & P2
  const [p1Hp, setP1Hp] = useState(30)
  const [p2Hp, setP2Hp] = useState(30)
  
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

  // Live mirrors so the AI can read both boards and the player's HP without
  // side effects in a state updater (StrictMode would run them twice).
  const p2BoardRef = useRef([])
  useEffect(() => { p2BoardRef.current = p2Board }, [p2Board])
  const p1BoardRef = useRef([])
  useEffect(() => { p1BoardRef.current = p1Board }, [p1Board])
  const p1HpRef = useRef(30)
  useEffect(() => { p1HpRef.current = p1Hp }, [p1Hp])
  
  // Combat selection (click fallback & drag)
  const [selectedAttacker, setSelectedAttacker] = useState(null)

  // Card preview
  const [selectedCard, setSelectedCard] = useState(null)
  
  // Drag-and-Drop Targeting Arrow & Floating Card State
  const [dragState, setDragState] = useState(null)
  const arenaRef = useRef(null)
  // Touch drags start as "pending" and only become real drags once the finger
  // moves past a threshold, so a tap still opens the zoomed card preview.
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

  // Channel ref for P2P Broadcast
  const channelRef = useRef(null)

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

  // Generate random 4-digit code
  const generateRoomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // Broadcast state helper for online mode
  const broadcastState = (extraPayload = {}) => {
    if (playMode !== 'online_2p' || !channelRef.current) return

    const fullState = {
      type: 'STATE_UPDATE',
      p1Hp, p2Hp,
      p1Mana, p1MaxMana,
      p2Mana, p2MaxMana,
      p1Hand, p2Hand,
      p1Deck, p2Deck,
      p1Board, p2Board,
      p1HeroImg, p2HeroImg,
      p1HeroName, p2HeroName,
      turn, turnCount,
      logs, winner, gameMode,
      ...extraPayload
    }

    try {
      channelRef.current.postMessage(fullState)
      localStorage.setItem(`cg_room_${roomCode}`, JSON.stringify({ state: fullState, timestamp: Date.now() }))
    } catch (e) {}
  }

  // Chill Background Music Controller
  useEffect(() => {
    if (gameMode === 'playing' && musicEnabled) {
      chillMusic.start()
    } else {
      chillMusic.stop()
    }
    return () => chillMusic.stop()
  }, [gameMode, musicEnabled])

  // Listen for BroadcastChannel & localStorage sync
  useEffect(() => {
    if (playMode !== 'online_2p' || !roomCode) return

    const channelName = `card_game_room_${roomCode}`
    const bc = new BroadcastChannel(channelName)
    channelRef.current = bc

    const handleMessage = (data) => {
      if (!data) return

      if (data.type === 'PEER_JOINED') {
        setPeerConnected(true)
        setOnlineStatus('connected')
        addLog('🌐 Player 2 connected to the arena!')
        if (myRole === 'p1') {
          broadcastState({ type: 'GAME_START_SYNC' })
        }
      } else if (data.type === 'GAME_START_SYNC' || data.type === 'STATE_UPDATE') {
        if (data.p1Hp !== undefined) setP1Hp(data.p1Hp)
        if (data.p2Hp !== undefined) setP2Hp(data.p2Hp)
        if (data.p1Mana !== undefined) setP1Mana(data.p1Mana)
        if (data.p1MaxMana !== undefined) setP1MaxMana(data.p1MaxMana)
        if (data.p2Mana !== undefined) setP2Mana(data.p2Mana)
        if (data.p2MaxMana !== undefined) setP2MaxMana(data.p2MaxMana)
        if (data.p1Hand) setP1Hand(data.p1Hand)
        if (data.p2Hand) setP2Hand(data.p2Hand)
        if (data.p1Deck) commitDeck('p1', data.p1Deck)
        if (data.p2Deck) commitDeck('p2', data.p2Deck)
        if (data.p1Board) setP1Board(data.p1Board)
        if (data.p2Board) setP2Board(data.p2Board)
        if (data.p1HeroImg) setP1HeroImg(data.p1HeroImg)
        if (data.p2HeroImg) setP2HeroImg(data.p2HeroImg)
        if (data.p1HeroName) setP1HeroName(data.p1HeroName)
        if (data.p2HeroName) setP2HeroName(data.p2HeroName)
        if (data.turn && data.turn !== turn) {
          setTurn(data.turn)
          triggerTurnBanner(data.turn === 'p1' ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN', data.turn)
        }
        if (data.turnCount) setTurnCount(data.turnCount)
        if (data.logs) setLogs(data.logs)
        if (data.gameMode) setGameMode(data.gameMode)
        if (data.winner !== undefined) setWinner(data.winner)
        setPeerConnected(true)
        setOnlineStatus('connected')
      }
    }

    bc.onmessage = (e) => handleMessage(e.data)

    const handleStorageChange = (e) => {
      if (e.key === `cg_room_${roomCode}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed && parsed.state) handleMessage(parsed.state)
        } catch (err) {}
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      bc.close()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [playMode, roomCode, myRole, p1Hp, p2Hp, p1Mana, p1MaxMana, p2Mana, p2MaxMana, p1Hand, p2Hand, p1Deck, p2Deck, p1Board, p2Board, p1HeroImg, p2HeroImg, turn, turnCount, logs, winner, gameMode])

  // Global Pointer Move & Up Listener for Drag-and-Drop Targeting
  useEffect(() => {
    const beginDrag = (pending, x, y) => {
      const rect = pending.el.getBoundingClientRect()
      setDragState({
        isDragging: true,
        type: pending.type,
        item: pending.item,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
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
      setDragState(prev => ({ ...prev, currentX: e.clientX, currentY: e.clientY }))
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

    suppressClickRef.current = false
    const rect = e.currentTarget.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    setSelectedAttacker(unit)

    if (e.pointerType === 'touch') {
      pendingDragRef.current = { type: 'attack', item: unit, el: e.currentTarget, originX: e.clientX, originY: e.clientY, axis: 'any' }
      return
    }

    e.preventDefault()
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

    // Touch waits for a real move so a tap opens the zoomed preview and a
    // sideways swipe still scrolls the hand row.
    if (e.pointerType === 'touch') {
      pendingDragRef.current = { type: 'play', item: card, el: e.currentTarget, originX: e.clientX, originY: e.clientY, axis: 'vertical' }
      return
    }

    e.preventDefault()
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

  // Open the Hearthstone-style zoomed card view
  const handleCardPreview = (card) => {
    setSelectedCard(card)
    playSFX('draw', sfxEnabled)
  }

  const closeCardPreview = () => {
    setSelectedCard(null)
  }

  // Esc closes the zoomed card
  useEffect(() => {
    if (!selectedCard) return
    const onKey = (e) => { if (e.key === 'Escape') closeCardPreview() }
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

    setP1Hp(30)
    setP2Hp(30)
    setP1MaxMana(1)
    setP1Mana(1)
    setP2MaxMana(1)
    setP2Mana(1)

    setP1Hand(hand1)
    setP1Deck(deck1Rem)
    setP2Hand(hand2)
    setP2Deck(deck2Rem)

    setP1Board([])
    setP2Board([])
    setSelectedAttacker(null)

    setTurn('p1')
    setTurnCount(1)
    setWinner(null)
    setStats({ damageDealt: 0, cardsPlayed: 0, unitsDestroyed: 0 })

    const modeName = overrideMode === 'single' ? 'Single Player vs AI' : overrideMode === 'local_2p' ? 'Local 2-Player (Pass & Play)' : 'Online Multi-Tab Arena'
    const startMsg = `⚔️ Battle initiated in ${modeName}! Drag cards to play & drag units to attack!`
    setLogs([startMsg])

    setGameMode('playing')
    triggerTurnBanner('BATTLE START! YOUR TURN', 'p1')

    if (overrideMode === 'online_2p' && channelRef.current) {
      setTimeout(() => {
        broadcastState({
          type: 'GAME_START_SYNC',
          p1Hp: 30, p2Hp: 30,
          p1Mana: 1, p1MaxMana: 1,
          p2Mana: 1, p2MaxMana: 1,
          p1Hand: hand1, p2Hand: hand2,
          p1Deck: deck1Rem, p2Deck: deck2Rem,
          p1Board: [], p2Board: [],
          turn: 'p1', turnCount: 1,
          logs: [startMsg], gameMode: 'playing', winner: null
        })
      }, 200)
    }
  }

  // Host Online Room
  const handleHostRoom = () => {
    const code = generateRoomCode()
    setRoomCode(code)
    setMyRole('p1')
    setPlayMode('online_2p')
    setOnlineStatus('hosting')
    handleStartGame('online_2p', 'p1')
    addLog(`🔑 Room ${code} created. Share code or open in a 2nd tab to play!`)
  }

  // Join Online Room
  const handleJoinRoom = () => {
    if (!inputRoomCode.trim()) return
    const code = inputRoomCode.trim()
    setRoomCode(code)
    setMyRole('p2')
    setPlayMode('online_2p')
    setOnlineStatus('joined')
    setGameMode('playing')

    setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'PEER_JOINED' })
        try {
          localStorage.setItem(`cg_room_${code}`, JSON.stringify({ state: { type: 'PEER_JOINED' }, timestamp: Date.now() }))
        } catch (e) {}
      }
    }, 300)
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
      setTimeout(() => broadcastState(), 100)
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
      setTimeout(() => broadcastState(), 100)
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
      addLog(`🎯 Selected ${unit.card.name}. Click or DRAG to an opponent unit or Hero to attack!`)
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
          setTimeout(() => broadcastState(), 100)
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
        setTimeout(() => broadcastState(), 100)
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
      setTimeout(() => broadcastState({ turn: nextTurn }), 100)
    }
  }

  // AI Turn Logic for Single Player
  useEffect(() => {
    if (playMode === 'single' && turn === 'p2' && gameMode === 'playing') {
      const timer = setTimeout(() => {
        const nextP2Max = Math.min(10, p2MaxMana + 1)
        setP2MaxMana(nextP2Max)
        setP2Mana(nextP2Max)
        addLog(`🤖 Enemy Turn ${turnCount + 1}: Refilled Mana (${nextP2Max}/${nextP2Max}).`)

        // AI plays card if possible
        const availableCards = cardsData.filter(c => c.cost <= nextP2Max && c.type !== 'Spell')
        if (availableCards.length > 0) {
          const chosenCard = availableCards[Math.floor(Math.random() * availableCards.length)]
          const aiUnit = {
            instanceId: `ai-unit-${Date.now()}-${Math.random()}`,
            card: chosenCard,
            currentHp: chosenCard.health,
            maxHp: chosenCard.health,
            attack: chosenCard.attack,
            hasTaunt: chosenCard.rarity === 'Legendary' || chosenCard.rarity === 'Epic',
            readyToAttack: false,
            isJustSummoned: true
          }
          setP2Board(prev => [...prev, aiUnit])
          playSFX('cardPlay', sfxEnabled)
          addLog(`🤖 ${p2HeroName} deployed ${chosenCard.name} (${chosenCard.attack}/${chosenCard.health})!`)
        }

        // AI Attacks with Lunge SFX
        setTimeout(() => {
          setP2Board(prevP2Board => {
            prevP2Board.forEach(aiUnit => {
              if (aiUnit.attack > 0) {
                setAttackingId(aiUnit.instanceId)
                playSFX('attack', sfxEnabled)

                setTimeout(() => {
                  playSFX('hit', sfxEnabled)
                  triggerScreenShake()

                  setP1Board(pBoard => {
                    const tauntUnits = pBoard.filter(u => u.hasTaunt && u.currentHp > 0)
                    if (tauntUnits.length > 0) {
                      const target = tauntUnits[0]
                      triggerFloatingDmg(target.instanceId, `-${aiUnit.attack}`, 'dmg')
                      addLog(`🚨 AI ${aiUnit.card.name} attacked your ${target.card.name} for ${aiUnit.attack} damage!`)
                      return pBoard.map(u => u.instanceId === target.instanceId ? { ...u, currentHp: u.currentHp - aiUnit.attack } : u).filter(u => u.currentHp > 0)
                    } else {
                      triggerFloatingDmg('hero-p1', `-${aiUnit.attack}`, 'dmg')
                      setP1Hp(pHp => {
                        const nextHp = Math.max(0, pHp - aiUnit.attack)
                        if (nextHp === 0) {
                          setGameMode('defeat')
                          setWinner('p2')
                          playSFX('defeat', sfxEnabled)
                          addLog('💀 DEFEAT! Your Hero has fallen.')
                        }
                        return nextHp
                      })
                      addLog(`💥 AI ${aiUnit.card.name} attacked your Hero for ${aiUnit.attack} damage!`)
                      return pBoard
                    }
                  })

                  setAttackingId(null)
                }, 250)
              }
            })
            return prevP2Board
          })

          // Return turn to P1
          setTimeout(() => {
            const nextP1Max = Math.min(10, p1MaxMana + 1)
            setP1MaxMana(nextP1Max)
            setP1Mana(nextP1Max)
            setTurnCount(c => c + 1)
            setP1Board(board => board.map(u => ({ ...u, readyToAttack: true })))
            drawCard('p1', 1)
            setTurn('p1')
            triggerTurnBanner('YOUR TURN', 'p1')
            addLog(`⚡ Your turn begins! Mana refilled (${nextP1Max}/${nextP1Max}).`)
          }, 800)
        }, 1000)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [turn, gameMode, playMode])

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
                <span className="mode-title">Multi-Tab Online</span>
                <span className="mode-desc">Room Code P2P Sync</span>
              </button>
            </div>
          </div>

          {/* ONLINE ROOM CONFIGURATION */}
          {playMode === 'online_2p' && (
            <div className="room-config-box">
              <h3><FaWifi /> Multi-Tab / P2P Room Connection</h3>
              <p className="room-subtext">Host a game or enter a 4-digit code to join a game running in another tab or browser!</p>

              <div className="room-actions">
                <button className="host-room-btn" onClick={handleHostRoom}>
                  <FaUsers /> Host New Game (Player 1)
                </button>

                <div className="join-room-group">
                  <input 
                    type="text" 
                    placeholder="Enter Room Code (e.g. 7842)"
                    value={inputRoomCode}
                    maxLength={6}
                    onChange={(e) => setInputRoomCode(e.target.value)}
                    className="room-code-input"
                  />
                  <button className="join-room-btn" onClick={handleJoinRoom}>
                    Join Game (Player 2)
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="game-rules-box">
            <h3><FaInfoCircle /> Battle Rules & Controls</h3>
            <ul>
              <li><strong>Randomized Hero Pictures:</strong> Every match generates fresh random hero portraits selected directly from your site work gallery!</li>
              <li><strong>Hearthstone Heroes:</strong> Authentic ornate hero portraits with Hero Power abilities & crystal mana!</li>
              <li><strong>Drag & Attack:</strong> Drag a ready unit on your board directly onto an enemy unit or Hero to strike!</li>
              <li><strong>Drag & Play:</strong> Drag a card from your hand onto the battlefield to summon/cast it!</li>
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
                  <FaGlobe /> Room Code: <strong>{roomCode}</strong> ({myRole === 'p1' ? 'Host / Player 1' : 'Guest / Player 2'})
                  {peerConnected ? <span className="status-pill connected">🟢 Connected</span> : <span className="status-pill waiting">🟡 Waiting for tab 2...</span>}
                </span>
              )}
            </div>

            <div className="arena-top-actions">
              <button className={`toggle-sfx-btn ${musicEnabled ? 'active-music' : ''}`} onClick={() => setMusicEnabled(!musicEnabled)} title="Toggle Chill Background Music">
                <FaMusic /> {musicEnabled ? 'Chill Music ON' : 'Chill Music OFF'}
              </button>

              <button className="toggle-sfx-btn" onClick={randomizeHeroes} title="Reroll Random Hero Pictures">
                <FaRandom /> Reroll Heroes
              </button>

              <button className="toggle-sfx-btn" onClick={() => setSfxEnabled(!sfxEnabled)} title="Toggle Sound Effects">
                {sfxEnabled ? <FaVolumeUp /> : <FaVolumeMute />} {sfxEnabled ? 'SFX ON' : 'SFX OFF'}
              </button>

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
              title={`Drag unit or click to attack ${oppHeroTitle}!`}
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
            <div className="board-label">Your Battlefield ({myBoard.length}) - Drag ready units to attack!</div>
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
                      onClick={() => {
                        if (suppressClickRef.current) { suppressClickRef.current = false; return }
                        handleSelectAttacker(unit, myPlayerTag)
                      }}
                    >
                      {floatingDmg.filter(p => p.targetId === unit.instanceId).map(p => (
                        <div key={p.id} className={`floating-dmg-popup ${p.type}`}>{p.text}</div>
                      ))}

                      {unit.hasTaunt && <span className="taunt-badge">🛡️ Taunt</span>}
                      {unit.readyToAttack && <span className="ready-indicator">✨ Ready (Drag to Attack)</span>}
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
                <div className="empty-board-slot">Your Battlefield is empty. Drag cards from hand to play!</div>
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
              Your Hand ({myHand.length}) {hideHand ? '- [HIDDEN FOR PASS & PLAY]' : '- Drag a card onto the board to play it!'}
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
                      className={`hand-card draggable-hand-card ${rarityClass} ${canAfford ? 'can-afford' : 'cannot-afford'}`}
                      onPointerDown={(e) => canAfford && handleStartDragHandCard(e, card)}
                      onClick={() => {
                        if (suppressClickRef.current) { suppressClickRef.current = false; return }
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
{/* CARD PREVIEW                                                             */}
{/* ========================================================================= */}

{selectedCard && (
  <div 
    className="card-preview-overlay"
    onClick={closeCardPreview}
  >
    <div 
      className={`card-preview-modal rarity-${(selectedCard.rarity || 'common').toLowerCase()}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button 
        className="card-preview-close"
        onClick={closeCardPreview}
        aria-label="Close card preview"
      >
        ×
      </button>

      {/* Card */}
      <div className="card-preview-card">

        <div className="card-preview-top">
          <span className="card-preview-cost">
            {selectedCard.cost}
          </span>

          <span className="card-preview-name">
            {selectedCard.name}
          </span>
        </div>

        <div className="card-preview-art">
          <img 
            src={selectedCard.src} 
            alt={selectedCard.name} 
          />

          <span className="card-preview-type">
            {selectedCard.type}
          </span>
        </div>

        <div className="card-preview-description">
          {selectedCard.ability || 'No special ability.'}
        </div>

        <div className="card-preview-bottom">
          {selectedCard.attack > 0 && (
            <span className="card-preview-stat attack">
              <FaBolt /> {selectedCard.attack}
            </span>
          )}

          {selectedCard.health > 0 && (
            <span className="card-preview-stat health">
              <FaShieldAlt /> {selectedCard.health}
            </span>
          )}
        </div>

      </div>

      {/* Play button */}
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
              : `Need ${selectedCard.cost} Mana`
            }
          </button>
        )
      })()}

      <p className="card-preview-hint">
        Click outside to close
      </p>

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
