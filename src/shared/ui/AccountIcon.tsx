export type AccountIconName = 'back' | 'user' | 'lock' | 'lock-small' | 'bed' | 'heart' | 'chat' | 'staff' | 'logout' | 'calendar' | 'down' | 'eye' | 'upload' | 'badge-check' | 'shield'
  | 'eye-off' | 'check' | 'device' | 'key' | 'alert-triangle'

/** Original Figma vector exports; keep the SVGs at their intrinsic dimensions. */
export function AccountIcon({ name }: { name: AccountIconName }) {
  return <span className={`account-icon account-icon--${name}`} aria-hidden="true">
    <img src={`/assets/account-figma/${name}.svg`} alt="" />
  </span>
}
