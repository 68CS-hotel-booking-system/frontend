import { checkoutMoney, checkoutDate, type CheckoutQuote } from '../model/client-checkout'

export function CheckoutPriceDetails({ quote }: { quote: CheckoutQuote }) {
  return <div className="checkout-price-details" aria-label="Chi tiết giá cần thanh toán">
    <h2>Chi tiết giá</h2>
    <details><summary>Tiền phòng · {quote.nights} đêm <strong>{checkoutMoney(quote.roomSubtotalAmount, quote.currency)}</strong></summary><ul>{quote.items.flatMap(item => item.nightlyPrices.map(night => <li key={`${item.roomTypeId}-${night.stayDate}`}><span>{checkoutDate(night.stayDate)}</span><span>{checkoutMoney(night.unitPrice, quote.currency)}</span></li>))}</ul></details>
    <dl><div><dt>Phụ thu</dt><dd>{checkoutMoney(quote.surchargeAmount, quote.currency)}</dd></div><div><dt>Giảm giá</dt><dd>−{checkoutMoney(quote.discountAmount, quote.currency)}</dd></div><div className="checkout-price-total"><dt>Tổng cần thanh toán</dt><dd>{checkoutMoney(quote.totalAmount, quote.currency)}</dd></div></dl>
  </div>
}
