import { useState } from 'react'
import { checkoutMoney, checkoutDate, type CheckoutQuote } from '../model/client-checkout'

export function CheckoutPriceDetails({ quote }: { quote: CheckoutQuote }) {
  const [expanded, setExpanded] = useState(false)

  return <div className="checkout-price-details" aria-label="Chi tiết giá cần thanh toán">
    <h2>Chi tiết giá</h2>
    <button className="checkout-price-toggle" type="button" aria-expanded={expanded} aria-controls="checkout-price-breakdown" onClick={() => setExpanded(!expanded)}>
      Chi tiết giá
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    <div className="checkout-price-breakdown" id="checkout-price-breakdown" data-expanded={expanded}>
      <details>
        <summary>Tiền phòng · {quote.nights} đêm <strong>{checkoutMoney(quote.roomSubtotalAmount, quote.currency)}</strong></summary>
        <ul>{quote.items.flatMap(item => item.nightlyPrices.map(night => <li key={`${item.roomTypeId}-${night.stayDate}`}>
          <span>{checkoutDate(night.stayDate)}</span><span>{checkoutMoney(night.unitPrice, quote.currency)}</span>
        </li>))}</ul>
      </details>
      {(quote.surchargeAmount > 0 || quote.discountAmount > 0) && <dl>
        {quote.surchargeAmount > 0 && <div><dt>Phụ thu</dt><dd>{checkoutMoney(quote.surchargeAmount, quote.currency)}</dd></div>}
        {quote.discountAmount > 0 && <div><dt>Giảm giá</dt><dd>−{checkoutMoney(quote.discountAmount, quote.currency)}</dd></div>}
      </dl>}
    </div>
    <dl>
      <div className="checkout-price-total"><dt>Tổng cần thanh toán</dt><dd>{checkoutMoney(quote.totalAmount, quote.currency)}</dd></div>
    </dl>
  </div>
}
