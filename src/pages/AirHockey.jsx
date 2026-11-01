import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaTrophy, FaRobot, FaGlobe, FaCopy, FaCheck, FaTimes, FaVolumeUp, FaVolumeMute, FaRedo, FaSatelliteDish } from 'react-icons/fa'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { playSFX } from '../audio/gameAudio'
import { TABLE, createMatch, stepMatch, driveAI, snapshot } from '../airHockey/engine'

const CHANNEL_PREFIX = 'air_hockey_room_'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const makeCode = () => Array.from({ length: 5 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')

const FIXED_DT = 1 / 120
const STATE_HZ = 20
const INPUT_HZ = 30

const AirHockey = () => {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState('cpu')
  const [difficulty, setDifficulty] = useState('medium')
  const [mySide, setMySide] = useState('p1')
  const [roomCode, setRoomCode] = useState('')
  const [joinInput, setJoinInput] = useState('')
  const [onlineStatus, setOnlineStatus] = useState('idle')
  const [onlineError, setOnlineError] = useState('')
  const [peerConnected, setPeerConnected] = useState(false)
  const [hud, setHud] = useState({ p1: 0, p2: 0, phase: 'serve', winner: null, banner: '' })
  const [sfxOn, setSfxOn] = useState(true)
  const [copied, setCopied] = useState(false)
  const [ping, setPing] = useState(null)

  const canvasRef = useRef(null)
  const matchRef = useRef(createMatch())
  const channelRef = useRef(null)
  const rafRef = useRef(null)
  const clockRef = useRef({ last: 0, acc: 0, lastState: 0, lastInput: 0, tick: 0 })
  const modeRef = useRef('cpu')
  const sideRef = useRef('p1')
  const sfxRef = useRef(true)
  const peerRef = useRef(false)
  const difficultyRef = useRef('medium')
  const remoteRef = useRef(null)
  const trailRef = useRef([])
  const hudRef = useRef({ p1: -1, p2: -1, phase: '', winner: null })
  const hadPeerRef = useRef(false)

  modeRef.current = mode
  sideRef.current = mySide
  sfxRef.current = sfxOn
  peerRef.current = peerConnected
  difficultyRef.current = difficulty

  const oppSide = mySide === 'p1' ? 'p2' : 'p1'

  const sfx = useCallback((name) => {
    if (sfxRef.current) playSFX(name, true)
  }, [])

  const handleEvents = useCallback((events) => {
    for (const ev of events) {
      if (ev.type === 'paddle') {
        if (ev.power > 950) sfx('attack')
        else sfx('hit')
      } else if (ev.type === 'wall') {
        sfx('target')
      } else if (ev.type === 'goal') {
        sfx('destroy')
        setHud(h => ({ ...h, banner: ev.by === sideRef.current ? 'GOAL!' : 'CONCEDED' }))
      } else if (ev.type === 'win') {
        sfx(ev.by === sideRef.current ? 'victory' : 'defeat')
        setHud(h => ({ ...h, banner: '' }))
      } else if (ev.type === 'serve') {
        setHud(h => ({ ...h, banner: '' }))
      }
    }
  }, [sfx])

  /* ---------------------------------------------------------------- */
  /* RENDERING                                                         */
  /* ---------------------------------------------------------------- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const m = matchRef.current
    const flip = sideRef.current === 'p2'
    const W = TABLE.W
    const H = TABLE.H
    const vy = (y) => (flip ? H - y : y)

    ctx.save()
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const ice = ctx.createLinearGradient(0, 0, 0, H)
    ice.addColorStop(0, '#0a1024')
    ice.addColorStop(0.5, '#131d3d')
    ice.addColorStop(1, '#0a1024')
    ctx.fillStyle = ice
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(94, 234, 212, 0.26)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, 78, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, 11, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(94, 234, 212, 0.32)'
    ctx.fill()

    const crease = (y, color) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(W / 2, y, 108, y === 0 ? 0 : Math.PI, y === 0 ? Math.PI : Math.PI * 2)
      ctx.stroke()
    }
    crease(0, 'rgba(244, 114, 182, 0.4)')
    crease(H, 'rgba(56, 189, 248, 0.4)')

    const mouth = (y, color) => {
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 26
      ctx.fillRect(W / 2 - TABLE.GOAL_W / 2, y === 0 ? -6 : H - 6, TABLE.GOAL_W, 12)
      ctx.shadowBlur = 0
    }
    mouth(0, 'rgba(244, 114, 182, 0.9)')
    mouth(H, 'rgba(56, 189, 248, 0.9)')

    const trail = trailRef.current
    for (let i = 0; i < trail.length; i++) {
      const f = i / trail.length
      ctx.beginPath()
      ctx.arc(trail[i].x, vy(trail[i].y), TABLE.PUCK_R * (0.35 + 0.6 * f), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(226, 232, 240, ${f * 0.28})`
      ctx.fill()
    }

    const p = m.puck
    const puckGrad = ctx.createRadialGradient(p.x - 5, vy(p.y) - 5, 2, p.x, vy(p.y), TABLE.PUCK_R)
    puckGrad.addColorStop(0, '#f8fafc')
    puckGrad.addColorStop(1, '#94a3b8')
    ctx.beginPath()
    ctx.arc(p.x, vy(p.y), TABLE.PUCK_R, 0, Math.PI * 2)
    ctx.fillStyle = puckGrad
    ctx.shadowColor = 'rgba(248, 250, 252, 0.85)'
    ctx.shadowBlur = 20
    ctx.fill()
    ctx.shadowBlur = 0

    const mallet = (pad, color, isMine) => {
      const y = vy(pad.y)
      const g = ctx.createRadialGradient(pad.x - 9, y - 9, 4, pad.x, y, TABLE.PADDLE_R)
      g.addColorStop(0, isMine ? '#e0f2fe' : '#fce7f3')
      g.addColorStop(1, color)
      ctx.beginPath()
      ctx.arc(pad.x, y, TABLE.PADDLE_R, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.shadowColor = color
      ctx.shadowBlur = isMine ? 28 : 18
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(pad.x, y, TABLE.PADDLE_R * 0.44, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.5)'
      ctx.fill()
    }
    mallet(m.paddles.p1, '#0ea5e9', sideRef.current === 'p1')
    mallet(m.paddles.p2, '#ec4899', sideRef.current === 'p2')

    ctx.restore()
  }, [])

  /* ---------------------------------------------------------------- */
  /* MAIN LOOP                                                         */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (screen !== 'game') return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = TABLE.W * dpr
    canvas.height = TABLE.H * dpr

    const sendState = () => {
      const ch = channelRef.current
      if (!ch || !peerRef.current) return
      ch.send({ type: 'broadcast', event: 'state', payload: { ...snapshot(matchRef.current), sentAt: Date.now() } }).catch(() => {})
    }

    const sendInput = () => {
      const ch = channelRef.current
      if (!ch || !peerRef.current) return
      const pad = matchRef.current.paddles[sideRef.current]
      ch.send({ type: 'broadcast', event: 'paddle', payload: { x: pad.tx, y: pad.ty, t: Date.now() } }).catch(() => {})
    }

    const simulate = (m, frame) => {
      const c = clockRef.current
      c.acc += frame
      const events = []
      let guard = 0
      while (c.acc >= FIXED_DT && guard < 20) {
        stepMatch(m, FIXED_DT, events)
        c.acc -= FIXED_DT
        guard++
      }
      return events
    }

    const loop = (ts) => {
      const c = clockRef.current
      if (!c.last) c.last = ts
      const frame = Math.min((ts - c.last) / 1000, 0.06)
      c.last = ts
      c.tick += frame
      const m = matchRef.current
      const side = sideRef.current

      if (modeRef.current === 'cpu') {
        driveAI(m, 'p2', difficultyRef.current, c.tick * 3)
        const events = simulate(m, frame)
        if (events.length) handleEvents(events)
      } else if (side === 'p1') {
        const events = simulate(m, frame)
        if (events.length) handleEvents(events)
        if (ts - c.lastState > 1000 / STATE_HZ) {
          c.lastState = ts
          sendState()
        }
      } else {
        // Guest: the host owns the simulation, so extrapolate between snapshots.
        const snap = remoteRef.current
        if (snap) {
          const age = Math.min((Date.now() - snap.at) / 1000, 0.22)
          m.puck.x = Math.max(TABLE.PUCK_R, Math.min(TABLE.W - TABLE.PUCK_R, snap.puck.x + snap.puck.vx * age))
          m.puck.y = Math.max(TABLE.PUCK_R, Math.min(TABLE.H - TABLE.PUCK_R, snap.puck.y + snap.puck.vy * age))
          m.puck.vx = snap.puck.vx
          m.puck.vy = snap.puck.vy

          const opp = m.paddles[side === 'p1' ? 'p2' : 'p1']
          const k = Math.min(1, frame * 18)
          opp.x += (snap[side === 'p1' ? 'p2' : 'p1'].x - opp.x) * k
          opp.y += (snap[side === 'p1' ? 'p2' : 'p1'].y - opp.y) * k

          const prevP1 = m.score.p1
          const prevP2 = m.score.p2
          m.score.p1 = snap.score.p1
          m.score.p2 = snap.score.p2

          if (m.phase !== snap.phase) {
            if (snap.phase === 'goal') {
              handleEvents([{ type: 'goal', by: snap.score.p1 > prevP1 ? 'p1' : snap.score.p2 > prevP2 ? 'p2' : snap.serve === -1 ? 'p1' : 'p2' }])
            } else if (snap.phase === 'over') {
              handleEvents([{ type: 'win', by: snap.winner }])
            } else if (snap.phase === 'playing') {
              handleEvents([{ type: 'serve' }])
            }
            m.phase = snap.phase
            m.winner = snap.winner
          }
          m.timer = snap.timer
          m.serve = snap.serve
        }

        // Own mallet stays locally authoritative so input never feels laggy.
        const mine = m.paddles[side]
        const dx = mine.tx - mine.x
        const dy = mine.ty - mine.y
        const d = Math.hypot(dx, dy)
        if (d > 0.001) {
          const step = Math.min(d, TABLE.MAX_PADDLE_SPEED * frame)
          mine.x += (dx / d) * step
          mine.y += (dy / d) * step
        }
        const r = TABLE.PADDLE_R
        mine.x = Math.max(r, Math.min(TABLE.W - r, mine.x))
        mine.y = side === 'p1'
          ? Math.max(TABLE.H / 2 + r, Math.min(TABLE.H - r, mine.y))
          : Math.max(r, Math.min(TABLE.H / 2 - r, mine.y))

        if (ts - c.lastInput > 1000 / INPUT_HZ) {
          c.lastInput = ts
          sendInput()
        }
      }

      const t = trailRef.current
      t.push({ x: m.puck.x, y: m.puck.y })
      if (t.length > 9) t.shift()

      draw()

      const prev = hudRef.current
      if (prev.p1 !== m.score.p1 || prev.p2 !== m.score.p2 || prev.phase !== m.phase || prev.winner !== m.winner) {
        hudRef.current = { p1: m.score.p1, p2: m.score.p2, phase: m.phase, winner: m.winner }
        setHud(h => ({ ...h, p1: m.score.p1, p2: m.score.p2, phase: m.phase, winner: m.winner }))
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      clockRef.current.last = 0
      clockRef.current.acc = 0
      trailRef.current = []
    }
  }, [screen, draw, handleEvents])

  /* ---------------------------------------------------------------- */
  /* INPUT                                                             */
  /* ---------------------------------------------------------------- */
  const handlePointer = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const m = matchRef.current
    if (m.phase === 'over') return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * TABLE.W
    let y = ((e.clientY - rect.top) / rect.height) * TABLE.H
    const side = sideRef.current
    if (side === 'p2') y = TABLE.H - y

    const r = TABLE.PADDLE_R
    const pad = m.paddles[side]
    pad.tx = Math.max(r, Math.min(TABLE.W - r, x))
    pad.ty = side === 'p1'
      ? Math.max(TABLE.H / 2 + r, Math.min(TABLE.H - r, y))
      : Math.max(r, Math.min(TABLE.H / 2 - r, y))
  }

  const handlePointerDown = (e) => {
    if (e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture unsupported */ }
    }
    handlePointer(e)
  }

  /* ---------------------------------------------------------------- */
  /* ONLINE CHANNEL                                                    */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (screen !== 'game' || modeRef.current !== 'online' || !roomCode) return
    if (!isSupabaseConfigured || !supabase) {
      setOnlineError('Online play needs Supabase keys (VITE_SUPABASE_URL and a publishable key).')
      setOnlineStatus('error')
      return
    }

    const side = sideRef.current
    hadPeerRef.current = false
    const channel = supabase.channel(`${CHANNEL_PREFIX}${roomCode}`, {
      config: {
        broadcast: { ack: true, self: false },
        presence: { key: `${side}-${Math.random().toString(36).slice(2, 8)}` }
      }
    })
    channelRef.current = channel

    const markPeer = () => {
      const players = Object.values(channel.presenceState()).flat()
      const hasOpponent = players.some(pl => pl.side && pl.side !== side)
      setPeerConnected(hasOpponent)
      if (hasOpponent) {
        hadPeerRef.current = true
        setOnlineStatus('connected')
        setOnlineError('')
      } else if (hadPeerRef.current) {
        setOnlineStatus('closed')
        setOnlineError('Your opponent left the rink.')
      } else {
        setOnlineStatus('waiting')
      }
    }

    channel
      .on('broadcast', { event: 'state' }, ({ payload }) => {
        if (sideRef.current === 'p1' || !payload) return
        remoteRef.current = { ...payload, at: Date.now() }
        if (payload.sentAt) setPing(Date.now() - payload.sentAt)
      })
      .on('broadcast', { event: 'paddle' }, ({ payload }) => {
        if (sideRef.current !== 'p1' || !payload) return
        const pad = matchRef.current.paddles.p2
        pad.tx = payload.x
        pad.ty = payload.y
        if (payload.t) setPing(Math.max(0, Date.now() - payload.t))
      })
      .on('broadcast', { event: 'rematch' }, () => {
        matchRef.current = createMatch()
        hudRef.current = { p1: -1, p2: -1, phase: '', winner: null }
        remoteRef.current = null
        setHud({ p1: 0, p2: 0, phase: 'serve', winner: null, banner: '' })
      })
      .on('presence', { event: 'sync' }, markPeer)
      .on('presence', { event: 'join' }, markPeer)
      .on('presence', { event: 'leave' }, markPeer)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ side, joinedAt: Date.now() })
          if (side === 'p1') {
            channel.send({ type: 'broadcast', event: 'state', payload: { ...snapshot(matchRef.current), sentAt: Date.now() } }).catch(() => {})
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setOnlineStatus('error')
          setOnlineError('Could not reach the realtime server. Check your connection and try again.')
        }
      })

    return () => {
      if (channelRef.current === channel) channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [screen, roomCode, mySide])

  /* ---------------------------------------------------------------- */
  /* FLOW                                                              */
  /* ---------------------------------------------------------------- */
  const freshMatch = () => {
    matchRef.current = createMatch()
    remoteRef.current = null
    trailRef.current = []
    hudRef.current = { p1: -1, p2: -1, phase: '', winner: null }
    clockRef.current = { last: 0, acc: 0, lastState: 0, lastInput: 0, tick: clockRef.current.tick }
    setHud({ p1: 0, p2: 0, phase: 'serve', winner: null, banner: '' })
    setPing(null)
  }

  const startCpu = (level) => {
    setMode('cpu')
    setDifficulty(level)
    setMySide('p1')
    setOnlineStatus('idle')
    setOnlineError('')
    setPeerConnected(false)
    freshMatch()
    setScreen('game')
    sfx('turn')
  }

  const startOnline = (side, code) => {
    setMode('online')
    setMySide(side)
    setRoomCode(code)
    setPeerConnected(false)
    setOnlineError('')
    setOnlineStatus('connecting')
    freshMatch()
    setScreen('game')
    sfx('turn')
  }

  const joinRoom = () => {
    const code = joinInput.trim().toUpperCase()
    if (code.length < 4) {
      setOnlineError('Enter the 5-character room code your friend shared.')
      sfx('error')
      return
    }
    startOnline('p2', code)
  }

  const quitToMenu = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (channelRef.current && supabase) {
      const ch = channelRef.current
      channelRef.current = null
      try { ch.send({ type: 'broadcast', event: 'left', payload: {} }).catch(() => {}) } catch { /* already closed */ }
      supabase.removeChannel(ch)
    }
    setPeerConnected(false)
    setOnlineStatus('idle')
    setOnlineError('')
    setScreen('menu')
  }

  const rematch = () => {
    freshMatch()
    if (channelRef.current && peerRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'rematch', payload: {} }).catch(() => {})
    }
    sfx('turn')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  const myScore = hud[mySide]
  const oppScore = hud[oppSide]
  const showWaiting = mode === 'online' && !peerConnected && onlineStatus !== 'error' && onlineStatus !== 'closed'

  return (
    <div className="air-hockey-page">
      <h1 className="lg-heading">
        Neon <span className="text-secondary">Air Hockey</span>
      </h1>

      {screen === 'menu' && (
        <div className="ah-menu">
          <p className="ah-menu-intro">
            First to {TABLE.WIN_SCORE} goals takes the rink. Drag inside your half to slide the mallet, swipe fast to smash.
          </p>

          <div className="ah-panel">
            <h3 className="ah-panel-title"><FaRobot /> Practice vs CPU</h3>
            <div className="ah-difficulty-row">
              {[['easy', 'Rookie'], ['medium', 'Pro'], ['hard', 'Legend']].map(([level, label]) => (
                <button
                  key={level}
                  className={`ah-diff-btn ${difficulty === level ? 'active' : ''}`}
                  onClick={() => setDifficulty(level)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="ah-primary-btn" onClick={() => startCpu(difficulty)}>Start Match</button>
          </div>

          <div className="ah-panel">
            <h3 className="ah-panel-title"><FaGlobe /> Online 2-Player</h3>
            {!isSupabaseConfigured && (
              <p className="ah-note warn">Supabase keys are missing, so online play is unavailable. Practice mode still works.</p>
            )}
            <button className="ah-primary-btn" onClick={() => startOnline('p1', makeCode())} disabled={!isSupabaseConfigured}>
              <FaSatelliteDish /> Host a rink &amp; get a code
            </button>
            <div className="ah-join-row">
              <input
                className="ah-code-input"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="ROOM CODE"
                aria-label="Room code"
                disabled={!isSupabaseConfigured}
              />
              <button className="ah-primary-btn" onClick={joinRoom} disabled={!isSupabaseConfigured}>Join</button>
            </div>
            {onlineError && <p className="ah-note warn">{onlineError}</p>}
            <p className="ah-note">
              Host a rink, send the 5-character code to a friend and have them paste it here. Both play in the browser, no accounts needed.
            </p>
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="ah-game">
          <div className="ah-scoreboard">
            <div className={`ah-score ${mySide === 'p1' ? 'blue' : 'pink'}`}>
              <span className="ah-score-label">You</span>
              <span className="ah-score-value">{myScore}</span>
            </div>
            <div className="ah-score-center">
              <span className="ah-vs">VS</span>
              {mode === 'online' ? (
                <span className={`ah-link-badge ${peerConnected ? 'on' : 'off'}`}>
                  <FaSatelliteDish /> {peerConnected ? 'linked' : onlineStatus === 'error' ? 'offline' : 'waiting'}
                  {ping !== null && peerConnected && <em>{ping}ms</em>}
                </span>
              ) : (
                <span className="ah-link-badge on"><FaRobot /> CPU {difficulty}</span>
              )}
            </div>
            <div className={`ah-score ${mySide === 'p1' ? 'pink' : 'blue'}`}>
              <span className="ah-score-label">{mode === 'cpu' ? 'CPU' : 'Rival'}</span>
              <span className="ah-score-value">{oppScore}</span>
            </div>
          </div>

          <div className="ah-rink-wrap">
            <canvas
              ref={canvasRef}
              className="ah-rink"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointer}
            />

            {hud.banner && hud.phase !== 'over' && <div className="ah-banner">{hud.banner}</div>}

            {showWaiting && (
              <div className="ah-overlay">
                <div className="ah-overlay-card">
                  <h3>Room {roomCode}</h3>
                  <p>Waiting for your opponent to join&hellip;</p>
                  <button className="ah-primary-btn" onClick={copyCode}>
                    {copied ? <FaCheck /> : <FaCopy />} {copied ? 'Code copied' : `Copy code ${roomCode}`}
                  </button>
                  <button className="ah-ghost-btn" onClick={quitToMenu}><FaTimes /> Cancel</button>
                </div>
              </div>
            )}

            {(onlineStatus === 'error' || onlineStatus === 'closed') && (
              <div className="ah-overlay">
                <div className="ah-overlay-card">
                  <h3>{onlineStatus === 'error' ? 'Connection problem' : 'Opponent disconnected'}</h3>
                  <p>{onlineError}</p>
                  <div className="ah-overlay-actions">
                    <button className="ah-primary-btn" onClick={quitToMenu}>Back to menu</button>
                  </div>
                </div>
              </div>
            )}

            {hud.phase === 'over' && (
              <div className="ah-overlay">
                <div className="ah-overlay-card">
                  <h3>
                    <FaTrophy /> {hud.winner === mySide ? 'You win!' : mode === 'cpu' ? 'CPU wins' : 'Rival wins'}
                  </h3>
                  <p className="ah-final-score">{myScore} &ndash; {oppScore}</p>
                  <div className="ah-overlay-actions">
                    <button className="ah-primary-btn" onClick={rematch}><FaRedo /> Rematch</button>
                    <button className="ah-ghost-btn" onClick={quitToMenu}>Menu</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ah-controls">
            <button className="ah-ghost-btn" onClick={() => setSfxOn(v => !v)}>
              {sfxOn ? <FaVolumeUp /> : <FaVolumeMute />} {sfxOn ? 'Sound on' : 'Muted'}
            </button>
            {mode === 'online' && (
              <button className="ah-ghost-btn" onClick={copyCode}>
                {copied ? <FaCheck /> : <FaCopy />} {roomCode}
              </button>
            )}
            <button className="ah-ghost-btn danger" onClick={quitToMenu}><FaTimes /> Quit</button>
          </div>

          <p className="ah-hint">
            You are the {mySide === 'p1' ? 'bottom (blue)' : 'top (pink)'} mallet. The puck resets to centre after every goal.
          </p>
        </div>
      )}
    </div>
  )
}

export default AirHockey
