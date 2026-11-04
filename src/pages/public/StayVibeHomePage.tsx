import { useState } from 'react'
import { App as AntApp, Dropdown, Modal } from 'antd'
import { useNavigate } from 'react-router'

type SuiteCategory = 'all' | 'heritage' | 'villa' | 'penthouse'

interface SuiteCollectionItem {
  id: string
  category: Exclude<SuiteCategory, 'all'>
  badge: string
  eurRate: string
  vndRate: string
  eurRateNumber: number
  vndRateNumber: number
  subtitleLeft: string
  subtitleRight: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  specs: Array<{ icon: string; label: string }>
  amenities: string[]
  floorplanDesc: string
  ctaLabel: string
  hotelId: string
}

const SUITE_COLLECTION: SuiteCollectionItem[] = [
  {
    id: 'medici-penthouse',
    category: 'penthouse',
    badge: 'Hạng Phòng Độc Bản',
    eurRate: '€2.450 / đêm',
    vndRate: '66.500.000 ₫ / đêm',
    eurRateNumber: 2450,
    vndRateNumber: 66500000,
    subtitleLeft: 'Penthouse Hoàng Gia',
    subtitleRight: 'Tầng Thượng Cánh Đông',
    title: 'The Medici Grand Penthouse',
    description:
      'Không gian nghỉ dưỡng hoàng gia lộng lẫy với tranh bích họa thời Phục Hưng, lò sưởi đá nguyên khối, sân hiên tắm nắng ngắm đồi bách diệp và bồn tắm cẩm thạch tráng lệ.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRd_fZ_2D1QB9-cM31Jt2BxyCUoXRTDQ9uavdSdHXj_OVn0Y6yA6N30pesgQKR9qAw_iRpa3GXKRf5ZI9i3FeIlVLCduudl6Iz_ZFgrP4D3tk39BGd-pnllMea82gKGYxCnC5176RTjHXI4k26MgGfvfUBtZKe5V52kR806JG9FwaEsJzYOGd0KVwC-h52gzhb_VRRiR6R1b-2-gv2Nri-H4mgiSaUWr_p6dgE6r0',
    imageAlt:
      'Phòng ngủ chính Penthouse sang trọng với trần gỗ cổ và sân hiên toàn cảnh',
    specs: [
      { icon: 'aspect_ratio', label: '185 m² / 1.990 ft²' },
      { icon: 'pool', label: 'Hồ bơi riêng thư giãn' },
      { icon: 'bed', label: 'Giường King Đế Vương' },
      { icon: 'person', label: 'Tối đa 3 khách' },
    ],
    amenities: [
      'Hồ bơi nước ấm trên sân thượng riêng',
      'Phục vụ bữa sáng Champagne tại phòng',
      'Quản gia riêng phục vụ 24/7',
      'Đồ dùng phòng tắm cao cấp Valmont Thụy Sĩ',
      'Hầm rượu vang mini với tuyển chọn vang Chianti',
      'Dịch vụ xe riêng đưa đón sân bay 2 chiều',
    ],
    floorplanDesc:
      'Bao gồm 1 phòng ngủ Master King, phòng khách đại sảnh trần cao 4.2m với lò sưởi đá tự nhiên, phòng tắm cẩm thạch Calacatta, phòng thay đồ walk-in và sân hiên solarium 360 độ ngắm toàn cảnh thung lũng.',
    ctaLabel: 'Đặt Penthouse Ngay',
    hotelId: '11111111-1111-4111-8111-111111111101',
  },
  {
    id: 'olive-grove-villa',
    category: 'villa',
    badge: 'Biệt Thự Biệt Lập',
    eurRate: '€3.100 / đêm',
    vndRate: '84.200.000 ₫ / đêm',
    eurRateNumber: 3100,
    vndRateNumber: 84200000,
    subtitleLeft: 'Biệt Thự Hồ Bơi Riêng',
    subtitleRight: 'Vườn Ô-Liu Di Sản',
    title: 'The Olive Grove Private Villa',
    description:
      'Sự tĩnh lặng tuyệt đối giữa 5 mẫu vườn ô-liu cổ thụ. Sở hữu hồ bơi vô cực bằng đá travertine nước ấm, bếp riêng cho quản gia và vọng lâu ẩm thực lãng mạn ngoài trời.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9wfNCo0mukfRJr__PGPpjvJ3cgu23BJCGzHUBnqIWlNFRaMw5ViqJxieuRePIGV0w3wNtVhv-eJX3rP5ONkHhjPTcaS4FoL9ujotU1tIEYWY8DMLSsBlMWYkiDwwdZdevRwCBlx2rivFhWCHPX9BDAHyO-dMZyBEhNbJ_Amfd6M_C7_Fi2WS_IDg2xGHNMB15EbzceYisljRR73uMvr1W9YILPCjh1XUvrB_NoWg',
    imageAlt:
      'Biệt thự đá riêng biệt giữa vườn ô liu cổ với hồ bơi vô cực nước ấm',
    specs: [
      { icon: 'aspect_ratio', label: '240 m² / 2.580 ft²' },
      { icon: 'pool', label: 'Hồ bơi vô cực nước ấm' },
      { icon: 'room_service', label: 'Quản gia riêng 24/7' },
      { icon: 'person', label: 'Tối đa 5 khách' },
    ],
    amenities: [
      'Hồ bơi vô cực nước ấm bằng đá Travertine tự nhiên',
      'Khu vườn ô-liu riêng biệt rộng 5 mẫu Anh',
      'Đội ngũ quản gia & đầu bếp phục vụ riêng',
      'Vọng lâu ẩm thực ngoài trời có lò sưởi ấm cúng',
      'Bồn sục nước nóng Jacuzzi ngoài trời',
      'Xe điện buggy riêng phục vụ di chuyển trong khuôn viên',
    ],
    floorplanDesc:
      'Biệt thự độc lập 2 tầng gồm 2 phòng ngủ King, phòng khách phong cách Tuscany mở ra hiên vườn, nhà bếp phục vụ riêng biệt, 3 phòng tắm đá tự nhiên và hồ bơi vô cực hướng nhìn thung lũng.',
    ctaLabel: 'Đặt Biệt Thự Ngay',
    hotelId: '22222222-2222-4222-8222-222222222202',
  },
  {
    id: 'belvedere-terrace-suite',
    category: 'heritage',
    badge: 'Dinh Thự Cổ Điển',
    eurRate: '€1.680 / đêm',
    vndRate: '45.600.000 ₫ / đêm',
    eurRateNumber: 1680,
    vndRateNumber: 45600000,
    subtitleLeft: 'Suite Di Sản',
    subtitleRight: 'Sân Trong Phía Nam',
    title: 'Belvedere Terrace Suite',
    description:
      'Không gian thế kỷ 17 được phục dựng trang nhã với trần xà gỗ thông mộc, gạch men gốm thủ công vẽ tay và ban công râm mát phóng tầm mắt ra những đồi nho Chianti xanh ngát.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgfAtws7ISRcbz0l8-6wqTVJB0vV-3y6k2_wLj3UT_QQzeeg8RWqf3l2nvcvLioPyWEx1OoQBrLNLO8M99U6Yt26JFmVQn7JRs8hO2e-aL30Dv7ROtFluMlKYoUeQhV6LS9YezbrCEJtSaomUqgcpzpI3UB5xh3GabgEDEhgDP5CgLMayd_URfnZaX-R6DuMgdzFAWg73ILXWVaalmmK55c5gJbA0lrxw-3Db_ixk',
    imageAlt:
      'Phòng khách suite di sản sang trọng với ban công đá ngập tràn ánh nắng',
    specs: [
      { icon: 'aspect_ratio', label: '110 m² / 1.180 ft²' },
      { icon: 'deck', label: 'Hiên ngắm hoàng hôn' },
      { icon: 'bed', label: 'Giường King Sang Trọng' },
      { icon: 'person', label: 'Tối đa 2 khách' },
    ],
    amenities: [
      'Ban công hiên đá cổ nhìn ra thung lũng Chianti',
      'Nội thất phục dựng thủ công từ thế kỷ 17',
      'Máy pha cà phê espresso nghệ nhân Ý',
      'Phòng tắm lát gạch gốm thủ công men ngọc',
      'Dịch vụ chuẩn bị giường ngủ buổi tối thượng hạng',
    ],
    floorplanDesc:
      'Phòng khách hoàng gia nối liền phòng ngủ ấm cúng, vòm cửa mở rộng ra ban công loggia ngắm hoàng hôn vườn nho, bồn tắm ngâm sâu bằng đá tự nhiên.',
    ctaLabel: 'Đặt Suite Ngay',
    hotelId: '33333333-3333-4333-8333-333333333303',
  },
]

