import {
  AppstoreOutlined, ArrowLeftOutlined, CalendarOutlined, CarOutlined, CarryOutOutlined,
  CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, CompassOutlined, CoffeeOutlined,
  DownOutlined, EnvironmentOutlined, GlobalOutlined, HeartOutlined, HomeOutlined, InfoCircleOutlined,
  LoginOutlined, LogoutOutlined, PictureOutlined, RightOutlined, ShareAltOutlined, ShopOutlined,
  StarFilled, ThunderboltOutlined, TeamOutlined, WifiOutlined,
} from '@ant-design/icons'

const icons = {
  back: ArrowLeftOutlined, star: StarFilled, share: ShareAltOutlined, heart: HeartOutlined,
  photos: PictureOutlined, calendar: CalendarOutlined, chevron: DownOutlined, info: InfoCircleOutlined,
  bed: HomeOutlined, area: AppstoreOutlined, guests: TeamOutlined, check: CheckOutlined,
  selected: CheckCircleOutlined, parking: CarOutlined, pool: EnvironmentOutlined, reception: ClockCircleOutlined,
  restaurant: ShopOutlined, gym: ThunderboltOutlined, wifi: WifiOutlined, conditioning: ThunderboltOutlined,
  elevator: AppstoreOutlined, bar: CoffeeOutlined, luggage: CarryOutOutlined, next: RightOutlined,
  checkIn: LoginOutlined, checkOut: LogoutOutlined, policy: InfoCircleOutlined, pin: EnvironmentOutlined,
  book: CalendarOutlined, compass: CompassOutlined, globe: GlobalOutlined, wishlist: HeartOutlined,
} as const
export type HotelDetailIconName = keyof typeof icons

export function HotelDetailIcon({ name }: { name: HotelDetailIconName }) {
  const Icon = icons[name]
  return <Icon className="hotel-detail-icon" aria-hidden="true" />
}
