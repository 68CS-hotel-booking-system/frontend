import { AppstoreOutlined, CarOutlined, DesktopOutlined, HomeOutlined } from '@ant-design/icons'
import { HotelDetailIcon, type HotelDetailIconName } from './HotelDetailIcon'

const icons: Record<string, HotelDetailIconName> = {
  FREE_PARKING: 'parking', PARKING: 'parking', SWIMMING_POOL: 'pool', POOL: 'pool', RECEPTION_24H: 'reception', FRONT_DESK_24H: 'reception', RESTAURANT: 'restaurant', FITNESS_CENTER: 'gym', GYM: 'gym', FREE_WIFI: 'wifi', WIFI: 'wifi', AIR_CONDITIONING: 'conditioning', ELEVATOR: 'elevator', BAR: 'bar', MINIBAR: 'bar', LUGGAGE_STORAGE: 'luggage',
}
export function HotelAmenityIcon({ code }: { code?: string }) {
  const name = code && icons[code.toUpperCase()]
  if (name) return <HotelDetailIcon name={name} />
  const Icon = code === 'AIRPORT_SHUTTLE' ? CarOutlined : code === 'TELEVISION' ? DesktopOutlined : code === 'BALCONY' ? HomeOutlined : AppstoreOutlined
  return <Icon className="hotel-amenity-fallback-icon" aria-hidden="true" />
}