const ESTATE_PILLARS = [
  {
    id: 'gastronomy',
    badge: 'Ẩm Thực Đạt Sao Michelin',
    title: 'Nghệ Thuật Ẩm Thực & Hầm Rượu Vang Quý Tộc',
    description:
      'Bếp trưởng Aurelio sáng tạo nên những hành trình thưởng vị thăng hoa từ nông sản hữu cơ thu hoạch trong chính khu vườn di sản. Khám phá hầm rượu thế kỷ 14 lưu giữ hơn 3.000 chai vang hảo hạng.',
    meta: 'Nhà Hàng Ristorante Aurelio • Đặt Bàn Trước',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLhjrFmw7Ac_sUUmZAazZ2Nh4V0By-I042YW7uwfXMfM6E7kGX-KmfQC7qmC1om3OupyhzqC07c5lY5eeqN0ONFV_EQrapoIOtnS3niSy0JjpGhNcfKjDyJxENHVZmeXLtSJH_Q5DuJj3xBjrdgbvOm0uPkGFZNuZ-jVrJ3f2ziDaPhqWqPPqoPIpwdS_rkNJyAME4Tt6u6VkJAyRgsmQLksYipx4Dg-jSQxqnqXc',
    imageAlt:
      'Không gian ẩm thực sang trọng đạt sao Michelin trong hầm rượu vòm gạch cổ',
  },
  {
    id: 'thermal-spa',
    badge: 'Khu Suối Khoáng Nóng Thủy Liệu Pháp',
    title: 'Nhà Tắm Cổ La Mã & Liệu Trình Valmont Thụy Sĩ',
    description:
      'Được nuôi dưỡng bởi mạch nguồn suối khoáng nóng ngầm tự nhiên, các bể tắm vòm đá mang đến liệu pháp thủy lực, phòng xông hơi thảo mộc hoa oải hương và liệu trình tế bào đỉnh cao từ Valmont Thụy Sĩ.',
    meta: 'Hành Trình Suối Khoáng • Mở cửa 07:00 – 21:00',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClEABua19WLrQDNE3ni7hqokQpESmq3D4AkUMbA32gkF4UvIarJTZxh4jFYHxS7KG2SpYunmXUamzXuj8SQ5KboQ5R2sz-I9wUmDAjR4QnQbOuFuQPq2GnbXARtSitEfHoJrIxYoq_a6fpq51bvAiHvv0pxNSV-Zaq2es_hDYELE1WOxU198XsfoPYVKuUoh-lA7saH9kGbqShddLB4eFVrQ5rSEhp7spEtuOnebc',
    imageAlt:
      'Khu suối khoáng nóng kiểu La Mã thanh bình với hơi nước khoáng tự nhiên',
  },
  {
    id: 'private-expeditions',
    badge: 'Hành Trình Thám Hiểm Riêng',
    title: 'Du Thuyền Bờ Biển & Trải Nghiệm Độc Quyền',
    description:
      'Lên chiếc du thuyền gỗ kinh điển Riva Aquarama 1968 lướt sóng biển xanh, tham gia săn nấm cục truffle trắng cùng nghệ nhân trong rừng sồi nguyên sinh, hoặc ngắm toàn cảnh đồi nho bằng trực thăng riêng.',
    meta: 'Hành Trình Thiết Kế Riêng Bởi Quản Gia',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2jx2HwbDUv3NdA1HgOReNaxDvtIHA-wFEoJ6F2aGsTzXTU6NMMjVLfxGnXn9DAERC_gqahHzPx4p7axl-sWtBdz8qXSuGQq7gtjjXo8AL2qG3GO0vUbae0-sObH5W46x11YOPDIE9i8H3aPjzXUwTP9zYx6duqt9m06Mj4DEIp5b0ZbQ8tMsCYXjRiJc341W8XsBLCl7LQXR1BuYefkEM22CDDeNzqWZCBpPsJ-c',
    imageAlt:
      'Du thuyền gỗ Riva cổ điển lướt đi trên mặt nước biển Địa Trung Hải',
  },
] as const

const TESTIMONIALS = [
  {
    id: 'robb-report',
    initials: 'RR',
    source: 'Robb Report',
    subtitle: 'Tạp Chí Phong Cách Sống Thượng Lưu Toàn Cầu',
    quote:
      '“Grand Heritage đạt được điều mà hiếm khu nghỉ dưỡng nào làm được: sự trang nghiêm kiến trúc đích thực mà không hề cứng nhắc. Căn The Olive Grove Villa đã định nghĩa lại chuẩn mực xa xỉ của châu Âu.”',
  },
  {
    id: 'town-country',
    initials: 'TC',
    source: 'Town & Country',
    subtitle: 'Đánh Giá Nghỉ Dưỡng Thường Niên',
    quote:
      '“Thức dậy đón làn sương sớm tan dần trên đồi ô-liu từ ban công phòng Medici, thưởng thức bánh focaccia thảo mộc nóng hổi do quản gia riêng mang đến là một trải nghiệm tuyệt đối không thể nào quên.”',
  },
  {
    id: 'conde-nast',
    initials: 'CN',
    source: 'Condé Nast Traveler',
    subtitle: 'Bảng Vàng Danh Dự The Gold List 2025',
    quote:
      '“Chỉ riêng khu suối khoáng nóng La Mã cổ đã hoàn toàn xứng đáng cho chuyến đi. Kết hợp cùng tinh hoa ẩm thực của đầu bếp Aurelio, đây chắc chắn là thiên đường nghỉ dưỡng số một vùng Nam Âu.”',
  },
] as const

