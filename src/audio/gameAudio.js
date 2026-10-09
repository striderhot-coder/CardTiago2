// Procedural fantasy card-game audio. Everything is synthesised at runtime from
// a single shared AudioContext, because Chrome on Android caps the number of
// live contexts and a game that allocates one per sound goes silent mid-match.
//
// Graph:  voices -> sfxBus  \
//         voices -> musicBus -> duck -> master -> limiter -> destination
//                              reverb convolver /
//
// `duck` drops the score whenever a sound effect fires so impacts stay readable
// over the pad, and the limiter keeps layered transients from clipping.

let ctx = null
let master = null
let sfxBus = null
let musicBus = null
let duck = null
let verbIn = null
let noiseBuffer = null

const MUSIC_LEVEL = 0.38
let duckUntil = 0

// A generated impulse response: decaying stereo noise through a damping filter.
// Cheaper than shipping an audio asset and long enough to suggest a stone hall.
const buildReverb = () => {
  const seconds = 2.1
  const length = Math.floor(ctx.sampleRate * seconds)
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      const progress = i / length
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - progress, 2.7)
    }
  }

  const convolver = ctx.createConvolver()
  convolver.buffer = impulse

  const damp = ctx.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 4200

  const wet = ctx.createGain()
  wet.gain.value = 0.85

  convolver.connect(damp)
  damp.connect(wet)
  wet.connect(master)
  return convolver
}

const ensureCtx = () => {
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null

  if (!ctx) {
    ctx = new Ctor()

    master = ctx.createGain()
    master.gain.value = 0.85

    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -12
    limiter.knee.value = 20
    limiter.ratio.value = 6
    limiter.attack.value = 0.004
    limiter.release.value = 0.22

    master.connect(limiter)
    limiter.connect(ctx.destination)

    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.9
    sfxBus.connect(master)

    duck = ctx.createGain()
    duck.gain.value = 1
    duck.connect(master)

    musicBus = ctx.createGain()
    musicBus.gain.value = 0
    musicBus.connect(duck)

    verbIn = buildReverb()
  }

  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const getNoise = () => {
  if (!noiseBuffer) {
    const length = Math.floor(ctx.sampleRate * 2)
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

const route = (node, dest, verb) => {
  node.connect(dest)
  if (verb > 0 && verbIn) {
    const send = ctx.createGain()
    send.gain.value = verb
    node.connect(send)
    send.connect(verbIn)
  }
}

const panner = (pan) => {
  if (!pan || !ctx.createStereoPanner) return null
  const node = ctx.createStereoPanner()
  node.pan.value = pan
  return node
}

// One enveloped oscillator, optionally filtered and panned.
const tone = ({
  type = 'sine', freq, to = null, t0, dur, peak = 0.2, attack = 0.006,
  pan = 0, verb = 0, filter = null, cut = 1000, cutTo = null, q = 1, dest = null
}) => {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(Math.max(1, freq), t0)
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur)

  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t0)
  env.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.min(attack, dur * 0.6))
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  let tail = osc
  if (filter) {
    const node = ctx.createBiquadFilter()
    node.type = filter
    node.Q.value = q
    node.frequency.setValueAtTime(Math.max(20, cut), t0)
    if (cutTo) node.frequency.exponentialRampToValueAtTime(Math.max(20, cutTo), t0 + dur)
    tail.connect(node)
    tail = node
  }
  tail.connect(env)

  const pan2 = panner(pan)
  const out = pan2 ? (env.connect(pan2), pan2) : env
  route(out, dest || sfxBus, verb)

  osc.start(t0)
  osc.stop(t0 + dur + 0.03)
}

// One enveloped burst of filtered noise. The start offset is randomised so
// repeated hits never sound like the same sample being replayed.
const noiseVoice = ({
  t0, dur, peak = 0.15, filter = 'bandpass', cut = 1000, cutTo = null, q = 1,
  pan = 0, verb = 0, dest = null, rate = 1, attack = 0.004
}) => {
  const src = ctx.createBufferSource()
  src.buffer = getNoise()
  src.playbackRate.value = rate
  const offset = Math.random() * Math.max(0, 1.8 - dur)

  const node = ctx.createBiquadFilter()
  node.type = filter
  node.Q.value = q
  node.frequency.setValueAtTime(Math.max(20, cut), t0)
  if (cutTo) node.frequency.exponentialRampToValueAtTime(Math.max(20, cutTo), t0 + dur)

  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t0)
  env.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.min(attack, dur * 0.6))
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  src.connect(node)
  node.connect(env)

  const pan2 = panner(pan)
  const out = pan2 ? (env.connect(pan2), pan2) : env
  route(out, dest || sfxBus, verb)

  src.start(t0, offset)
  src.stop(t0 + dur + 0.03)
}

