import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { HotelStaffPage } from './HotelStaffPage'

it('shows the shared management placeholder instead of the customer account screen', () => {
  const markup = renderToStaticMarkup(<MemoryRouter><HotelStaffPage /></MemoryRouter>)
  expect(markup).toContain('Phân hệ Nhân sự khách sạn đang được hoàn thiện')
  expect(markup).toContain('Về trang Tổng quan')
  expect(markup).not.toContain('Về thông tin cá nhân')
  expect(markup).not.toContain('href="/account"')
})