const SEASONAL_PACKAGES = [
  {
    id: 'couples-escape',
    tag: 'Kỳ Nghỉ Cặp Đôi',
    duration: '3 Đêm Lưu Trú',
    title: 'Nơi Trốn Lãng Mạn & Spa Trị Liệu Đôi',
    description:
      'Kỳ nghỉ ngọt ngào với champagne thượng hạng chào đón, liệu trình spa Valmont 90 phút dành riêng cho cặp đôi và bữa tối dưới ánh nến lãng mạn giữa vườn ô-liu.',
    perks: [
      'Bữa sáng Champagne phục vụ tại phòng hàng ngày',
      'Liệu trình Suối khoáng nóng đôi 90 phút Valmont',
      'Bữa tối 5 món lãng mạn dưới ánh nến ngắm vườn nho',
    ],
    eurPrice: '€4.200',
    vndPrice: '114.000.000 ₫',
  },
  {
    id: 'autumn-special',
    tag: 'Ưu Đãi Mùa Thu',
    duration: '4 Đêm Lưu Trú',
    title: 'Khám Phá Nấm Truffle Mùa Thu & Rượu Vang',
    description:
      'Tôn vinh mùa thu hoạch rực rỡ. Chuyến săn nấm truffle trắng quý hiếm trong rừng sồi và buổi thử nếm các dòng vang Super Tuscan danh giá cùng chuyên gia sommelier.',
    perks: [
      'Chuyến thám hiểm săn nấm truffle rừng riêng biệt',
      'Thực đơn thử vị Michelin kết hợp cùng các niên vụ vang quý',
      'Lớp học nếm vang chuyên sâu cùng chuyên gia Sommelier',
    ],
    eurPrice: '€5.600',
    vndPrice: '152.000.000 ₫',
  },
  {
    id: 'stay-savor',
    tag: 'Nghỉ Dưỡng Trọn Vẹn',
    duration: 'Ở 4 Trả 3',
    title: 'Kỳ Nghỉ Dài Ngày (Ở 4 Đêm Tính Tiền 3 Đêm)',
    description:
      'Kéo dài chuỗi ngày thư thái. Đặt 4 đêm tại Heritage Suite hoặc Biệt Thự để nhận đêm thứ tư hoàn toàn miễn phí cùng voucher 300 € sử dụng dịch vụ Spa.',
    perks: [
      'Miễn phí 100% đêm lưu trú thứ 4 liên tiếp',
      'Tặng 300 € (8.000.000 ₫) dịch vụ Suối khoáng nóng & Spa',
      'Đảm bảo trả phòng muộn đến 14:00 chiều',
    ],
    eurPrice: '€5.040',
    vndPrice: '136.800.000 ₫',
  },
] as const

const FAQ_ITEMS = [
  {
    id: 'faq-hours',
    question: 'Thời gian nhận phòng và trả phòng tiêu chuẩn là khi nào?',
    answer:
      'Thời gian nhận phòng bắt đầu từ 15:00. Thời gian trả phòng trước 12:00 trưa. Khách đặt phòng trực tiếp qua website chính thức sẽ được ưu tiên nhận phòng sớm và trả phòng muộn đến 14:00 (tùy thuộc vào tình trạng phòng).',
  },
  {
    id: 'faq-children',
    question: 'Khu nghỉ dưỡng có đón tiếp trẻ em và gia đình không?',
    answer:
      'Grand Heritage nồng nhiệt chào đón các gia đình tại các Biệt Thự Hồ Bơi Riêng và Family Suite. Trong khi Khu Suối Khoáng Nóng La Mã chỉ dành riêng cho khách từ 16 tuổi trở lên, chúng tôi có các lớp học khám phá thảo mộc tự nhiên và khung giờ bơi riêng dành cho các gia đình có trẻ nhỏ mỗi ngày.',
  },
  {
    id: 'faq-pets',
    question: 'Chính sách đón tiếp thú cưng như thế nào?',
    answer:
      'Chúng tôi chào đón các thú cưng được huấn luyện tốt (dưới 15kg) tại các phòng tầng trệt và biệt thự riêng. Giường nệm êm ái, thức ăn hữu cơ cho thú cưng và bản đồ dạo bộ trong khuôn viên sẽ được chuẩn bị sẵn sàng khi quý khách nhận phòng.',
  },
  {
    id: 'faq-cancellation',
    question: 'Chính sách hủy phòng và linh hoạt khi đặt trực tiếp ra sao?',
    answer:
      'Mọi đặt phòng trực tiếp qua website đều được hưởng chính sách hủy linh hoạt trước 48 giờ. Quý khách có thể hủy hoặc đổi ngày miễn phí nếu thông báo trước 48 giờ so với giờ nhận phòng của ngày đến.',
  },
] as const

const DATE_OPTIONS = [
  {
    key: 'd1',
    label: '24/10 – 28/10/2025 (4 đêm)',
    dateStr: '24/10 – 28/10/2025',
  },
  {
    key: 'd2',
    label: '31/10 – 02/11/2025 (Cuối tuần, 2 đêm)',
    dateStr: '31/10 – 02/11/2025',
  },
  {
    key: 'd3',
    label: '12/11 – 16/11/2025 (4 đêm)',
    dateStr: '12/11 – 16/11/2025',
  },
  {
    key: 'd4',
    label: '24/12 – 28/12/2025 (Giáng sinh, 4 đêm)',
    dateStr: '24/12 – 28/12/2025',
  },
  {
    key: 'd5',
    label: '05/01 – 12/01/2026 (7 đêm)',
    dateStr: '05/01 – 12/01/2026',
  },
]

const GUEST_OPTIONS = [
  { key: 'g1', label: '1 Người lớn' },
  { key: 'g2', label: '2 Người lớn' },
  { key: 'g3', label: '2 Người lớn, 1 Trẻ em' },
  { key: 'g4', label: '2 Người lớn, 2 Trẻ em' },
  { key: 'g5', label: '4 Người lớn' },
  { key: 'g6', label: 'Đoàn 5+ Khách' },
]

const SANCTUARY_OPTIONS = [
  { key: 'all', label: 'Tất cả hạng phòng', cat: 'all' as const },
  {
    key: 'villa',
    label: 'The Olive Grove Villa',
    cat: 'villa' as const,
  },
  {
    key: 'penthouse',
    label: 'Medici Penthouse',
    cat: 'penthouse' as const,
  },
  {
    key: 'heritage',
    label: 'Belvedere Suite',
    cat: 'heritage' as const,
  },
]

const PROMO_OPTIONS = [
  { key: 'p1', code: 'HERITAGE25', label: 'HERITAGE25 (Giảm 25%)' },
  { key: 'p2', code: 'AUTUMN2025', label: 'AUTUMN2025 (Tối Michelin)' },
  { key: 'p3', code: 'WELLNESS', label: 'WELLNESS (Spa Valmont)' },
  { key: 'p4', code: 'HONEYMOON', label: 'HONEYMOON (Trăng mật)' },
]