const duckMusic = () => {
  if (!ctx || !duck) return
  const now = ctx.currentTime
  const until = now + 0.13
  if (until <= duckUntil) return
  duckUntil = until

  const g = duck.gain
  g.cancelScheduledValues(now)
  g.setValueAtTime(g.value, now)
  g.linearRampToValueAtTime(0.4, now + 0.025)
  g.linearRampToValueAtTime(1, until + 0.32)
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

const frameDrum = (t, level, dest) => {
  tone({ type: 'sine', freq: 94, to: 45, t0: t, dur: 0.26, peak: 0.3 * level, attack: 0.004, verb: 0.14, dest })
  noiseVoice({ t0: t, dur: 0.09, peak: 0.075 * level, filter: 'bandpass', cut: 330, q: 0.9, verb: 0.2, dest })
}

const pluck = (t, freq, dur, dest) => {
  const len = Math.max(0.35, dur)
  tone({ type: 'triangle', freq, t0: t, dur: len, peak: 0.1, attack: 0.004, filter: 'lowpass', cut: Math.min(6200, freq * 7), q: 0.8, pan: Math.random() * 0.5 - 0.25, verb: 0.45, dest })
  tone({ type: 'sine', freq: freq * 2, t0: t, dur: len * 0.4, peak: 0.038, verb: 0.5, dest })
  tone({ type: 'sine', freq: freq * 3.01, t0: t, dur: len * 0.22, peak: 0.017, verb: 0.55, dest })
  noiseVoice({ t0: t, dur: 0.03, peak: 0.028, filter: 'highpass', cut: 3800, verb: 0.3, dest })
}

const RECIPES = {
  // Air moving first, then the steel singing past: the swing reads before the
  // impact lands, which is what makes a hit feel connected to the attack.
  attack: (t) => {
    noiseVoice({ t0: t, dur: 0.22, peak: 0.2, filter: 'bandpass', cut: 480, cutTo: 2700, q: 1.1, pan: -0.35, verb: 0.12 })
    noiseVoice({ t0: t + 0.02, dur: 0.18, peak: 0.1, filter: 'highpass', cut: 1900, cutTo: 4300, pan: 0.3, verb: 0.18 })
    tone({ type: 'sawtooth', freq: 900, to: 265, t0: t + 0.03, dur: 0.2, peak: 0.08, filter: 'highpass', cut: 720, pan: 0.15, verb: 0.22 })
  },

  hit: (t) => {
    noiseVoice({ t0: t, dur: 0.16, peak: 0.3, filter: 'lowpass', cut: 1500, cutTo: 190, q: 0.8, verb: 0.16 })
    tone({ type: 'sine', freq: 152, to: 42, t0: t, dur: 0.3, peak: 0.45, verb: 0.1 })
    tone({ type: 'triangle', freq: 420, to: 122, t0: t, dur: 0.12, peak: 0.15, verb: 0.14 })
    noiseVoice({ t0: t + 0.005, dur: 0.07, peak: 0.1, filter: 'highpass', cut: 3200, pan: 0.2, verb: 0.25 })
  },

  cardPlay: (t) => {
    noiseVoice({ t0: t, dur: 0.09, peak: 0.18, filter: 'bandpass', cut: 2300, cutTo: 900, q: 0.9, verb: 0.14 })
    tone({ type: 'triangle', freq: 212, to: 78, t0: t, dur: 0.17, peak: 0.28, verb: 0.12 })
    tone({ type: 'sine', freq: 96, to: 52, t0: t + 0.01, dur: 0.22, peak: 0.2, verb: 0.1 })
  },

  // A creature arriving, not just a card landing: the slap plus something
  // materialising out of the air above it.
  deploy: (t) => {
    RECIPES.cardPlay(t)
    noiseVoice({ t0: t + 0.05, dur: 0.4, peak: 0.08, filter: 'bandpass', cut: 700, cutTo: 3300, q: 0.7, verb: 0.35 })
    tone({ type: 'sine', freq: 320, to: 645, t0: t + 0.06, dur: 0.34, peak: 0.065, verb: 0.35 })
  },

  draw: (t) => {
    noiseVoice({ t0: t, dur: 0.13, peak: 0.1, filter: 'highpass', cut: 900, cutTo: 3600, q: 0.6, pan: 0.25, verb: 0.1 })
    tone({ type: 'sine', freq: 520, to: 880, t0: t, dur: 0.1, peak: 0.055, verb: 0.12 })
  },

  spell: (t) => {
    // A minor pentatonic climbs and a bell rings over the top of it
    ;[440, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const at = t + i * 0.045
      tone({ type: 'sine', freq, t0: at, dur: 0.5, peak: 0.1 - i * 0.011, attack: 0.02, pan: i % 2 ? 0.3 : -0.3, verb: 0.5 })
      tone({ type: 'triangle', freq: freq * 2, t0: at, dur: 0.22, peak: 0.032, verb: 0.55 })
    })
    noiseVoice({ t0: t, dur: 0.5, peak: 0.055, filter: 'bandpass', cut: 1200, cutTo: 5200, q: 0.8, verb: 0.5 })
    tone({ type: 'sine', freq: 1567.98, t0: t + 0.18, dur: 0.95, peak: 0.055, attack: 0.012, verb: 0.7 })
  },

  target: (t) => {
    tone({ type: 'sine', freq: 1174.66, t0: t, dur: 0.09, peak: 0.12, verb: 0.2 })
    tone({ type: 'sine', freq: 1567.98, t0: t + 0.07, dur: 0.15, peak: 0.1, verb: 0.3 })
    noiseVoice({ t0: t, dur: 0.05, peak: 0.045, filter: 'highpass', cut: 4200, verb: 0.2 })
  },

  heal: (t) => {
    ;[392, 523.25, 659.25].forEach((freq, i) => {
      tone({ type: 'sine', freq, t0: t + i * 0.06, dur: 0.75, peak: 0.09, attack: 0.09, verb: 0.55 })
    })
    noiseVoice({ t0: t, dur: 0.6, peak: 0.045, filter: 'bandpass', cut: 900, cutTo: 2600, q: 0.6, verb: 0.5 })
    tone({ type: 'sine', freq: 1046.5, t0: t + 0.12, dur: 0.85, peak: 0.045, attack: 0.1, verb: 0.7 })
  },

  buff: (t) => {
    tone({ type: 'sawtooth', freq: 180, to: 425, t0: t, dur: 0.32, peak: 0.09, filter: 'lowpass', cut: 500, cutTo: 1900, verb: 0.3 })
    tone({ type: 'sine', freq: 523.25, t0: t + 0.1, dur: 0.4, peak: 0.08, verb: 0.45 })
    tone({ type: 'sine', freq: 783.99, t0: t + 0.16, dur: 0.45, peak: 0.06, verb: 0.5 })
  },

  destroy: (t) => {
    tone({ type: 'sine', freq: 132, to: 34, t0: t, dur: 0.42, peak: 0.36, verb: 0.2 })
    noiseVoice({ t0: t, dur: 0.3, peak: 0.2, filter: 'lowpass', cut: 2200, cutTo: 200, verb: 0.3 })
    // Scattering shards, alternating sides so the collapse has width
    for (let i = 0; i < 5; i++) {
      noiseVoice({
        t0: t + 0.03 + i * 0.045, dur: 0.07, peak: 0.08 - i * 0.011,
        filter: 'highpass', cut: 2600 + i * 700, pan: i % 2 ? 0.4 : -0.4, verb: 0.45
      })
    }
  },

  heroPower: (t) => {
    tone({ type: 'sawtooth', freq: 300, to: 1200, t0: t, dur: 0.18, peak: 0.11, filter: 'lowpass', cut: 700, cutTo: 3600, q: 3, verb: 0.3 })
    noiseVoice({ t0: t + 0.14, dur: 0.2, peak: 0.14, filter: 'bandpass', cut: 2400, cutTo: 700, q: 1.2, verb: 0.25 })
    tone({ type: 'sine', freq: 122, to: 48, t0: t + 0.16, dur: 0.26, peak: 0.25, verb: 0.12 })
  },

  turn: (t) => {
    ;[293.66, 440, 587.33].forEach((freq, i) => {
      const at = t + i * 0.09
      tone({ type: 'sawtooth', freq, t0: at, dur: 0.55, peak: 0.1, attack: 0.05, filter: 'lowpass', cut: 500, cutTo: 2200, q: 1.4, verb: 0.4 })
      tone({ type: 'sine', freq: freq * 2, t0: at, dur: 0.3, peak: 0.045, attack: 0.03, verb: 0.5 })
    })
    tone({ type: 'sine', freq: 1174.66, t0: t + 0.24, dur: 1.1, peak: 0.06, attack: 0.012, verb: 0.7 })
    noiseVoice({ t0: t, dur: 0.5, peak: 0.04, filter: 'bandpass', cut: 600, cutTo: 2400, q: 0.7, verb: 0.4 })
  },

  victory: (t) => {
    ;[392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const at = t + i * 0.11
      tone({ type: 'sawtooth', freq, t0: at, dur: 0.8, peak: 0.09, attack: 0.03, filter: 'lowpass', cut: 900, cutTo: 3000, verb: 0.45 })
      tone({ type: 'sine', freq: freq * 2, t0: at, dur: 0.5, peak: 0.045, verb: 0.6 })
    })
    tone({ type: 'sine', freq: 130.81, t0: t, dur: 1.4, peak: 0.2, attack: 0.02, verb: 0.3 })
  },

  defeat: (t) => {
    ;[349.23, 311.13, 261.63, 196].forEach((freq, i) => {
      tone({ type: 'sawtooth', freq, t0: t + i * 0.16, dur: 0.9, peak: 0.08, attack: 0.04, filter: 'lowpass', cut: 700, cutTo: 320, verb: 0.4 })
    })
    tone({ type: 'sine', freq: 98, to: 42, t0: t + 0.2, dur: 1.6, peak: 0.26, attack: 0.05, verb: 0.3 })
    noiseVoice({ t0: t + 0.2, dur: 1.2, peak: 0.045, filter: 'lowpass', cut: 400, cutTo: 120, verb: 0.4 })
  },

  error: (t) => {
    tone({ type: 'square', freq: 150, t0: t, dur: 0.14, peak: 0.09, filter: 'lowpass', cut: 620, verb: 0.05 })
    tone({ type: 'square', freq: 112, t0: t + 0.1, dur: 0.16, peak: 0.08, filter: 'lowpass', cut: 520, verb: 0.05 })
  }
}

