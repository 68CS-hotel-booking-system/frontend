import { describe, expect, it } from 'vitest'
import {
  BENTO_DESTINATIONS,
  STAYVIBE_FEATURED_HOTELS,
  VIBE_CATEGORIES,
} from '@/features/discovery/data/stayvibe-mock-data'

describe('stayvibe-mock-data (UI Skeleton Dataset)', () => {
  it('provides 8 style vibe categories matching design.md', () => {
    expect(VIBE_CATEGORIES).toHaveLength(8)
    const ids = VIBE_CATEGORIES.map((c) => c.icon)
    expect(ids).toContain('glamping')
    expect(ids).toContain('boutique')
    expect(ids).toContain('pool-party')
    expect(ids).toContain('pet-friendly')
  })

  it('configures 4 Bento Grid items (1 featured 2x2, 1 wide 2x1, 2 square 1x1)', () => {
    expect(BENTO_DESTINATIONS).toHaveLength(4)
    expect(
      BENTO_DESTINATIONS.filter((d) => d.spanClass === 'featured'),
    ).toHaveLength(1)
    expect(
      BENTO_DESTINATIONS.filter((d) => d.spanClass === 'wide'),
    ).toHaveLength(1)
    expect(
      BENTO_DESTINATIONS.filter((d) => d.spanClass === 'square'),
    ).toHaveLength(2)
  })

  it('ensures every featured hotel has valid pricing, 3 amenities, and carousel images', () => {
    expect(STAYVIBE_FEATURED_HOTELS.length).toBeGreaterThanOrEqual(4)
    for (const hotel of STAYVIBE_FEATURED_HOTELS) {
      expect(hotel.pricePerNight).toBeGreaterThan(0)
      expect(hotel.amenities).toHaveLength(3)
      expect(hotel.images.length).toBeGreaterThan(0)
    }
  })
})

