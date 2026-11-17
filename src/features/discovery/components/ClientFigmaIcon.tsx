type IconName = 'search' | 'star' | 'heart' | 'image-error' | 'globe' | 'filters' | 'brand-pin' | 'menu' | 'user'

/** Original Figma exports; intrinsic SVG dimensions are preserved. */
export function ClientFigmaIcon({ name }: { name: IconName }) {
  return <img className="cf-icon" src={`/assets/client-figma/${name}.svg`} alt="" aria-hidden="true" />
}

export function ClientFigmaBrand() {
  return <span className="cf-brand-art"><span className="cf-brand-pin"><ClientFigmaIcon name="brand-pin" /></span><strong>StayHub</strong><small>BỘ SƯU TẬP LƯU TRÚ</small></span>
}