export const playSFX = (type, enabled = true) => {
  if (!enabled) return
  try {
    if (!ensureCtx()) return
    const recipe = RECIPES[type]
    if (!recipe) return
    duckMusic()
    recipe(ctx.currentTime + 0.002)
  } catch (e) {
    // Audio must never be able to break the game
  }
}

// ---------------------------------------------------------------------------
// Adaptive score
//
// Eight bars in D Dorian. The raised sixth keeps it wistful rather than
// funereal, which suits a card hall without copying anyone's tavern jig.
// A lookahead clock schedules whole bars ~250ms ahead, which stays sample
// accurate without the drift a setTimeout-per-bar loop accumulates.
// ---------------------------------------------------------------------------

const BPM = 82
const BEAT = 60 / BPM
const BAR = BEAT * 4

const PROGRESSION = [
  { root: 73.42, chord: [146.83, 174.61, 220.0, 261.63] },   // Dm7
  { root: 98.0, chord: [196.0, 246.94, 293.66] },            // G
  { root: 87.31, chord: [174.61, 220.0, 261.63, 329.63] },   // Fmaj7
  { root: 110.0, chord: [220.0, 261.63, 329.63, 392.0] },    // Am7
  { root: 116.54, chord: [233.08, 293.66, 349.23, 440.0] },  // Bbmaj7
  { root: 98.0, chord: [196.0, 246.94, 293.66] },            // G
  { root: 73.42, chord: [146.83, 174.61, 220.0, 261.63] },   // Dm7
  { root: 130.81, chord: [261.63, 329.63, 392.0] }           // C
]

