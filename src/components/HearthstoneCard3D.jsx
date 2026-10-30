import React, { useState, useRef } from 'react'
import { FaBolt, FaShieldAlt, FaGem, FaCrown, FaDragon } from 'react-icons/fa'

/**
 * Authentic 3D Hearthstone-Style Card Component
 * Includes interactive 3D mouse parallax tilt, specular foil glare,
 * fan hand angle, and multi-layer depth (mana, attack, health gems pop out).
 */
const HearthstoneCard3D = ({
  card,
  keywords,
  isPlayable = false,
  onClick,
  onPointerDown,
  onMouseDown,
  onTouchStart,
  isFanned = false,
  fanIndex = 0,
  fanTotal = 1,
  className = '',
  style = {},
  isDragging = false,
  showBack = false,
  onFlip
}) => {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false
  })

  // Calculate fan arch transform for hand layout
  const getFanTransform = () => {
    if (!isFanned || fanTotal <= 1) return ''
    const mid = (fanTotal - 1) / 2
    const delta = fanIndex - mid
    const angleStep = Math.min(6, 40 / fanTotal)
    const rotZ = delta * angleStep
    const transY = Math.abs(delta) * 5
    const transX = delta * 12
    return `translate3d(${transX}px, ${transY}px, 0) rotateZ(${rotZ}deg)`
  }

  // Handle 3D Parallax Mouse Move
  const handleMouseMove = (e) => {
    if (isDragging || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Normalize coordinates (-1 to 1)
    const normX = (x / rect.width - 0.5) * 2
    const normY = (y / rect.height - 0.5) * 2

    // Hearthstone card tilt: rotateX corresponds to mouseY, rotateY to mouseX
    const rotX = -normY * 20
    const rotY = normX * 20

    // Glare coordinates (0% to 100%)
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    setTilt({
      rotX,
      rotY,
      glareX,
      glareY,
      isHovered: true
    })
  }

  const handleMouseEnter = () => {
    setTilt(prev => ({ ...prev, isHovered: true }))
  }

  const handleMouseLeave = () => {
    setTilt({
      rotX: 0,
      rotY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false
    })
  }

  if (!card) return null

  const rarity = (card.rarity || 'common').toLowerCase()
  const isLegendary = rarity === 'legendary' || rarity === 'mythic'
  const isEpic = rarity === 'epic'
  const isRare = rarity === 'rare'
  const isSpell = card.type === 'Spell'

  // Dynamic 3D transform combining fan arch + mouse tilt
  const baseFan = getFanTransform()
  const hoverScale = tilt.isHovered ? 'scale3d(1.22, 1.22, 1.22) translateZ(60px) translateY(-35px)' : 'scale3d(1, 1, 1)'
  const tiltRotation = tilt.isHovered 
    ? `rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)` 
    : 'rotateX(0deg) rotateY(0deg)'

  const combinedTransform = isFanned && !tilt.isHovered
    ? baseFan
    : `${hoverScale} ${tiltRotation}`

  return (
    <div
      ref={cardRef}
      className={`hs-card-3d-wrapper rarity-${rarity} ${isPlayable ? 'hs-playable' : ''} ${tilt.isHovered ? 'hs-hovered' : ''} ${isDragging ? 'hs-dragging' : ''} ${isSpell ? 'is-spell-card' : ''} ${className}`}
      style={{
        transform: combinedTransform,
        zIndex: tilt.isHovered ? 50 : fanIndex + 1,
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className={`hs-card-3d-inner ${showBack ? 'is-flipped' : ''}`}>
        
        {/* ========================================================================= */}
        {/* FRONT FACE (AUTHENTIC HEARTHSTONE 3D LAYERS)                              */}
        {/* ========================================================================= */}
        <div className="hs-card-face hs-card-front">
          
          {/* LAYER 0: PLAYABLE GLOW AURA (Pulsing Green / Gold) */}
          {isPlayable && (
            <div className={`hs-card-playable-aura ${isLegendary ? 'legendary-aura' : ''}`} />
          )}

          {/* LAYER 1: CARD FRAME & ORNATE BORDER */}
          <div className="hs-card-frame-outer">
            {/* Legendary Dragon Crown */}
            {isLegendary && (
              <div className="hs-legendary-dragon-crest">
                <FaDragon className="dragon-icon" />
              </div>
            )}

            {/* LAYER 2: PORTRAIT ARTWORK WINDOW */}
            <div className={`hs-card-portrait-window ${isSpell ? 'hs-spell-window' : ''}`}>
              <img
                src={card.src}
                alt={card.name}
                className="hs-portrait-img"
                loading="lazy"
                draggable={false}
              />
              <div className="hs-portrait-inner-shadow" />
            </div>

            {/* LAYER 3: 3D MANA CRYSTAL (TOP LEFT) */}
            <div className="hs-mana-crystal-badge" title={`Cost: ${card.cost} Mana`}>
              <div className="mana-gem-shape">
                <span className="mana-number">{card.cost}</span>
              </div>
            </div>

            {/* LAYER 4: 3D RIBBON NAME BANNER */}
            <div className="hs-name-ribbon">
              <span className="hs-card-title">{card.name}</span>
            </div>

            {/* LAYER 5: RARITY GEM CREST (CENTER) */}
            <div className={`hs-rarity-gem-crest rarity-${rarity}`} title={`${card.rarity} Rarity`}>
              <div className="rarity-gem-facet" />
            </div>

            {/* LAYER 6: CARD TEXT BOX (PARCHMENT ABILITY & TYPE) */}
            <div className="hs-card-text-parchment">
              {keywords && keywords.length > 0 && (
                <div className="keyword-chips" style={{ marginBottom: '0.2rem', justifyContent: 'center' }}>
                  {keywords.map(k => (
                    <span key={k.id} className={`keyword-chip ${k.id}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>
                      {k.label}
                    </span>
                  ))}
                </div>
              )}
              <div className="hs-card-ability-desc">
                {card.ability || card.description || 'Ready for combat.'}
              </div>
              <div className="hs-card-type-label">
                {card.type} {card.faction ? `• ${card.faction}` : ''}
              </div>
            </div>

            {/* LAYER 7: 3D ATTACK BADGE (BOTTOM LEFT) - MINIONS ONLY */}
            {!isSpell && card.attack !== undefined && card.attack > 0 && (
              <div className="hs-stat-badge hs-attack-badge" title={`Attack: ${card.attack}`}>
                <div className="stat-spikes" />
                <span className="stat-value">{card.attack}</span>
              </div>
            )}

            {/* LAYER 8: 3D HEALTH BADGE (BOTTOM RIGHT) - MINIONS ONLY */}
            {!isSpell && card.health !== undefined && card.health > 0 && (
              <div className="hs-stat-badge hs-health-badge" title={`Health: ${card.health}`}>
                <div className="stat-ruby-glow" />
                <span className="stat-value">{card.health}</span>
              </div>
            )}
          </div>

          {/* LAYER 9: SPECULAR HOLOGRAPHIC FOIL & GLARE OVERLAY */}
          <div
            className={`hs-specular-foil-glare ${isLegendary ? 'holo-legendary' : isEpic ? 'holo-epic' : ''}`}
            style={{
              opacity: tilt.isHovered ? 0.75 : 0,
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 70%)`
            }}
          />

          {/* Holographic Prismatic Rainbow Sheen for Epic & Legendary */}
          {(isLegendary || isEpic) && (
            <div
              className="hs-holo-prismatic-sheen"
              style={{
                opacity: tilt.isHovered ? 0.55 : 0,
                backgroundPosition: `${tilt.glareX}% ${tilt.glareY}%`
              }}
            />
          )}
        </div>

        {/* ========================================================================= */}
        {/* BACK FACE (HEARTHSTONE BLUE RUNIC CARD BACK)                              */}
        {/* ========================================================================= */}
        <div className="hs-card-face hs-card-back">
          <div className="hs-card-back-pattern">
            <div className="hs-card-back-rune-core">
              <div className="rune-swirl" />
              <div className="rune-gem" />
            </div>
            <div className="hs-card-back-title">{card.name}</div>
            {card.lore && (
              <div className="hs-card-back-lore">
                <p>{card.lore}</p>
                {card.flavor && <em>"{card.flavor}"</em>}
              </div>
            )}
            {onFlip && (
              <button className="hs-back-flip-btn" onClick={onFlip}>
                Flip Front
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default HearthstoneCard3D
