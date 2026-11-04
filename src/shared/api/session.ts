// Tokens only live in memory; reload requires login until BE supports HttpOnly cookies.
export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: string
}
let session: Session | null = null
const listeners = new Set<() => void>()
export const getSession = () => session
export function setSession(value: Session | null) {
  session = value
  listeners.forEach((listener) => listener())
}
export function subscribeSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