// D minor pentatonic — the pool every melody note is drawn from
const MEL = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46]

// [bar within the phrase, beat, melody index, length in beats]
const MOTIF = [
  [0, 0.0, 4, 1.0], [0, 1.5, 3, 0.5], [0, 2.0, 2, 1.5],
  [1, 0.5, 3, 1.0], [1, 2.0, 4, 1.5],
  [2, 0.0, 5, 1.0], [2, 1.5, 4, 0.5], [2, 2.5, 2, 1.0],
  [3, 0.0, 3, 2.0], [3, 2.5, 1, 1.0],
  [4, 0.5, 4, 1.0], [4, 2.0, 5, 1.0],
  [5, 0.0, 6, 1.5], [5, 2.0, 4, 1.0],
  [6, 0.5, 3, 1.0], [6, 2.0, 2, 1.5],
  [7, 0.0, 1, 2.5]
]

let musicTimer = null
let nextBarTime = 0
let barCounter = 0
let intensity = 'calm'
let playing = false

const scheduleBar = (barIdx, t) => {
  const bar = PROGRESSION[barIdx % PROGRESSION.length]
  const dest = musicBus

  bar.chord.forEach((freq, i) => {
    tone({
      type: 'triangle', freq, t0: t + 0.02, dur: BAR * 0.98,
      peak: intensity === 'calm' ? 0.055 : 0.042, attack: 0.55,
      filter: 'lowpass', cut: 640, q: 0.6, pan: i % 2 ? 0.25 : -0.25, verb: 0.5, dest
    })
    tone({ type: 'sine', freq: freq * 0.5, t0: t, dur: BAR, peak: 0.028, attack: 0.65, verb: 0.4, dest })
  })

  if (intensity !== 'calm') {
    ;[0, 2].forEach(beat => {
      tone({ type: 'sine', freq: bar.root, t0: t + beat * BEAT, dur: BEAT * 1.6, peak: 0.15, attack: 0.02, verb: 0.12, dest })
      tone({ type: 'triangle', freq: bar.root * 2, t0: t + beat * BEAT, dur: BEAT * 0.7, peak: 0.04, attack: 0.012, verb: 0.15, dest })
    })

    frameDrum(t, 0.95, dest)
    frameDrum(t + BEAT * 2, 0.6, dest)
    if (intensity === 'crisis') {
      frameDrum(t + BEAT * 3, 0.5, dest)
      frameDrum(t + BEAT * 3.5, 0.38, dest)
    }

    for (let e = 1; e < 8; e += 2) {
      noiseVoice({ t0: t + e * BEAT * 0.5, dur: 0.06, peak: 0.032, filter: 'highpass', cut: 6500, pan: 0.3, verb: 0.2, dest })
    }
  }

  if (intensity === 'crisis') {
    for (let e = 0; e < 8; e++) {
      tone({
        type: 'sawtooth', freq: bar.root, t0: t + e * BEAT * 0.5, dur: BEAT * 0.4,
        peak: 0.045, attack: 0.012, filter: 'lowpass', cut: 340, q: 2.2, verb: 0.1, dest
      })
    }
  }

  const phraseBar = barIdx % PROGRESSION.length
  MOTIF.forEach(([noteBar, beat, noteIdx, len]) => {
    if (noteBar !== phraseBar) return
    // Thin the melody right out when calm so the opening turns stay sparse
    if (intensity === 'calm' && Math.random() < 0.45) return
    pluck(t + beat * BEAT, MEL[noteIdx], len * BEAT, dest)
  })
}