export function StayVibeHomePage() {
  const navigate = useNavigate()
  const { message } = AntApp.useApp()

  const [currency, setCurrency] = useState<'VND' | 'EUR'>('VND')
  const [stayDates, setStayDates] = useState('24/10 – 28/10/2025')
  const [guestsDisplay, setGuestsDisplay] = useState('2 Người lớn, 1 Trẻ em')
  const [sanctuaryType, setSanctuaryType] = useState('Tất cả hạng phòng')
  const [promoCode, setPromoCode] = useState('HERITAGE25')
  const [activeCategory, setActiveCategory] = useState<SuiteCategory>('all')
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-hours')
  const [journalEmail, setJournalEmail] = useState('')

  // Guest booking drawer state
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false)
  const [selectedBookingSuite, setSelectedBookingSuite] =
    useState<SuiteCollectionItem | null>(null)
  const [guestFullName, setGuestFullName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestSpecialRequest, setGuestSpecialRequest] = useState('')
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null)

  // Details & Floorplan modal state
  const [floorplanModalSuite, setFloorplanModalSuite] =
    useState<SuiteCollectionItem | null>(null)

  const visibleSuites = SUITE_COLLECTION.filter(
    (suite) => activeCategory === 'all' || suite.category === activeCategory,
  )

  function scrollToSection(sectionId: string) {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleOpenBooking(suite?: SuiteCollectionItem) {
    const target = suite ?? SUITE_COLLECTION[0]
    setSelectedBookingSuite(target)
    setBookingDrawerOpen(true)
  }

  function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault()
    const code = `GH-2025-${Math.floor(1000 + Math.random() * 9000)}`
    setBookingSuccessCode(code)
    void message.success(
      `Đặt phòng thành công cho ${guestFullName || 'quý khách'}! Mã đặt chỗ: ${code}`,
    )
  }

  return (
    <div className="atelier-dashboard-shell gh-landing-shell">
      {/* Fixed Editorial Header */}
      <header className="gh-header" role="banner">
        <div className="gh-header__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a
              href="#top"
              className="gh-brand-link"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <span className="gh-brand-link__title">Grand Heritage</span>
              <span className="gh-brand-link__subtitle">
                Hotel &amp; Residences
              </span>
            </a>
          </div>

          <nav className="gh-nav" aria-label="Điều Hướng Chính Grand Heritage">
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => scrollToSection('suites-and-villas')}
            >
              Biệt Thự &amp; Suite
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => scrollToSection('the-estate-pillars')}
            >
              Ẩm Thực
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => scrollToSection('the-estate-pillars')}
            >
              Spa &amp; Suối Khoáng
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => scrollToSection('guest-chronicle')}
            >
              Trải Nghiệm
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => scrollToSection('estate-arrival')}
            >
              Khu Nghỉ Dưỡng
            </button>
            <button
              type="button"
              className="gh-nav__link"
              onClick={() => scrollToSection('seasonal-offers')}
            >
              Ưu Đãi
            </button>
          </nav>

          <div className="gh-header__actions">
            <div className="gh-locale-pill">
              <button
                type="button"
                className="gh-locale-btn"
                onClick={() =>
                  setCurrency((prev) => (prev === 'VND' ? 'EUR' : 'VND'))
                }
              >
                {currency === 'VND' ? 'VND ₫' : 'EUR €'}
              </button>
              <span
                style={{
                  color: 'var(--atelier-outline-variant)',
                  fontFamily: 'var(--atelier-font-mono)',
                }}
              >
                |
              </span>
              <span
                className="gh-locale-btn"
                style={{ color: 'var(--atelier-primary)', fontWeight: 700 }}
              >
                VI
              </span>
            </div>

            <button
              type="button"
              className="gh-btn-primary"
              onClick={() => handleOpenBooking()}
            >
              Đặt Phòng Ngay
            </button>

            <button
              type="button"
              aria-label="Cổng đăng nhập nhân sự và cư dân"
              title="Cổng nhân sự & Cư dân (Đăng nhập)"
              onClick={() => void navigate('/login')}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9999,
                border: 0,
                backgroundColor: 'var(--atelier-surface-container)',
                color: 'var(--atelier-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
                aria-hidden="true"
              >
                person
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" style={{ width: '100%', paddingTop: 80 }}>
        {/* 1. Editorial Hero Section (Khớp mẫu hình ảnh) */}
        <section
          className="gh-hero"
          style={{ marginTop: -80 }}
          aria-labelledby="gh-hero-heading"
        >
          <div
            className="gh-hero__bg"
            style={{
              backgroundImage:
                "url('/images/tuscany-hero-2k.webp'), url('/images/tuscany-hero-2k.jpg'), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaM2qj3Pfgt_2gy6AcPhcqyiMWl94KPYP3F9CGbCVnd5wI3fUI6hiO5eW5KcdQzaasF4gFrm4JfprtJcQt-JwAPWCEqvLkP8X1dOWmMemCTnfO97CWk-fEAK19Mto9z3db7KR1XKY-w7nXqzsaJnh5eiHVyJoXzGpNfNr86nC_XupdyGWaUEs0QwP8SpT_70nFNmb2uvTJw5BRBTP6Be-prk-M_D1LjbcOe1JFKYs=s0')",
            }}
          />
          <div className="gh-hero__gradient-t" />

          <div className="gh-hero__content">
            {/* Accolade Pill */}
            <div className="gh-accolade-pill">
              <span
                className="material-symbols-outlined"
                style={{
                  color: '#e5a93c',
                  fontSize: 18,
                  fontVariationSettings: "'FILL' 1",
                }}
                aria-hidden="true"
              >
                hotel_class
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#ffffff',
                }}
              >
                Condé Nast Gold List 2025 • Hai Chìa Khóa Michelin
              </span>
            </div>

            {/* Main Headline */}
            <h1
              id="gh-hero-heading"
              className="gh-hero__title"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 24px rgba(0, 0, 0, 0.75)',
              }}
            >
              Nơi Di Sản Bất Tận Gặp Gỡ Sự Xa Hoa Thanh Lịch
            </h1>
            <p
              className="gh-hero__subtitle"
              style={{
                color: '#f5f0e6',
                textShadow: '0 1px 12px rgba(0, 0, 0, 0.6)',
              }}
            >
              Khu nghỉ dưỡng biệt lập tọa lạc giữa những ngọn đồi Tuscany thơ mộng,
              nơi hội tụ tinh hoa kiến trúc Phục Hưng, nguồn suối khoáng nóng tự
              nhiên và nghệ thuật tiếp đón quý tộc.
            </p>

            {/* Seamless Floating Booking Engine Bar dưới dạng List có thể chọn */}
            <div
              className="gh-booking-bar"
              role="region"
              aria-label="Thanh tìm kiếm và đặt phòng trực tiếp"
            >
              {/* 1. Ngày Lưu Trú */}
              <Dropdown
                trigger={['click']}
                menu={{
                  items: DATE_OPTIONS.map((opt) => ({
                    key: opt.key,
                    label: opt.label,
                    onClick: () => setStayDates(opt.dateStr),
                  })),
                }}
              >
                <div
                  className="gh-booking-bar__segment"
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: 'var(--atelier-primary)',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    calendar_today
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--atelier-on-surface-variant)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ngày Lưu Trú
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--atelier-on-surface)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stayDates}
                    </span>
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 16,
                      color: 'var(--atelier-outline)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </div>
              </Dropdown>

              {/* 2. Số Lượng Khách */}
              <Dropdown
                trigger={['click']}
                menu={{
                  items: GUEST_OPTIONS.map((opt) => ({
                    key: opt.key,
                    label: opt.label,
                    onClick: () => setGuestsDisplay(opt.label),
                  })),
                }}
              >
                <div
                  className="gh-booking-bar__segment"
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: 'var(--atelier-primary)',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    group
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--atelier-on-surface-variant)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Số Lượng Khách
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--atelier-on-surface)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {guestsDisplay}
                    </span>
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 16,
                      color: 'var(--atelier-outline)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </div>
              </Dropdown>

              {/* 3. Hạng Phòng */}
              <Dropdown
                trigger={['click']}
                menu={{
                  items: SANCTUARY_OPTIONS.map((opt) => ({
                    key: opt.key,
                    label: opt.label,
                    onClick: () => {
                      setSanctuaryType(opt.label)
                      setActiveCategory(opt.cat)
                    },
                  })),
                }}
              >
                <div
                  className="gh-booking-bar__segment"
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: 'var(--atelier-primary)',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    king_bed
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--atelier-on-surface-variant)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Hạng Phòng
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--atelier-on-surface)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {sanctuaryType}
                    </span>
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 16,
                      color: 'var(--atelier-outline)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </div>
              </Dropdown>

              {/* 4. Mã Ưu Đãi */}
              <Dropdown
                trigger={['click']}
                menu={{
                  items: PROMO_OPTIONS.map((opt) => ({
                    key: opt.key,
                    label: opt.label,
                    onClick: () => {
                      setPromoCode(opt.code)
                      void message.success(`Đã áp dụng mã ưu đãi: ${opt.code}`)
                    },
                  })),
                }}
              >
                <div
                  className="gh-booking-bar__promo"
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: 'var(--atelier-primary)',
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    sell
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--atelier-on-surface-variant)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Mã Ưu Đãi
                    </span>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      aria-label="Mã khuyến mãi hoặc voucher"
                      placeholder="HERITAGE25"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        border: 0,
                        padding: 0,
                        margin: 0,
                        background: 'transparent',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--atelier-on-surface)',
                        outline: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    />
                  </div>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 16,
                      color: 'var(--atelier-outline)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </div>
              </Dropdown>

              {/* 5. CTA Button */}
              <button
                type="button"
                className="gh-btn-primary"
                style={{
                  height: 52,
                  padding: '0 24px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onClick={() => {
                  scrollToSection('suites-and-villas')
                  void message.success(
                    `Đã cập nhật danh sách phòng trống: ${stayDates} (${guestsDisplay}) • Mã: ${promoCode || 'TRỰC TIẾP'}`,
                  )
                }}
              >
                <span>Kiểm Tra Phòng Trống</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Perks Banner */}
            <div className="gh-perks-strip">
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--atelier-primary-fixed)',
                    fontSize: 16,
                  }}
                  aria-hidden="true"
                >
                  verified
                </span>
                Giá Trực Tiếp Tốt Nhất
              </span>
              <span aria-hidden="true">•</span>
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--atelier-primary-fixed)',
                    fontSize: 16,
                  }}
                  aria-hidden="true"
                >
                  local_cafe
                </span>
                Miễn Phí Bữa Sáng
              </span>
              <span aria-hidden="true">•</span>
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--atelier-primary-fixed)',
                    fontSize: 16,
                  }}
                  aria-hidden="true"
                >
                  schedule
                </span>
                Hủy Phòng Miễn Phí 48h
              </span>
              <span aria-hidden="true">•</span>
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    color: 'var(--atelier-primary-fixed)',
                    fontSize: 16,
                  }}
                  aria-hidden="true"
                >
                  directions_car
                </span>
                Đưa Đón Sân Bay (3+ Đêm)
              </span>
            </div>
          </div>
        </section>

        {/* 2. Curated Stay & Suite Collection */}
        <section
          id="suites-and-villas"
          className="gh-container"
          aria-labelledby="gh-suites-heading"
        >
          <div className="gh-section-head">
            <div>
              <div className="gh-kicker">
                <span className="gh-kicker__line" aria-hidden="true" />
                <span>Không Gian Nghỉ Dưỡng Biệt Lập</span>
              </div>
              <h2 id="gh-suites-heading" className="gh-title-lg">
                Bộ Sưu Tập Phòng &amp; Biệt Thự Grand Heritage
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div
              className="atelier-pill-group"
              role="group"
              aria-label="Lọc chỗ ở theo hạng phòng"
            >
              {(
                [
                  { id: 'all', label: 'Tất Cả Hạng Phòng' },
                  { id: 'heritage', label: 'Suite Di Sản' },
                  { id: 'villa', label: 'Biệt Thự Hồ Bơi' },
                  { id: 'penthouse', label: 'Penthouse Hoàng Gia' },
                ] as const
              ).map((tab) => {
                const isActive = activeCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`atelier-pill-tab ${
                      isActive ? 'is-active-dark' : ''
                    }`}
                    style={{ padding: '8px 16px', fontSize: 12 }}
                    onClick={() => setActiveCategory(tab.id)}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Suites Filterable Grid */}
          <div className="gh-grid-3">
            {visibleSuites.map((suite) => (
              <article key={suite.id} className="gh-card">
                <div className="gh-card__media">
                  <img src={suite.imageUrl} alt={suite.imageAlt} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      backgroundColor: 'rgba(20, 20, 19, 0.82)',
                      backdropFilter: 'blur(8px)',
                      color: '#faf8f5',
                      padding: '4px 12px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {suite.badge}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--atelier-primary)',
                      fontFamily: 'var(--atelier-font-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 9999,
                    }}
                  >
                    {currency === 'EUR' ? suite.eurRate : suite.vndRate}
                  </div>
                </div>

                <div className="gh-card__body">
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--atelier-on-surface-variant)',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 6,
                      }}
                    >
                      <span>{suite.subtitleLeft}</span>
                      <span>{suite.subtitleRight}</span>
                    </div>

                    <h3
                      style={{
                        fontSize: 20,
                        lineHeight: '28px',
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {suite.title}
                    </h3>

                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: '19px',
                        color: 'var(--atelier-on-surface-variant)',
                        marginBottom: 16,
                      }}
                    >
                      {suite.description}
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '8px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        marginBottom: 20,
                      }}
                    >
                      {suite.specs.map((spec) => (
                        <span
                          key={spec.label}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 16,
                              color: 'var(--atelier-primary)',
                            }}
                            aria-hidden="true"
                          >
                            {spec.icon}
                          </span>
                          {spec.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: 8,
                    }}
                  >
                    {/* Bấm Chi Tiết: Mở Popup Modal Chi Tiết & Mặt Bằng thay vì chuyển admin */}
                    <button
                      type="button"
                      className="gh-btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => setFloorplanModalSuite(suite)}
                    >
                      Chi Tiết &amp; Mặt Bằng
                    </button>

                    {/* Bấm Đặt Phòng: Mở Drawer Đặt Phòng Nghỉ Dưỡng Trực Tiếp */}
                    <button
                      type="button"
                      className="gh-btn-primary"
                      style={{ flex: 1, fontSize: 12, padding: '10px 16px' }}
                      onClick={() => handleOpenBooking(suite)}
                    >
                      {suite.ctaLabel}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. The Grand Heritage Experience */}
        <section
          id="the-estate-pillars"
          className="gh-band-low"
          aria-labelledby="gh-pillars-heading"
        >
          <div className="gh-container">
            <div
              style={{
                textAlign: 'center',
                maxWidth: 640,
                margin: '0 auto 40px',
              }}
            >
              <div
                className="gh-kicker"
                style={{ justifyContent: 'center', marginBottom: 8 }}
              >
                <span className="gh-kicker__line" aria-hidden="true" />
                <span>Nghệ Thuật Sống Tinh Tế</span>
                <span className="gh-kicker__line" aria-hidden="true" />
              </div>
              <h2 id="gh-pillars-heading" className="gh-title-lg">
                Trụ Cột Di Sản Grand Heritage
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--atelier-on-surface-variant)',
                  marginTop: 8,
                }}
              >
                Những hành trình trải nghiệm đánh thức mọi giác quan được tuyển chọn
                độc quyền dành cho cư dân lưu trú, thấm đượm phong vị quý tộc Ý.
              </p>
            </div>

            <div className="gh-grid-3">
              {ESTATE_PILLARS.map((pillar) => (
                <article key={pillar.id} className="gh-card">
                  <div className="gh-card__media" style={{ height: 248 }}>
                    <img src={pillar.imageUrl} alt={pillar.imageAlt} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        backgroundColor: 'rgba(20, 20, 19, 0.88)',
                        backdropFilter: 'blur(8px)',
                        color: '#faf8f5',
                        padding: '4px 12px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {pillar.badge}
                    </div>
                  </div>

                  <div className="gh-card__body">
                    <div>
                      <h3
                        style={{
                          fontSize: 20,
                          lineHeight: '28px',
                          fontWeight: 700,
                          marginBottom: 8,
                        }}
                      >
                        {pillar.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          lineHeight: '20px',
                          color: 'var(--atelier-on-surface-variant)',
                          marginBottom: 16,
                        }}
                      >
                        {pillar.description}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--atelier-primary)',
                        }}
                      >
                        {pillar.meta}
                      </span>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          color: 'var(--atelier-primary)',
                          fontSize: 20,
                        }}
                        aria-hidden="true"
                      >
                        east
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Guest Testimonials & Heritage Accolades */}
        <section
          id="guest-chronicle"
          className="gh-container"
          aria-labelledby="gh-chronicle-heading"
        >
          <div className="gh-section-head">
            <div style={{ maxWidth: 560 }}>
              <span className="gh-kicker">Cảm Nhận Du Khách</span>
              <h2 id="gh-chronicle-heading" className="gh-title-lg">
                Được Tôn Vinh Bởi Những Nhà Lữ Hành Thượng Lưu
              </h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { icon: 'verified', label: 'Virtuoso Preferred' },
                { icon: 'key', label: 'Michelin Key 2025' },
                { icon: 'stars', label: 'The Leading Hotels' },
              ].map((badge) => (
                <div
                  key={badge.label}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--atelier-surface-container)',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--atelier-primary)', fontSize: 18 }}
                    aria-hidden="true"
                  >
                    {badge.icon}
                  </span>
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          <div className="gh-grid-3">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="gh-card"
                style={{ padding: 28, position: 'relative' }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      color: 'var(--atelier-primary)',
                      marginBottom: 16,
                    }}
                    aria-label="5 trên 5 sao"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,
                          fontVariationSettings: "'FILL' 1",
                        }}
                        aria-hidden="true"
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: '22px',
                      fontStyle: 'italic',
                      color: 'var(--atelier-on-surface)',
                      marginBottom: 24,
                    }}
                  >
                    {item.quote}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9999,
                      backgroundColor: 'var(--atelier-primary-fixed)',
                      color: 'var(--atelier-on-primary-fixed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--atelier-font-mono)',
                      fontWeight: 700,
                    }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'block',
                      }}
                    >
                      {item.source}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--atelier-on-surface-variant)',
                      }}
                    >
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Exclusive Seasonal Offers & Packages */}
        <section
          id="seasonal-offers"
          className="gh-band-low"
          aria-labelledby="gh-offers-heading"
        >
          <div className="gh-container">
            <div className="gh-section-head">
              <div>
                <span className="gh-kicker">Đặc Quyền Riêng Tư</span>
                <h2 id="gh-offers-heading" className="gh-title-lg">
                  Gói Nghỉ Dưỡng Mùa Lễ Hội &amp; Ưu Đãi Độc Quyền
                </h2>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--atelier-on-surface-variant)',
                  maxWidth: 420,
                  margin: 0,
                }}
              >
                Hành trình nghỉ dưỡng thiết kế riêng kết hợp cùng các đặc quyền
                đặt phòng trực tiếp và nâng hạng phòng ưu tiên.
              </p>
            </div>

            <div className="gh-grid-3">
              {SEASONAL_PACKAGES.map((pkg) => (
                <div key={pkg.id} className="gh-card" style={{ padding: 24 }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: 9999,
                          backgroundColor: 'var(--atelier-primary-fixed)',
                          color: 'var(--atelier-on-primary-fixed)',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {pkg.tag}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--atelier-primary)',
                        }}
                      >
                        {pkg.duration}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 20,
                        lineHeight: '28px',
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {pkg.title}
                    </h3>

                    <p
                      style={{
                        fontSize: 12,
                        lineHeight: '18px',
                        color: 'var(--atelier-on-surface-variant)',
                        marginBottom: 16,
                      }}
                    >
                      {pkg.description}
                    </p>

                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 0 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      {pkg.perks.map((perk) => (
                        <li
                          key={perk}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              color: 'var(--atelier-primary)',
                              fontSize: 18,
                            }}
                            aria-hidden="true"
                          >
                            check_circle
                          </span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: '1px solid var(--atelier-surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--atelier-on-surface-variant)',
                          display: 'block',
                        }}
                      >
                        Chỉ từ
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>
                        {currency === 'EUR' ? pkg.eurPrice : pkg.vndPrice}{' '}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 400,
                            color: 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          / kỳ nghỉ
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      className="gh-btn-primary"
                      style={{ fontSize: 12, padding: '8px 18px' }}
                      onClick={() => handleOpenBooking()}
                    >
                      Đặt Gói Này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Interactive Estate Location & Concierge Arrival */}
        <section
          id="estate-arrival"
          className="gh-container"
          aria-labelledby="gh-arrival-heading"
        >
          <div className="gh-arrival-grid">
            {/* Left: Arrival Guide & Location */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              <div>
                <span className="gh-kicker">Vị Trí Biệt Lập</span>
                <h2
                  id="gh-arrival-heading"
                  className="gh-title-lg"
                  style={{ marginBottom: 12 }}
                >
                  Chỉ Dẫn Đến Khu Nghỉ Dưỡng
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--atelier-on-surface-variant)',
                    marginBottom: 20,
                  }}
                >
                  Tọa lạc trên đỉnh đồi riêng biệt cách Florence 45 phút lái xe
                  về phía nam, bao bọc bởi 80 héc-ta rừng nguyên sinh và các sườn
                  đồi nho Chianti trù phú.
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {[
                    {
                      icon: 'flight_takeoff',
                      title: 'Sân bay Florence Peretola (FLR)',
                      desc: '45 phút di chuyển với xe Mercedes S-Class riêng có tài xế',
                    },
                    {
                      icon: 'travel_explore',
                      title: 'Sân đỗ trực thăng nội khu (ICAO: ZGH2)',
                      desc: 'Tọa độ GPS trong khuôn viên: 43°32\'14"N 11°18\'22"E',
                    },
                    {
                      icon: 'train',
                      title: 'Ga đường sắt cao tốc Santa Maria Novella',
                      desc: 'Dịch vụ quản gia đón tiếp trực tiếp tại sân ga',
                    },
                  ].map((loc) => (
                    <div
                      key={loc.title}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: 14,
                        backgroundColor: 'var(--atelier-surface-container)',
                        borderRadius: 12,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          color: 'var(--atelier-primary)',
                          fontSize: 22,
                          marginTop: 2,
                        }}
                        aria-hidden="true"
                      >
                        {loc.icon}
                      </span>
                      <div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            display: 'block',
                          }}
                        >
                          {loc.title}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          {loc.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  backgroundColor: 'var(--atelier-surface-high)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9999,
                      backgroundColor: 'var(--atelier-primary)',
                      color: 'var(--atelier-on-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20 }}
                      aria-hidden="true"
                    >
                      concierge
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'block',
                      }}
                    >
                      Bàn Dịch Vụ Quản Gia Riêng
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--atelier-on-surface-variant)',
                      }}
                    >
                      Phục vụ 24/7 thiết kế lịch trình cá nhân hóa
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void message.info(
                      'Bàn Quản Gia Trực Tiếp: +39 055 829 0100 • concierge@grandheritage.com',
                    )
                  }
                  style={{
                    backgroundColor: 'var(--atelier-on-surface)',
                    color: 'var(--atelier-surface)',
                    border: 0,
                    padding: '8px 16px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gọi Quản Gia
                </button>
              </div>
            </div>

            {/* Right: FAQ Accordion */}
            <div>
              <span className="gh-kicker">Giải Đáp Thắc Mắc</span>
              <h3 className="gh-title-lg" style={{ marginBottom: 20 }}>
                Câu Hỏi Thường Gặp Về Kỳ Nghỉ
              </h3>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {FAQ_ITEMS.map((faq) => {
                  const isOpen = openFaqId === faq.id
                  return (
                    <button
                      key={faq.id}
                      type="button"
                      className="gh-faq-item"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFaqId((prev) =>
                          prev === faq.id ? null : faq.id,
                        )
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {faq.question}
                        </span>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            color: 'var(--atelier-primary)',
                            fontSize: 20,
                            transform: isOpen
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 250ms ease',
                          }}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </div>
                      {isOpen && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 10,
                            borderTop:
                              '1px solid var(--atelier-surface-container)',
                            fontSize: 12,
                            lineHeight: '19px',
                            color: 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Pre-Footer Call to Action Banner */}
        <section
          style={{
            width: '100%',
            backgroundColor: 'var(--atelier-on-surface)',
            color: 'var(--atelier-surface)',
            padding: '72px 24px',
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 16px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: 'var(--atelier-primary-fixed)',
                marginBottom: 16,
              }}
            >
              Đặt Kỳ Nghỉ Riêng Tư 2025/2026
            </div>

            <h2
              style={{
                fontSize: 'clamp(28px, 3.8vw, 44px)',
                lineHeight: 1.18,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: '#faf8f5',
                maxWidth: 720,
                margin: 0,
              }}
            >
              Kỳ Nghỉ Trong Mơ Đang Chờ Đón Quý Khách
            </h2>

            <p
              style={{
                fontSize: 16,
                lineHeight: '24px',
                color: '#e6e1d6',
                maxWidth: 640,
                margin: '12px 0 32px',
              }}
            >
              Đặt phòng trực tiếp để nhận đặc quyền nâng hạng phòng miễn phí,
              bữa sáng champagne hàng ngày và điểm tín dụng ẩm thực riêng biệt.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <button
                type="button"
                className="gh-btn-primary"
                style={{ padding: '14px 28px' }}
                onClick={() => handleOpenBooking()}
              >
                <span>Đặt Phòng Nghỉ Ngay</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  calendar_month
                </span>
              </button>

              <button
                type="button"
                onClick={() => void navigate('/login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  color: '#faf8f5',
                  padding: '14px 28px',
                  borderRadius: 9999,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>Cổng Nhân Sự &amp; Cư Dân</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  badge
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Grand Heritage Footer */}
      <footer
        role="contentinfo"
        style={{
          width: '100%',
          backgroundColor: 'var(--atelier-surface-low)',
          color: 'var(--atelier-on-surface)',
          padding: '56px 24px 36px',
          borderTop: '1px solid var(--atelier-surface-highest)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="gh-footer-grid">
            {/* Brand Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                }}
              >
                Grand Heritage
              </span>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--atelier-on-surface-variant)',
                  maxWidth: 340,
                  margin: 0,
                }}
              >
                Khu nghỉ dưỡng di sản độc bản thấm đượm nét trang nghiêm cổ điển và
                sự tĩnh tại kiến trúc. Dịch vụ tiếp đón thượng hạng cho những tâm hồn
                lữ khách tinh tế.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'var(--atelier-surface-highest)',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Michelin Key 2025
                </span>
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'var(--atelier-surface-highest)',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  The Leading Hotels of the World
                </span>
              </div>
            </div>

            {/* Navigation Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Khám Phá
              </span>
              <nav
                aria-label="Điều Hướng Footer"
                style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <a
                  href="#suites-and-villas"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('suites-and-villas')
                  }}
                  style={{
                    color: 'var(--atelier-on-surface-variant)',
                    textDecoration: 'none',
                  }}
                >
                  Biệt Thự &amp; Suite Hoàng Gia
                </a>
                <a
                  href="#the-estate-pillars"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('the-estate-pillars')
                  }}
                  style={{
                    color: 'var(--atelier-on-surface-variant)',
                    textDecoration: 'none',
                  }}
                >
                  Ẩm Thực &amp; Rượu Vang
                </a>
                <a
                  href="#the-estate-pillars"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('the-estate-pillars')
                  }}
                  style={{
                    color: 'var(--atelier-on-surface-variant)',
                    textDecoration: 'none',
                  }}
                >
                  Khu Suối Khoáng Nóng
                </a>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    void navigate('/login')
                  }}
                  style={{
                    color: 'var(--atelier-on-surface-variant)',
                    textDecoration: 'none',
                  }}
                >
                  Cổng Quản Trị Grand Heritage
                </a>
              </nav>
            </div>

            {/* Concierge Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Quản Gia &amp; Vị Trí
              </span>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--atelier-on-surface-variant)',
                  margin: 0,
                }}
              >
                Đại Lộ Di Sản Số 04, Vùng Đồi Tuscany
                <br />
                Tỉnh Chianti, Cộng Hòa Ý
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--atelier-on-surface-variant)',
                  margin: 0,
                }}
              >
                Đường dây nóng: +39 055 829 0100
                <br />
                Hòm thư quản gia: concierge@grandheritage.com
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--atelier-on-surface-variant)',
                  }}
                >
                  Instagram:
                </span>
                <span
                  style={{
                    fontFamily: 'var(--atelier-font-mono)',
                    fontSize: 12,
                    color: 'var(--atelier-primary)',
                    fontWeight: 600,
                  }}
                >
                  @grandheritage.estate
                </span>
              </div>
            </div>

            {/* Private Journal Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Bản Tin Di Sản
              </span>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--atelier-on-surface-variant)',
                  margin: 0,
                }}
              >
                Nhận thông tin các ấn bản theo mùa, lời mời thử nếm vang riêng và
                ưu đãi kỳ nghỉ đặc quyền.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void message.success(
                    `Đã đăng ký nhận bản tin Grand Heritage cho email: ${journalEmail || 'quý khách'}.`,
                  )
                  setJournalEmail('')
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <input
                  type="email"
                  value={journalEmail}
                  onChange={(e) => setJournalEmail(e.target.value)}
                  aria-label="Địa chỉ email của quý khách"
                  placeholder="Nhập email của quý khách..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'var(--atelier-surface-container)',
                    borderRadius: 9999,
                    border: '1px solid var(--atelier-surface-highest)',
                    fontSize: 12,
                    color: 'var(--atelier-on-surface)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 9999,
                    border: 0,
                    backgroundColor: 'var(--atelier-on-surface)',
                    color: 'var(--atelier-surface)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Đăng Ký Bản Tin
                </button>
              </form>
            </div>
          </div>

          <div
            style={{
              paddingTop: 24,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 12,
              color: 'var(--atelier-on-surface-variant)',
            }}
          >
            <p style={{ margin: 0 }}>
              © 2025 Grand Heritage Hotel &amp; Residences. Mọi đặc quyền được bảo lưu.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              <a
                href="#privacy"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Chính Sách Quyền Riêng Tư
              </a>
              <a
                href="#terms"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Điều Khoản Lưu Trú
              </a>
              <a
                href="#cookies"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Tùy Chọn Cookie
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. Luxury Guest Booking Modal (Đặt phòng nghỉ dưỡng trực tiếp - Dạng Pop-up) */}
      <Modal
        open={bookingDrawerOpen}
        onCancel={() => {
          setBookingDrawerOpen(false)
          setBookingSuccessCode(null)
        }}
        centered
        width={680}
        footer={null}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--atelier-primary)', fontSize: 22 }}
              aria-hidden="true"
            >
              hotel_class
            </span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Đặt Phòng Nghỉ Dưỡng Trực Tiếp • Grand Heritage
            </span>
          </div>
        }
      >
        {bookingSuccessCode ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 16,
              padding: '40px 16px',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 9999,
                backgroundColor: 'var(--atelier-tertiary-fixed)',
                color: 'var(--atelier-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 36 }}
                aria-hidden="true"
              >
                check_circle
              </span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
              Đặt Phòng Thành Công!
            </h3>
            <p
              style={{
                color: 'var(--atelier-on-surface-variant)',
                fontSize: 14,
                lineHeight: '22px',
                margin: 0,
              }}
            >
              Cảm ơn quý khách <strong>{guestFullName || 'quý khách'}</strong> đã
              tin tưởng lựa chọn Grand Heritage. Quản gia riêng sẽ liên hệ trong
              vòng 15 phút để chuẩn bị các đặc quyền đón tiếp tốt nhất.
            </p>
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--atelier-surface-container)',
                borderRadius: 12,
                fontFamily: 'var(--atelier-font-mono)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--atelier-primary)',
              }}
            >
              Mã Đặt Phòng: {bookingSuccessCode}
            </div>
            <button
              type="button"
              className="gh-btn-primary"
              style={{ marginTop: 12, padding: '10px 24px' }}
              onClick={() => {
                setBookingDrawerOpen(false)
                setBookingSuccessCode(null)
              }}
            >
              Hoàn Tất
            </button>
          </div>
        ) : (
          selectedBookingSuite && (
            <form
              onSubmit={handleConfirmBooking}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                paddingTop: 8,
                maxHeight: 'calc(80vh - 120px)',
                overflowY: 'auto',
                paddingRight: 6,
              }}
            >
              {/* Selected Suite Preview Card */}
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  backgroundColor: 'var(--atelier-surface-low)',
                  padding: 14,
                  borderRadius: 14,
                }}
              >
                <img
                  src={selectedBookingSuite.imageUrl}
                  alt={selectedBookingSuite.imageAlt}
                  style={{
                    width: 100,
                    height: 80,
                    borderRadius: 10,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--atelier-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedBookingSuite.badge}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>
                    {selectedBookingSuite.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--atelier-font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--atelier-on-surface)',
                      marginTop: 4,
                    }}
                  >
                    {currency === 'EUR'
                      ? selectedBookingSuite.eurRate
                      : selectedBookingSuite.vndRate}
                  </span>
                </div>
              </div>

              {/* Stay Itinerary Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    backgroundColor: 'var(--atelier-surface-container)',
                    borderRadius: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--atelier-on-surface-variant)',
                      display: 'block',
                    }}
                  >
                    Ngày Lưu Trú
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {stayDates}
                  </span>
                </div>
                <div
                  style={{
                    padding: 12,
                    backgroundColor: 'var(--atelier-surface-container)',
                    borderRadius: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--atelier-on-surface-variant)',
                      display: 'block',
                    }}
                  >
                    Số Lượng Khách
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {guestsDisplay}
                  </span>
                </div>
              </div>

              {/* Guest Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--atelier-on-surface-variant)',
                  }}
                >
                  Thông Tin Khách Lưu Trú
                </span>

                <label
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    Họ và Tên *
                  </span>
                  <input
                    type="text"
                    required
                    value={guestFullName}
                    onChange={(e) => setGuestFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--atelier-surface-highest)',
                      backgroundColor: 'var(--atelier-surface-lowest)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 12,
                  }}
                >
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      Số Điện Thoại *
                    </span>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="0912 345 678"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--atelier-surface-highest)',
                        backgroundColor: 'var(--atelier-surface-lowest)',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  </label>

                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      Địa Chỉ Email *
                    </span>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="guest@example.com"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--atelier-surface-highest)',
                        backgroundColor: 'var(--atelier-surface-lowest)',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  </label>
                </div>

                <label
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    Yêu Cầu Đặc Biệt Cho Quản Gia
                  </span>
                  <textarea
                    rows={3}
                    value={guestSpecialRequest}
                    onChange={(e) => setGuestSpecialRequest(e.target.value)}
                    placeholder="Ví dụ: Đón tại sân bay Florence, chuẩn bị rượu vang hữu cơ, bữa tối kỷ niệm ngày cưới..."
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--atelier-surface-highest)',
                      backgroundColor: 'var(--atelier-surface-lowest)',
                      fontSize: 13,
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </label>
              </div>

              {/* Price Calculation Box */}
              <div
                style={{
                  padding: 16,
                  backgroundColor: 'var(--atelier-surface-low)',
                  borderRadius: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                  }}
                >
                  <span>
                    Giá phòng (4 đêm ×{' '}
                    {currency === 'EUR'
                      ? selectedBookingSuite.eurRate
                      : selectedBookingSuite.vndRate}
                    )
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--atelier-font-mono)',
                      fontWeight: 600,
                    }}
                  >
                    {currency === 'EUR'
                      ? `€${(selectedBookingSuite.eurRateNumber * 4).toLocaleString()}`
                      : `${(selectedBookingSuite.vndRateNumber * 4).toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>

                {promoCode && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      color: 'var(--atelier-tertiary)',
                    }}
                  >
                    <span>Ưu đãi đặt trực tiếp ({promoCode} • Giảm 25%)</span>
                    <span
                      style={{
                        fontFamily: 'var(--atelier-font-mono)',
                        fontWeight: 600,
                      }}
                    >
                      {currency === 'EUR'
                        ? `-€${(selectedBookingSuite.eurRateNumber * 4 * 0.25).toLocaleString()}`
                        : `-${(selectedBookingSuite.vndRateNumber * 4 * 0.25).toLocaleString('vi-VN')} ₫`}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    color: 'var(--atelier-on-surface-variant)',
                  }}
                >
                  <span>Thuế &amp; Phí Dịch Vụ Quản Gia</span>
                  <span>Đã bao gồm</span>
                </div>

                <div
                  style={{
                    paddingTop: 8,
                    borderTop: '1px solid var(--atelier-surface-container)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    Tổng Thanh Toán Ước Tính:
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--atelier-primary)',
                      fontFamily: 'var(--atelier-font-mono)',
                    }}
                  >
                    {currency === 'EUR'
                      ? `€${(selectedBookingSuite.eurRateNumber * 4 * (promoCode ? 0.75 : 1)).toLocaleString()}`
                      : `${(selectedBookingSuite.vndRateNumber * 4 * (promoCode ? 0.75 : 1)).toLocaleString('vi-VN')} ₫`}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="gh-btn-primary"
                style={{ padding: '14px 20px', width: '100%', fontSize: 14 }}
              >
                <span>Xác Nhận Đặt Phòng Ngay</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </button>
            </form>
          )
        )}
      </Modal>

      {/* 9. Luxury Floorplan & Architectural Details Modal */}
      <Modal
        open={!!floorplanModalSuite}
        onCancel={() => setFloorplanModalSuite(null)}
        footer={null}
        width={720}
        title={
          floorplanModalSuite && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--atelier-primary)', fontSize: 22 }}
                aria-hidden="true"
              >
                meeting_room
              </span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                Mặt Bằng &amp; Chi Tiết Kiến Trúc • {floorplanModalSuite.title}
              </span>
            </div>
          )
        }
      >
        {floorplanModalSuite && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <img
              src={floorplanModalSuite.imageUrl}
              alt={floorplanModalSuite.imageAlt}
              style={{
                width: '100%',
                height: 280,
                borderRadius: 14,
                objectFit: 'cover',
              }}
            />

            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--atelier-primary)',
                  textTransform: 'uppercase',
                }}
              >
                {floorplanModalSuite.badge}
              </span>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 8px' }}>
                {floorplanModalSuite.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: '22px',
                  color: 'var(--atelier-on-surface-variant)',
                  margin: 0,
                }}
              >
                {floorplanModalSuite.floorplanDesc}
              </p>
            </div>

            {/* Architectural Specs Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 10,
                backgroundColor: 'var(--atelier-surface-low)',
                padding: 14,
                borderRadius: 12,
              }}
            >
              {floorplanModalSuite.specs.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: 'var(--atelier-primary)', fontSize: 20 }}
                    aria-hidden="true"
                  >
                    {s.icon}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Exclusive Amenities */}
            <div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                Tiện Ích &amp; Đặc Quyền Thượng Hạng:
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                {floorplanModalSuite.amenities.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--atelier-on-surface-variant)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: 'var(--atelier-tertiary)', fontSize: 18 }}
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--atelier-surface-container)',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--atelier-on-surface-variant)',
                    display: 'block',
                  }}
                >
                  Giá phòng mỗi đêm:
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--atelier-primary)',
                    fontFamily: 'var(--atelier-font-mono)',
                  }}
                >
                  {currency === 'EUR'
                    ? floorplanModalSuite.eurRate
                    : floorplanModalSuite.vndRate}
                </span>
              </div>

              <button
                type="button"
                className="gh-btn-primary"
                style={{ padding: '12px 24px' }}
                onClick={() => {
                  const s = floorplanModalSuite
                  setFloorplanModalSuite(null)
                  handleOpenBooking(s)
                }}
              >
                <span>Đặt Hạng Phòng Này Ngay</span>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
