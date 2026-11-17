const assets = {
  back: 'imgSvg', star: 'imgSvg1', share: 'imgSvg2', heart: 'imgSvg3', photos: 'imgSvg4', calendar: 'imgSvg5', chevron: 'imgSvg6', info: 'imgSvg7', bed: 'imgSvg8', area: 'imgSvg9', guests: 'imgSvg10', check: 'imgSvg11', selected: 'imgSvg12', parking: 'imgSvg13', pool: 'imgSvg14', reception: 'imgSvg15', restaurant: 'imgSvg16', gym: 'imgSvg17', wifi: 'imgSvg18', conditioning: 'imgSvg19', elevator: 'imgSvg20', bar: 'imgSvg21', luggage: 'imgSvg22', next: 'imgSvg23', checkIn: 'imgSvg24', checkOut: 'imgSvg25', policy: 'imgSvg26', pin: 'imgSvg27', book: 'imgSvg29', compass: 'imgSvgCompassIcon', globe: 'imgSvg32', wishlist: 'imgButtonSvg',
} as const
export type HotelDetailIconName = keyof typeof assets

export function HotelDetailIcon({ name }: { name: HotelDetailIconName }) {
  return <img className="hotel-detail-icon" src={`/assets/detail-figma/${assets[name]}.svg`} alt="" aria-hidden="true" />
}
