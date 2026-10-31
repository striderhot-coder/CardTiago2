import React, { useState, useRef } from 'react'
import { FaShieldAlt, FaBolt, FaInfoCircle } from 'react-icons/fa'

/**
 * Authentic 3D Hearthstone-Style Minion Medallion on Battlefield
 * Features oval minion frame, carved Taunt stone shield wings,
 * pulsing green electric mana flame, 3D attack/health badges,
 * sleeping Zzz runes, and dynamic 3D tilt.
 */
const HearthstoneMinion3D = ({
  unit,
  owner,
  isPlayerTurn,
  isSelected = false,
  isTargetable = false,
  isSpellTarget = false,
  isAttacking = false,
  isImpacted = false,
  isDying = false,
  onInspect,
  onPointerDown,
  onMouseDown,
  onTouchStart,
  onClick
}) => {
  const minionRef = useRef(null)
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, isHovered: false })

  const handleMouseMove = (e) => {
    if (!minionRef.current) return
    const rect = minionRef.current.getBoundingClientRect()
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setTilt({
      rotX: -normY * 16,
      rotY: normX * 16,
      isHovered: true
    })
  }

  const handleMouseLeave = () => {
    setTilt({ rotX: 0, rotY: 0, isHovered: false })
  }

  if (!unit || !unit.card) return null

  const isReady = unit.readyToAttack
  const hasTaunt = unit.hasTaunt
  const isSleeping = !unit.readyToAttack && unit.currentHp > 0

  const tiltTransform = tilt.isHovered && !isAttacking
    ? `perspective(600px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) translateZ(18px) scale(1.08)`
    : ''

  // Without `touch-action: none` the browser turns a finger drag into a page
  // scroll and fires pointercancel, killing the drag-to-attack gesture.
  const isDragSource = !!onPointerDown && isReady

  return (
    <div
      ref={minionRef}
      data-unit-id={unit.instanceId}
      data-owner={owner}
      className={`hs-minion-3d-wrapper ${owner}-unit ${isReady ? 'is-ready' : 'is-exhausted'} ${isDragSource ? 'drag-targetable' : ''} ${isSelected ? 'is-selected' : ''} ${isTargetable ? 'is-targetable' : ''} ${isSpellTarget ? 'is-spell-target' : ''} ${hasTaunt ? 'has-taunt' : ''} ${isAttacking ? 'is-attacking-smash' : ''} ${isImpacted ? 'is-impact-recoil' : ''} ${isDying ? 'is-shattering' : ''} ${unit.isJustSummoned ? 'is-slamming-down' : ''}`}
      style={{
        transform: tiltTransform || undefined
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={onPointerDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={onClick}
    >
      {/* TAUNT CARVED STONE SHIELD FRAME */}
      {hasTaunt && (
        <div className="hs-minion-taunt-shield-wings" title="Taunt: Must be attacked first!">
          <div className="taunt-wing left-wing" />
          <div className="taunt-wing right-wing" />
          <div className="taunt-stone-crest" />
        </div>
      )}

      {/* READY ELECTRIC MANA FLAME (Swirling Green Aura) */}
      {isReady && isPlayerTurn && (
        <div className="hs-minion-ready-flame-aura">
          <div className="flame-ring ring-1" />
          <div className="flame-ring ring-2" />
        </div>
      )}

      {/* SLEEPING ZZZ RUNES */}
      {isSleeping && (
        <div className="hs-minion-sleeping-glyph" title="Exhausted: Cannot attack this turn">
          <span className="z-glyph z-1">z</span>
          <span className="z-glyph z-2">Z</span>
          <span className="z-glyph z-3">Z</span>
        </div>
      )}

      {/* SPELL TARGET AURA */}
      {isSpellTarget && (
        <div className="hs-minion-spell-target-ring" title="Valid spell target">
          <div className="spell-target-pulse" />
        </div>
      )}

      {/* OVAL MINION FRAME WITH BEVELED GOLD/BRONZE RIM */}
      <div className="hs-minion-oval-frame">
        <div className="hs-minion-portrait-mask">
          <img
            src={unit.card.src}
            alt={unit.card.name}
            className="hs-minion-portrait-img"
            draggable={false}
          />
          <div className="hs-minion-oval-specular" />
        </div>
        <div className="hs-minion-beveled-rim" />
      </div>

      {/* MINION NAME RIBBON ON HOVER */}
      <div className="hs-minion-title-banner">
        <span>{unit.card.name}</span>
      </div>

      {/* IN-GAME INSPECT BUTTON */}
      {onInspect && (
        <button
          className="hs-minion-inspect-btn"
          aria-label={`Inspect ${unit.card.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onInspect()
          }}
          title="Inspect Card Details"
        >
          <FaInfoCircle />
        </button>
      )}

      {/* 3D ATTACK EMBLEM (BOTTOM LEFT SPIKED SHIELD) */}
      <div className="hs-minion-stat-badge hs-minion-atk" title={`Attack: ${unit.attack}`}>
        <div className="minion-stat-shape atk-shield-shape">
          <FaBolt className="stat-mini-icon" />
          <span className="stat-text">{unit.attack}</span>
        </div>
      </div>

      {/* 3D HEALTH EMBLEM (BOTTOM RIGHT RUBY GEM) */}
      <div className="hs-minion-stat-badge hs-minion-hp" title={`Health: ${unit.currentHp}/${unit.maxHp}`}>
        <div className={`minion-stat-shape hp-gem-shape ${unit.currentHp < unit.maxHp ? 'is-damaged' : ''}`}>
          <FaShieldAlt className="stat-mini-icon" />
          <span className="stat-text">{unit.currentHp}</span>
        </div>
      </div>
    </div>
  )
}

export default HearthstoneMinion3D
