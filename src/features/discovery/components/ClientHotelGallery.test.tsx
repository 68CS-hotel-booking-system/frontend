import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GalleryView } from './ClientHotelGallery'

it.each([0, 1, 4, 7])('renders %i photos without duplicating images to fill the grid', count => {
  const images = Array.from({ length: count }, (_, n) => ({ mediaId: String(n), albumId: null, sortOrder: n, cover: n === 0 }))
  const client = new QueryClient()
  images.forEach(i => client.setQueryData(['discovery', 'media', i.mediaId], { url: `https://example.test/${i.mediaId}.jpg` }))
  const markup = renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter><GalleryView hotelName="Khách sạn" data={{ hotelId: 'hotel', images, albums: [] }} /></MemoryRouter></QueryClientProvider>)
  expect((markup.match(/alt="Khách sạn"/g) ?? []).length).toBe(Math.min(count, 5))
  if (count === 0) expect(markup).toContain('Chưa có ảnh')
  else expect(markup).toContain(`Xem tất cả ${count} ảnh`)
})
