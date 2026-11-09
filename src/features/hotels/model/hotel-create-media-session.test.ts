import { describe, expect, it, vi } from 'vitest'
import type { ManagementHotelDetail } from './hotel'
import { completeHotelCreation, type HotelCreationSession } from './hotel-create-media-session'

const hotel = { id: 'hotel-1', name: 'Existing hotel' } as ManagementHotelDetail
const photos = [{ id: 'a', file: new File(['a'], 'a.jpg'), isCover: true }, { id: 'b', file: new File(['b'], 'b.jpg'), isCover: false }]

describe('hotel creation with separate photo persistence', () => {
  it('retains the created hotel and uploaded image on failure, then retries without a duplicate hotel or upload', async () => {
    const session: HotelCreationSession = { mediaIds: {} }
    const create = vi.fn().mockResolvedValue(hotel)
    const upload = vi.fn().mockResolvedValueOnce({ id: 'media-a' }).mockRejectedValueOnce(new Error('upload failed')).mockResolvedValueOnce({ id: 'media-b' })
    const save = vi.fn().mockResolvedValue([])
    const deps = { create, upload, save }
    await expect(completeHotelCreation(session, photos, 'api', deps)).rejects.toThrow('upload failed')
    expect(session.created?.id).toBe('hotel-1')
    expect(session.mediaIds).toEqual({ a: 'media-a' })
    expect(save).not.toHaveBeenCalled()
    await expect(completeHotelCreation(session, photos, 'api', deps)).resolves.toBe(hotel)
    expect(create).toHaveBeenCalledTimes(1)
    expect(upload).toHaveBeenCalledTimes(3)
    const transform = save.mock.calls[0][1]
    expect(transform([{ mediaId: 'existing', sortOrder: 0, cover: true }])).toEqual([
      { mediaId: 'existing', sortOrder: 0, cover: true },
      { mediaId: 'media-a', sortOrder: 1, cover: false },
      { mediaId: 'media-b', sortOrder: 2, cover: false },
    ])
  })

  it('keeps all uploaded ids after link failure and never calls live media in mock mode', async () => {
    const session: HotelCreationSession = { mediaIds: {} }
    const deps = { create: vi.fn().mockResolvedValue(hotel), upload: vi.fn().mockResolvedValue({ id: 'media-a' }), save: vi.fn().mockRejectedValue(new Error('409')) }
    await expect(completeHotelCreation(session, photos.slice(0, 1), 'api', deps)).rejects.toThrow('409')
    expect(session.mediaIds).toEqual({ a: 'media-a' })
    deps.save.mockResolvedValueOnce([])
    await completeHotelCreation(session, photos.slice(0, 1), 'api', deps)
    expect(deps.create).toHaveBeenCalledTimes(1)
    await completeHotelCreation({ mediaIds: {} }, photos, 'mock', deps)
    expect(deps.upload).toHaveBeenCalledTimes(1)
    expect(deps.save).toHaveBeenCalledTimes(2)
  })

  it('keeps API recovery pending when the data source changes to mock', async () => {
    const session: HotelCreationSession = { created: hotel, mode: 'api', mediaIds: { a: 'media-a' } }
    const deps = { create: vi.fn(), upload: vi.fn(), save: vi.fn() }
    await expect(completeHotelCreation(session, photos, 'mock', deps)).rejects.toThrow('API')
    expect(deps.create).not.toHaveBeenCalled()
    expect(deps.upload).not.toHaveBeenCalled()
  })
})
