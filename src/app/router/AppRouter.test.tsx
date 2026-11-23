import { isValidElement, type ReactElement } from 'react'
import { matchRoutes, type RouteObject } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AccountRouteGuard, AdminRouteGuard } from '@/features/auth'

const captured = vi.hoisted(() => ({ routes: [] as RouteObject[] }))
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    createBrowserRouter: (routes: RouteObject[]) => {
      captured.routes = routes
      return {}
    },
  }
})

await import('./AppRouter')

describe('staff navigation', () => {
  it('keeps the real revenue page inside the protected management layout', () => {
    const matches = matchRoutes(captured.routes, '/finance')!
    expect(matches.at(-1)?.route.path).toBe('finance')
    expect(matches.some(({ route }) => isValidElement(route.element)
      && (route.element as ReactElement).type === AdminRouteGuard)).toBe(true)
  })
  it('keeps /staff inside the protected management layout', () => {
    const matches = matchRoutes(captured.routes, '/staff')!
    expect(matches.at(-1)?.route.path).toBe('staff')
    expect(matches.some(({ route }) =>
      isValidElement(route.element) && (route.element as ReactElement).type === AdminRouteGuard,
    )).toBe(true)
  })

  it('keeps /system-status inside the protected management layout', () => {
    const matches = matchRoutes(captured.routes, '/system-status')!
    expect(matches.at(-1)?.route.path).toBe('system-status')
    expect(matches.some(({ route }) =>
      isValidElement(route.element) && (route.element as ReactElement).type === AdminRouteGuard,
    )).toBe(true)
  })
})

it('opens saved stays from the account area while keeping the public entry available', () => {
  const isAccountRoute = (path: string) => matchRoutes(captured.routes, path)?.some(({ route }) =>
    isValidElement(route.element) && route.element.type === AccountRouteGuard,
  )
  expect(isAccountRoute('/account/saved-stays')).toBe(true)
  expect(isAccountRoute('/saved-stays')).toBe(false)
})
