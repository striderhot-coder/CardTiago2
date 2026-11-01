/**
 * Air hockey simulation. Table coordinates are fixed and shared by both
 * players: p1 defends the bottom (y = H), p2 defends the top (y = 0).
 * Rendering flips the y axis for whoever plays as p2.
 */

export const TABLE = {
  W: 600,
  H: 900,
  GOAL_W: 220,
  PUCK_R: 18,
  PADDLE_R: 34,
  WIN_SCORE: 7,
  MAX_PUCK_SPEED: 1750,
  MAX_PADDLE_SPEED: 1450,
  SERVE_SPEED: 260,
  GOAL_PAUSE: 1.4,
  SERVE_PAUSE: 0.9
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

const homeY = (side) => (side === 'p1' ? TABLE.H * 0.82 : TABLE.H * 0.18)

const makePaddle = (side) => ({
  x: TABLE.W / 2,
  y: homeY(side),
  px: TABLE.W / 2,
  py: homeY(side),
  vx: 0,
  vy: 0,
  tx: TABLE.W / 2,
  ty: homeY(side)
})

export const createMatch = () => ({
  puck: { x: TABLE.W / 2, y: TABLE.H / 2, vx: 0, vy: 0 },
  paddles: { p1: makePaddle('p1'), p2: makePaddle('p2') },
  score: { p1: 0, p2: 0 },
  phase: 'serve',
  timer: 1.2,
  serve: Math.random() < 0.5 ? 1 : -1,
  winner: null,
  stall: 0,
  rally: 0
})

export const resetPuck = (m, serveDir) => {
  m.puck.x = TABLE.W / 2
  m.puck.y = TABLE.H / 2
  m.puck.vx = 0
  m.puck.vy = 0
  m.serve = serveDir
  m.stall = 0
}

const movePaddle = (p, dt, side) => {
  p.px = p.x
  p.py = p.y

  const dx = p.tx - p.x
  const dy = p.ty - p.y
  const dist = Math.hypot(dx, dy)
  if (dist > 0.0001) {
    const step = Math.min(dist, TABLE.MAX_PADDLE_SPEED * dt)
    p.x += (dx / dist) * step
    p.y += (dy / dist) * step
  }

  const r = TABLE.PADDLE_R
  p.x = clamp(p.x, r, TABLE.W - r)
  p.y = side === 'p1' ? clamp(p.y, TABLE.H / 2 + r, TABLE.H - r) : clamp(p.y, r, TABLE.H / 2 - r)

  p.vx = dt > 0 ? (p.x - p.px) / dt : 0
  p.vy = dt > 0 ? (p.y - p.py) / dt : 0
}

const clampPuckSpeed = (puck) => {
  const sp = Math.hypot(puck.vx, puck.vy)
  if (sp > TABLE.MAX_PUCK_SPEED) {
    const k = TABLE.MAX_PUCK_SPEED / sp
    puck.vx *= k
    puck.vy *= k
  }
}

const inGoalMouth = (x) => Math.abs(x - TABLE.W / 2) < TABLE.GOAL_W / 2 - TABLE.PUCK_R * 0.35

const collidePaddle = (puck, pad, events) => {
  const sum = TABLE.PUCK_R + TABLE.PADDLE_R
  const dx = puck.x - pad.x
  const dy = puck.y - pad.y
  const dist = Math.hypot(dx, dy)
  if (dist >= sum || dist === 0) return false

  const nx = dx / dist
  const ny = dy / dist

  puck.x = pad.x + nx * sum
  puck.y = pad.y + ny * sum

  const relX = puck.vx - pad.vx
  const relY = puck.vy - pad.vy
  const vn = relX * nx + relY * ny

  if (vn < 0) {
    const j = -1.02 * vn
    puck.vx += j * nx
    puck.vy += j * ny
  }

  // A moving mallet carries the puck: transfer part of its momentum so a fast
  // swipe hits harder than a stationary block.
  puck.vx += pad.vx * 0.45
  puck.vy += pad.vy * 0.45

  // Never let a hit send the puck back into its own mallet.
  const out = puck.vx * nx + puck.vy * ny
  if (out < 60) {
    puck.vx += (60 - out) * nx
    puck.vy += (60 - out) * ny
  }

  clampPuckSpeed(puck)
  events.push({ type: 'paddle', power: Math.hypot(puck.vx, puck.vy) })
  return true
}

const integrate = (m, dt, events) => {
  const puck = m.puck
  const speed = Math.hypot(puck.vx, puck.vy)
  const sub = clamp(Math.ceil((speed * dt) / (TABLE.PUCK_R * 0.6)), 1, 8)
  const h = dt / sub

  for (let i = 0; i < sub; i++) {
    puck.x += puck.vx * h
    puck.y += puck.vy * h

    const r = TABLE.PUCK_R

    if (puck.x < r) {
      puck.x = r
      puck.vx = Math.abs(puck.vx) * 0.94
      events.push({ type: 'wall' })
    } else if (puck.x > TABLE.W - r) {
      puck.x = TABLE.W - r
      puck.vx = -Math.abs(puck.vx) * 0.94
      events.push({ type: 'wall' })
    }

    if (puck.y < r) {
      if (inGoalMouth(puck.x)) {
        m.score.p1 += 1
        events.push({ type: 'goal', by: 'p1' })
        return
      }
      puck.y = r
      puck.vy = Math.abs(puck.vy) * 0.94
      events.push({ type: 'wall' })
    } else if (puck.y > TABLE.H - r) {
      if (inGoalMouth(puck.x)) {
        m.score.p2 += 1
        events.push({ type: 'goal', by: 'p2' })
        return
      }
      puck.y = TABLE.H - r
      puck.vy = -Math.abs(puck.vy) * 0.94
      events.push({ type: 'wall' })
    }

    if (collidePaddle(puck, m.paddles.p1, events)) m.rally += 1
    if (collidePaddle(puck, m.paddles.p2, events)) m.rally += 1
  }

  // Air hockey tables are slick; keep a trace of drag so rallies eventually end.
  const damp = Math.pow(0.9992, dt * 60)
  puck.vx *= damp
  puck.vy *= damp

  if (Math.hypot(puck.vx, puck.vy) < 26) {
    m.stall += dt
    if (m.stall > 3) {
      // Dead puck: nudge it toward whichever half it is sitting in so play resumes.
      const dir = puck.y < TABLE.H / 2 ? -1 : 1
      puck.vy += dir * 90
      puck.vx += (Math.random() - 0.5) * 60
      m.stall = 0
    }
  } else {
    m.stall = 0
  }
}

export const stepMatch = (m, dt, events = []) => {
  movePaddle(m.paddles.p1, dt, 'p1')
  movePaddle(m.paddles.p2, dt, 'p2')

  if (m.phase === 'over') return events

  if (m.phase === 'serve' || m.phase === 'goal') {
    m.timer -= dt
    if (m.timer <= 0) {
      if (m.phase === 'goal') {
        if (m.score.p1 >= TABLE.WIN_SCORE || m.score.p2 >= TABLE.WIN_SCORE) {
          m.phase = 'over'
          m.winner = m.score.p1 > m.score.p2 ? 'p1' : 'p2'
          events.push({ type: 'win', by: m.winner })
          return events
        }
        // The player who conceded serves, so the goal restart never snowballs.
        resetPuck(m, m.serve)
        m.phase = 'serve'
        m.timer = TABLE.SERVE_PAUSE
      } else {
        m.puck.vy = m.serve * TABLE.SERVE_SPEED
        m.puck.vx = (Math.random() - 0.5) * 90
        m.phase = 'playing'
        events.push({ type: 'serve' })
      }
    }
    return events
  }

  integrate(m, dt, events)

  if (events.some(e => e.type === 'goal')) {
    const by = events.find(e => e.type === 'goal').by
    m.phase = 'goal'
    m.timer = TABLE.GOAL_PAUSE
    m.rally = 0
    m.serve = by === 'p1' ? -1 : 1
    resetPuck(m, m.serve)
    if (m.score[by] >= TABLE.WIN_SCORE) {
      m.phase = 'over'
      m.winner = by
      events.push({ type: 'win', by })
    }
  }

  return events
}

/** Predict where the puck crosses a horizontal line, mirroring off the walls. */
const predictX = (puck, targetY) => {
  if (Math.abs(puck.vy) < 1) return puck.x
  const t = (targetY - puck.y) / puck.vy
  if (t < 0) return puck.x
  let x = puck.x + puck.vx * t
  const span = TABLE.W
  const folded = ((x % (2 * span)) + 2 * span) % (2 * span)
  return folded <= span ? folded : 2 * span - folded
}

export const DIFFICULTIES = {
  easy: { speed: 330, defenseY: 0.14, error: 46, aggression: 0.25 },
  medium: { speed: 500, defenseY: 0.2, error: 22, aggression: 0.55 },
  hard: { speed: 700, defenseY: 0.26, error: 8, aggression: 0.85 }
}

/**
 * CPU mallet driver. Writes the target the paddle steers toward and returns
 * nothing; the shared paddle mover turns it into velocity, so a CPU strike
 * transfers momentum exactly like a human one.
 */
export const driveAI = (m, side, level = 'medium', jitterSeed = 0) => {
  const cfg = DIFFICULTIES[level] || DIFFICULTIES.medium
  const pad = m.paddles[side]
  const puck = m.puck
  const myGoalY = side === 'p1' ? TABLE.H : 0
  const defenseY = side === 'p1' ? TABLE.H * (1 - cfg.defenseY) : TABLE.H * cfg.defenseY
  const coming = side === 'p1' ? puck.vy > 0 : puck.vy < 0
  const inMyHalf = side === 'p1' ? puck.y > TABLE.H / 2 : puck.y < TABLE.H / 2
  const wobble = Math.sin(jitterSeed) * cfg.error

  let tx
  let ty = defenseY

  if (inMyHalf && (coming || cfg.aggression > Math.random())) {
    // Strike: get behind the puck so the hit sends it at the far goal.
    const behind = side === 'p1' ? puck.y + TABLE.PUCK_R + TABLE.PADDLE_R * 0.7 : puck.y - TABLE.PUCK_R - TABLE.PADDLE_R * 0.7
    tx = puck.x + wobble * 0.4
    ty = clamp(behind, side === 'p1' ? TABLE.H / 2 + TABLE.PADDLE_R : TABLE.PADDLE_R, side === 'p1' ? TABLE.H - TABLE.PADDLE_R : TABLE.H / 2 - TABLE.PADDLE_R)
    if (Math.random() < cfg.aggression * 0.6) tx = puck.x + (puck.x > TABLE.W / 2 ? -1 : 1) * TABLE.PADDLE_R * 0.6
  } else if (coming) {
    tx = predictX(puck, defenseY) + wobble
  } else {
    tx = TABLE.W / 2 + wobble * 0.5
  }

  const maxStep = cfg.speed / 60
  const dx = clamp(tx, TABLE.PADDLE_R, TABLE.W - TABLE.PADDLE_R) - pad.x
  const dy = ty - pad.y
  const dist = Math.hypot(dx, dy)
  const k = dist > maxStep ? maxStep / dist : 1

  pad.tx = pad.x + dx * k * 3
  pad.ty = pad.y + dy * k * 3
  pad.tx = clamp(pad.tx, TABLE.PADDLE_R, TABLE.W - TABLE.PADDLE_R)
  pad.ty = clamp(pad.ty, side === 'p1' ? TABLE.H / 2 + TABLE.PADDLE_R : TABLE.PADDLE_R, side === 'p1' ? TABLE.H - TABLE.PADDLE_R : TABLE.H / 2 - TABLE.PADDLE_R)
  void myGoalY
}

export const snapshot = (m) => ({
  puck: { x: m.puck.x, y: m.puck.y, vx: m.puck.vx, vy: m.puck.vy },
  p1: { x: m.paddles.p1.x, y: m.paddles.p1.y },
  p2: { x: m.paddles.p2.x, y: m.paddles.p2.y },
  score: { p1: m.score.p1, p2: m.score.p2 },
  phase: m.phase,
  timer: m.timer,
  serve: m.serve,
  winner: m.winner,
  t: Date.now()
})

/** Copy a remote snapshot into a local match without disturbing paddle targets. */
export const applySnapshot = (m, s) => {
  if (!s) return
  m.puck.x = s.puck.x
  m.puck.y = s.puck.y
  m.puck.vx = s.puck.vx
  m.puck.vy = s.puck.vy
  m.paddles.p1.x = s.p1.x
  m.paddles.p1.y = s.p1.y
  m.paddles.p2.x = s.p2.x
  m.paddles.p2.y = s.p2.y
  m.score.p1 = s.score.p1
  m.score.p2 = s.score.p2
  m.phase = s.phase
  m.timer = s.timer
  m.serve = s.serve
  m.winner = s.winner
}
