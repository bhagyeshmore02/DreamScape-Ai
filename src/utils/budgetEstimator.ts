import type { ProjectData } from '../pages/CreateProjectPage'

/*
 * Dynamically estimate a construction budget based on the entered form data.
 * Returns { low, mid, high } in USD and a per-sqft rate.
 */

interface Estimate {
  low: number
  mid: number
  high: number
  perSqft: number
  area: number       // in sqft (after unit conversion)
  confidence: 'low' | 'medium' | 'high'
}

const STYLE_MULTIPLIER: Record<string, number> = {
  Minimalist:   0.85,
  Traditional:  0.95,
  Scandinavian: 1.00,
  Modern:       1.10,
  Contemporary: 1.15,
  Industrial:   1.05,
  Luxury:       1.60,
  '':           1.00,
}

const PRIORITY_MULTIPLIER: Record<string, number> = {
  'Budget Friendly':  0.80,
  'Energy Efficient': 1.05,
  'Luxury':           1.45,
  '':                 1.00,
}

const ROOM_COSTS: Record<string, number> = {
  swimmingpool: 35_000,
  garage:        8_000,
  homeoffice:    5_000,
  balcony:       4_000,
  terrace:       6_000,
  garden:        3_000,
  prayerroom:    3_500,
  storeroom:     2_000,
  laundry:       2_500,
  diningroom:    4_000,
  livingroom:    6_000,
  kitchen:       8_000,
}

const FEATURE_COSTS: Record<string, number> = {
  'Smart Home Ready': 18_000,
  'Eco Friendly':      8_000,
  'Vastu Compliant':   2_000,
}

/* Base construction cost per sqft (USD) before multipliers */
const BASE_COST_PER_SQFT = 120

export function estimateBudget(data: ProjectData): Estimate {
  // ── Convert area to sqft ──
  let area = 0
  if (data.plotWidth && data.plotLength) {
    const w = parseFloat(data.plotWidth)
    const l = parseFloat(data.plotLength)
    if (!isNaN(w) && !isNaN(l)) {
      area = data.plotUnit === 'meters'
        ? w * l * 10.764   // m² → sqft
        : w * l
    }
  }

  // Use a fallback area based on bedrooms if no plot entered
  const effectiveArea = area > 0 ? area : (data.bedroomCount * 250 + 800)

  const styleMult = STYLE_MULTIPLIER[data.houseStyle] ?? 1.0
  const priorMult = PRIORITY_MULTIPLIER[data.constructionPriority] ?? 1.0

  // ── Base cost ──
  const baseCost = effectiveArea * BASE_COST_PER_SQFT * styleMult * priorMult

  // ── Room add-ons ──
  const roomCost = data.rooms.reduce((sum, r) => sum + (ROOM_COSTS[r] ?? 0), 0)

  // ── Feature add-ons ──
  const featureCost = data.features.reduce((sum, f) => sum + (FEATURE_COSTS[f] ?? 0), 0)

  // ── Bedroom & bathroom scaling ──
  const bedBathExtra = (data.bedroomCount - 3) * 12_000 + (data.bathroomCount - 2) * 8_000

  const mid  = Math.round((baseCost + roomCost + featureCost + bedBathExtra) / 1000) * 1000
  const low  = Math.round(mid * 0.88)
  const high = Math.round(mid * 1.18)

  const fieldsEntered = [
    data.projectName, data.houseStyle, data.plotWidth, data.plotLength,
    data.plotShape, data.constructionPriority,
  ].filter(Boolean).length

  const confidence: Estimate['confidence'] =
    fieldsEntered >= 5 ? 'high' : fieldsEntered >= 3 ? 'medium' : 'low'

  return {
    low, mid, high,
    perSqft: Math.round(BASE_COST_PER_SQFT * styleMult * priorMult),
    area: Math.round(effectiveArea),
    confidence,
  }
}

/* AI-driven recommendations keyed on form state */
export interface Recommendation {
  icon: string
  text: string
}

export function getRecommendations(data: ProjectData): Recommendation[] {
  const tips: Recommendation[] = []

  if (data.houseStyle === 'Modern' || data.houseStyle === 'Contemporary') {
    tips.push({ icon: '🪟', text: 'Large floor-to-ceiling windows maximise natural light in modern homes.' })
  }
  if (data.houseStyle === 'Scandinavian') {
    tips.push({ icon: '🌿', text: 'Warm wood tones and light neutrals define the Scandinavian palette.' })
  }
  if (data.houseStyle === 'Luxury') {
    tips.push({ icon: '✨', text: 'Double-height ceilings and statement staircases elevate luxury spaces.' })
  }
  if (data.plotShape === 'Rectangle') {
    tips.push({ icon: '📐', text: 'Modern homes perform best on rectangular plots — ideal for your layout.' })
  }
  if (data.plotShape === 'Corner Plot') {
    tips.push({ icon: '🏙', text: 'Corner plots allow a second entrance and wider landscaping opportunities.' })
  }
  if (data.rooms.includes('swimmingpool')) {
    tips.push({ icon: '💧', text: 'Infinity-edge pools add 12–18% to property resale value.' })
  }
  if (data.rooms.includes('garden')) {
    tips.push({ icon: '🌳', text: 'Eco-friendly rooftop gardens reduce heat island effect by up to 20°F.' })
  }
  if (data.features.includes('Smart Home Ready')) {
    tips.push({ icon: '🤖', text: 'Pre-wiring for smart home during construction saves 40% vs retrofitting.' })
  }
  if (data.features.includes('Eco Friendly')) {
    tips.push({ icon: '☀️', text: 'South-facing orientation maximises solar panel efficiency year-round.' })
  }
  if (data.features.includes('Vastu Compliant')) {
    tips.push({ icon: '🧭', text: 'North-east entry and south-west master bedroom satisfy Vastu principles.' })
  }
  if (data.bedroomCount >= 4) {
    tips.push({ icon: '🛏', text: 'Consider en-suite bathrooms for all bedrooms above the ground floor.' })
  }
  if (data.budget > 1_500_000) {
    tips.push({ icon: '💎', text: 'At this budget tier, Italian marble and bespoke joinery are achievable.' })
  }
  if (data.constructionPriority === 'Energy Efficient') {
    tips.push({ icon: '⚡', text: 'Insulated concrete forms (ICF) walls cut energy bills by up to 50%.' })
  }

  // Default tips if nothing specific matched
  if (tips.length === 0) {
    tips.push({ icon: '🏠', text: 'Fill in more details to unlock personalised AI design recommendations.' })
  }

  return tips.slice(0, 3)
}
