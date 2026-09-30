import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { scenarioData, charactersData, cardsData } from '../data/universeData'
import { 
  FaBookOpen, 
  FaUsers, 
  FaIdCard, 
  FaSearch, 
  FaShieldAlt, 
  FaBolt, 
  FaMagic, 
  FaCog, 
  FaTrophy, 
  FaTimes,
  FaRedo,
  FaFilter,
  FaGlobe,
  FaExclamationCircle,
  FaGamepad
} from 'react-icons/fa'

const Universe = () => {
  const [activeTab, setActiveTab] = useState('scenario')

  // Character State
  const [charFactionFilter, setCharFactionFilter] = useState('All')
  const [charSearchQuery, setCharSearchQuery] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  // Cards State
  const [cardRarityFilter, setCardRarityFilter] = useState('All')
  const [cardTypeFilter, setCardTypeFilter] = useState('All')
  const [cardSearchQuery, setCardSearchQuery] = useState('')
  const [flippedCards, setFlippedCards] = useState({})
  const [selectedCard, setSelectedCard] = useState(null)

  // Toggle card flip
  const toggleCardFlip = (cardId, e) => {
    e.stopPropagation()
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  // Filter Characters
  const filteredCharacters = charactersData.filter(char => {
    const matchesFaction = charFactionFilter === 'All' || char.faction === charFactionFilter
    const matchesSearch = char.name.toLowerCase().includes(charSearchQuery.toLowerCase()) || 
                          char.title.toLowerCase().includes(charSearchQuery.toLowerCase()) ||
                          char.role.toLowerCase().includes(charSearchQuery.toLowerCase())
    return matchesFaction && matchesSearch
  })

  // Filter Cards
  const filteredCards = cardsData.filter(card => {
    const matchesRarity = cardRarityFilter === 'All' || card.rarity === cardRarityFilter
    const matchesType = cardTypeFilter === 'All' || card.type === cardTypeFilter
    const matchesSearch = card.name.toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
                          card.ability.toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
                          card.faction.toLowerCase().includes(cardSearchQuery.toLowerCase())
    return matchesRarity && matchesType && matchesSearch
  })

  const rarities = ['All', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Common']
  const cardTypes = ['All', 'Hero', 'Unit', 'Spell', 'Artifact', 'Realm']
  const factions = ['All', 'Ethereal Nexus', 'Chrono Vanguard', 'Surreal Order', 'Iron Cabal']

  return (
    <div className="work-page universe-page">
      {/* Header Heading */}
      <h1 className="lg-heading">
        Universe <span className="text-secondary">& Cards</span>
      </h1>
      <h2 className="sm-heading">
        Immerse yourself in the story scenarios, character archives, and collectible trading cards.
      </h2>

      {/* Main Sub-Tabs Bar */}
      <div className="universe-tabs-bar">
        <button 
          className={`universe-tab-btn ${activeTab === 'scenario' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenario')}
        >
          <FaBookOpen /> Scenario & Lore
        </button>
        <button 
          className={`universe-tab-btn ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          <FaUsers /> Characters ({charactersData.length})
        </button>
        <button 
          className={`universe-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          <FaIdCard /> Collectible Cards ({cardsData.length})
        </button>
        <Link to="/game" className="universe-tab-btn play-game-highlight">
          <FaGamepad /> Play Card Game ⚔️
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SCENARIO & LORE                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'scenario' && (
        <div className="tab-content scenario-tab-content">
          {/* Synopsis Hero Section */}
          <div className="scenario-synopsis-card">
            <div className="synopsis-badge">
              <FaGlobe /> Universe Overview
            </div>
            <h2>{scenarioData.title}</h2>
            <p className="synopsis-text">{scenarioData.synopsis}</p>
          </div>

          {/* Factions Section */}
          <div className="universe-section">
            <h3 className="section-title">
              <FaShieldAlt /> Key Factions
            </h3>
            <div className="factions-grid">
              {scenarioData.factions.map(faction => (
                <div key={faction.id} className="faction-card" style={{ '--faction-color': faction.color }}>
                  <div className="faction-icon">{faction.icon}</div>
                  <div className="faction-header">
                    <h4>{faction.name}</h4>
                    <span className="faction-badge">{faction.badge}</span>
                  </div>
                  <p className="faction-desc">{faction.description}</p>
                  <div className="faction-details">
                    <div><strong>Leader:</strong> {faction.leader}</div>
                    <div><strong>Territory:</strong> {faction.territory}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Locations Section */}
          <div className="universe-section">
            <h3 className="section-title">
              <FaGlobe /> Realms & Locations
            </h3>
            <div className="locations-grid">
              {scenarioData.locations.map(loc => (
                <div key={loc.id} className="location-card">
                  <div className="location-img-wrapper">
                    <img src={loc.src} alt={loc.name} loading="lazy" />
                    <span className="location-type-tag">{loc.type}</span>
                  </div>
                  <div className="location-info">
                    <h4>{loc.name}</h4>
                    <p>{loc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lore Timeline Section */}
          <div className="universe-section">
            <h3 className="section-title">
              <FaBookOpen /> Story Timeline
            </h3>
            <div className="timeline-container">
              {scenarioData.timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">{item.era}</div>
                  <div className="timeline-content">
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHARACTERS                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'characters' && (
        <div className="tab-content characters-tab-content">
          {/* Controls Bar */}
          <div className="controls-bar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search characters by name, title, or role..." 
                value={charSearchQuery}
                onChange={(e) => setCharSearchQuery(e.target.value)}
              />
              {charSearchQuery && (
                <button className="clear-btn" onClick={() => setCharSearchQuery('')}>
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="filter-group">
              <span className="filter-title"><FaFilter /> Faction:</span>
              <div className="filter-pills">
                {factions.map(f => (
                  <button 
                    key={f}
                    className={`filter-pill ${charFactionFilter === f ? 'active' : ''}`}
                    onClick={() => setCharFactionFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Characters Grid */}
          <div className="characters-grid">
            {filteredCharacters.length > 0 ? (
              filteredCharacters.map(char => (
                <div key={char.id} className="character-card" onClick={() => setSelectedCharacter(char)}>
                  <div className="char-image-container">
                    <img src={char.src} alt={char.name} loading="lazy" />
                    <span className="char-faction-tag">{char.faction}</span>
                  </div>
                  <div className="char-body">
                    <h3 className="char-name">{char.name}</h3>
                    <div className="char-title">{char.title}</div>
                    <span className="char-role-badge">{char.role}</span>
                    
                    <p className="char-quote">"{char.quote}"</p>

                    {/* Stats preview */}
                    <div className="char-stats-preview">
                      <div className="stat-row">
                        <span>ATK</span>
                        <div className="stat-bar"><div className="stat-fill atk" style={{ width: `${char.stats.attack}%` }}></div></div>
                        <span className="stat-val">{char.stats.attack}</span>
                      </div>
                      <div className="stat-row">
                        <span>MAG</span>
                        <div className="stat-bar"><div className="stat-fill mag" style={{ width: `${char.stats.magic}%` }}></div></div>
                        <span className="stat-val">{char.stats.magic}</span>
                      </div>
                      <div className="stat-row">
                        <span>SPD</span>
                        <div className="stat-bar"><div className="stat-fill spd" style={{ width: `${char.stats.speed}%` }}></div></div>
                        <span className="stat-val">{char.stats.speed}</span>
                      </div>
                    </div>

                    <div className="char-abilities-tags">
                      {char.abilities.slice(0, 3).map((ab, idx) => (
                        <span key={idx} className="ability-tag">{ab}</span>
                      ))}
                      {char.abilities.length > 3 && <span className="ability-tag extra">+{char.abilities.length - 3}</span>}
                    </div>

                    <button className="char-inspect-btn">
                      View Profile & Stats
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <FaExclamationCircle /> No characters matched your search filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COLLECTIBLE CARDS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'cards' && (
        <div className="tab-content cards-tab-content">
          {/* Controls Bar */}
          <div className="controls-bar cards-controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search cards by name, ability, or lore..." 
                value={cardSearchQuery}
                onChange={(e) => setCardSearchQuery(e.target.value)}
              />
              {cardSearchQuery && (
                <button className="clear-btn" onClick={() => setCardSearchQuery('')}>
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <span className="filter-title"><FaTrophy /> Rarity:</span>
                <div className="filter-pills">
                  {rarities.map(r => (
                    <button 
                      key={r}
                      className={`filter-pill rarity-${r.toLowerCase()} ${cardRarityFilter === r ? 'active' : ''}`}
                      onClick={() => setCardRarityFilter(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-title"><FaFilter /> Type:</span>
                <div className="filter-pills">
                  {cardTypes.map(t => (
                    <button 
                      key={t}
                      className={`filter-pill ${cardTypeFilter === t ? 'active' : ''}`}
                      onClick={() => setCardTypeFilter(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card-hint">
            💡 Click on any card to Flip it and reveal lore details!
          </div>

          {/* Cards Showcase Grid */}
          <div className="cards-grid">
            {filteredCards.length > 0 ? (
              filteredCards.map(card => {
                const isFlipped = flippedCards[card.id]
                const rarityClass = `rarity-${card.rarity.toLowerCase()}`

                return (
                  <div 
                    key={card.id} 
                    className={`trading-card-wrapper ${rarityClass}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className={`trading-card ${isFlipped ? 'flipped' : ''}`}>
                      {/* FRONT FACE */}
                      <div className="card-face card-front">
                        <div className="card-top-bar">
                          <span className="card-cost" title="Mana Cost">{card.cost}</span>
                          <span className="card-name-title">{card.name}</span>
                          <span className={`card-rarity-badge ${rarityClass}`}>{card.rarity}</span>
                        </div>

                        <div className="card-art-frame">
                          <img src={card.src} alt={card.name} loading="lazy" />
                          <span className="card-type-tag">{card.type} • {card.faction}</span>
                        </div>

                        <div className="card-ability-box">
                          <p>{card.ability}</p>
                        </div>

                        <div className="card-bottom-bar">
                          {card.attack > 0 ? (
                            <span className="card-stat card-attack" title="Attack Power">
                              <FaBolt /> {card.attack}
                            </span>
                          ) : <span className="card-stat-empty"></span>}

                          <button 
                            className="card-flip-btn"
                            onClick={(e) => toggleCardFlip(card.id, e)}
                            title="Flip Card for Lore"
                          >
                            <FaRedo /> Lore
                          </button>

                          {card.health > 0 ? (
                            <span className="card-stat card-health" title="Health/Durability">
                              <FaShieldAlt /> {card.health}
                            </span>
                          ) : <span className="card-stat-empty"></span>}
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div className="card-face card-back">
                        <div className="card-back-pattern">
                          <div className="card-back-logo">CR</div>
                          <h3>{card.name}</h3>
                          <div className="card-back-id">{card.id}</div>
                          
                          <div className="card-lore-content">
                            <h4>Lore & Backstory</h4>
                            <p className="lore-text">{card.lore}</p>
                            
                            {card.flavor && (
                              <p className="flavor-quote">"{card.flavor}"</p>
                            )}
                          </div>

                          <button 
                            className="card-flip-btn back-btn"
                            onClick={(e) => toggleCardFlip(card.id, e)}
                          >
                            <FaRedo /> Front View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="no-results">
                <FaExclamationCircle /> No trading cards matched your selected criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHARACTER MODAL VIEW                                                      */}
      {/* ========================================================================= */}
      {selectedCharacter && (
        <div className="lightbox-modal" onClick={() => setSelectedCharacter(null)}>
          <div className="modal-content char-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedCharacter(null)}>
              <FaTimes />
            </button>
            <div className="char-modal-grid">
              <div className="char-modal-img">
                <img src={selectedCharacter.src} alt={selectedCharacter.name} />
                <div className="char-modal-faction">{selectedCharacter.faction}</div>
              </div>
              <div className="char-modal-info">
                <h2>{selectedCharacter.name}</h2>
                <div className="modal-subtitle">{selectedCharacter.title} • {selectedCharacter.role}</div>
                <p className="modal-quote">"{selectedCharacter.quote}"</p>

                <h4>Biography</h4>
                <p className="modal-bio">{selectedCharacter.bio}</p>

                <h4>Gear & Relic</h4>
                <p className="modal-gear">🛡️ {selectedCharacter.gear}</p>

                <h4>Combat Attributes</h4>
                <div className="modal-stats-list">
                  <div className="modal-stat-item">
                    <span className="stat-label"><FaBolt /> Attack</span>
                    <div className="stat-bar"><div className="stat-fill atk" style={{ width: `${selectedCharacter.stats.attack}%` }}></div></div>
                    <span>{selectedCharacter.stats.attack}</span>
                  </div>
                  <div className="modal-stat-item">
                    <span className="stat-label"><FaShieldAlt /> Defense</span>
                    <div className="stat-bar"><div className="stat-fill def" style={{ width: `${selectedCharacter.stats.defense}%` }}></div></div>
                    <span>{selectedCharacter.stats.defense}</span>
                  </div>
                  <div className="modal-stat-item">
                    <span className="stat-label"><FaMagic /> Magic</span>
                    <div className="stat-bar"><div className="stat-fill mag" style={{ width: `${selectedCharacter.stats.magic}%` }}></div></div>
                    <span>{selectedCharacter.stats.magic}</span>
                  </div>
                  <div className="modal-stat-item">
                    <span className="stat-label"><FaCog /> Tech</span>
                    <div className="stat-bar"><div className="stat-fill tech" style={{ width: `${selectedCharacter.stats.tech}%` }}></div></div>
                    <span>{selectedCharacter.stats.tech}</span>
                  </div>
                </div>

                <h4>Abilities</h4>
                <div className="char-abilities-tags">
                  {selectedCharacter.abilities.map((ab, idx) => (
                    <span key={idx} className="ability-tag large">{ab}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CARD MODAL INSPECTION                                                     */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="lightbox-modal" onClick={() => setSelectedCard(null)}>
          <div className="modal-content card-inspect-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedCard(null)}>
              <FaTimes />
            </button>
            <div className="card-modal-flex">
              <div className={`inspect-card-display rarity-${selectedCard.rarity.toLowerCase()}`}>
                <img src={selectedCard.src} alt={selectedCard.name} />
              </div>
              <div className="card-modal-details">
                <div className="card-modal-header">
                  <h2>{selectedCard.name}</h2>
                  <span className={`card-rarity-badge rarity-${selectedCard.rarity.toLowerCase()}`}>
                    {selectedCard.rarity}
                  </span>
                </div>
                <div className="card-meta-line">
                  <span>Type: <strong>{selectedCard.type}</strong></span> • 
                  <span> Faction: <strong>{selectedCard.faction}</strong></span> • 
                  <span> Cost: <strong>{selectedCard.cost} Mana</strong></span>
                </div>

                <div className="inspect-section">
                  <h4>Effect / Ability</h4>
                  <p className="card-ability-text">{selectedCard.ability}</p>
                </div>

                <div className="inspect-section">
                  <h4>Lore & Story</h4>
                  <p className="card-lore-text">{selectedCard.lore}</p>
                </div>

                {selectedCard.flavor && (
                  <div className="inspect-section">
                    <p className="flavor-quote">"{selectedCard.flavor}"</p>
                  </div>
                )}

                <div className="inspect-stats-footer">
                  {selectedCard.attack > 0 && (
                    <div className="card-stat-pill atk">
                      <FaBolt /> Attack: {selectedCard.attack}
                    </div>
                  )}
                  {selectedCard.health > 0 && (
                    <div className="card-stat-pill hp">
                      <FaShieldAlt /> Health: {selectedCard.health}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Universe
