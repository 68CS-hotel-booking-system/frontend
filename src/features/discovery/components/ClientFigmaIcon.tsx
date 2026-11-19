import { PictureOutlined } from '@ant-design/icons'
import { ClientReferenceIcon } from './ClientReferenceIcon'

type IconName = 'search' | 'star' | 'heart' | 'image-error' | 'globe' | 'filters' | 'brand-pin' | 'menu' | 'user'

export function ClientFigmaIcon({ name }: { name: IconName }) {
  return <span className="cf-icon" aria-hidden="true">
    {name === 'image-error' ? <PictureOutlined /> : <ClientReferenceIcon name={name === 'brand-pin' ? 'pin' : name} />}
  </span>
}

export function ClientFigmaBrand() {
  return <span className="cf-brand-art"><span className="cf-brand-pin"><ClientFigmaIcon name="brand-pin" /></span><strong>StayHub</strong><small>BỘ SƯU TẬP LƯU TRÚ</small></span>
}
