import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Select } from 'antd'
import { HotelPhotosPage } from './HotelPhotosPage'

const state = vi.hoisted(() => ({
  selects: [] as ComponentProps<typeof Select>[],
  images: [
    { mediaId: 'photo-1', albumId: null as string | null, sortOrder: 0, cover: true },
    { mediaId: 'photo-2', albumId: 'kitchen' as string | null, sortOrder: 1, cover: false },
  ],
  saved: [] as unknown[],
  upload: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>()
  return {
    ...actual,
    Select: (props: ComponentProps<typeof Select>) => {
      state.selects.push(props)
      return <span>{props['aria-label']}</span>
    },
    message: { success: state.success, error: state.error },
  }
})

vi.mock('@/features/hotels', () => ({
  useHotelWorkspace: () => ({ hotelId: 'hotel', hotel: { name: 'Biển Xanh' } }),
  useHotelAlbums: () => ({
    query: { isSuccess: true, data: [{ id: 'kitchen', name: 'Nhà bếp' }] },
    mutation: { isPending: false },
  }),
  useHotelImagesQuery: () => ({
    data: state.images,
    canWrite: true,
    saveGallery: async (transform: (images: typeof state.images) => unknown[]) => {
      state.saved = transform(state.images)
    },
  }),
  uploadHotelMedia: state.upload,
}))

describe('moving existing hotel photos between albums', () => {
  beforeEach(() => {
    state.selects = []
    state.saved = []
    state.images[0].albumId = null
    vi.clearAllMocks()
  })

  it.each([
    [null, 'kitchen', 'kitchen', 'Nhà bếp'],
    ['kitchen', 'ungrouped', null, 'Chưa phân loại'],
  ])('moves a photo from %s to %s without uploading it again', async (from, target, expected, name) => {
    state.images[0].albumId = from
    renderToStaticMarkup(<MemoryRouter><HotelPhotosPage /></MemoryRouter>)
    const control = state.selects.find((props) => props['aria-label'] === 'Chuyển ảnh 1 đến album')!
    expect(control.disabled).toBe(false)
    await control.onChange!(target, { value: target })
    expect(state.saved).toEqual([
      { ...state.images[0], albumId: expected },
      state.images[1],
    ])
    expect(state.upload).not.toHaveBeenCalled()
    expect(state.success).toHaveBeenCalledWith(`Đã chuyển ảnh vào "${name}".`)
    expect(state.error).not.toHaveBeenCalled()
  })
})