const tick = () => {
  if (!playing || !ctx) return
  while (nextBarTime < ctx.currentTime + 0.25) {
    try {
      scheduleBar(barCounter++, nextBarTime)
    } catch (e) {
      break
    }
    nextBarTime += BAR
  }
}

const fadeMusicTo = (level, seconds) => {
  if (!ctx || !musicBus) return
  const now = ctx.currentTime
  const g = musicBus.gain
  g.cancelScheduledValues(now)
  g.setValueAtTime(g.value, now)
  g.linearRampToValueAtTime(level, now + seconds)
}

export const gameMusic = {
  start() {
    if (playing) return
    if (!ensureCtx()) return
    playing = true
    barCounter = 0
    nextBarTime = ctx.currentTime + 0.12
    fadeMusicTo(MUSIC_LEVEL, 0.9)
    if (musicTimer) clearInterval(musicTimer)
    musicTimer = setInterval(tick, 50)
    tick()
  },

  stop() {
    playing = false
    if (musicTimer) {
      clearInterval(musicTimer)
      musicTimer = null
    }
    // Bars already queued fade out with the bus rather than being cut off
    fadeMusicTo(0, 0.45)
  },

  // 'calm' | 'battle' | 'crisis' — picked up on the next scheduled bar
  setIntensity(level) {
    if (level === 'calm' || level === 'battle' || level === 'crisis') intensity = level
  },

  get isPlaying() {
    return playing
  }
}
