import { useState } from 'react'
import { DownOutlined } from '@ant-design/icons'
import { checkoutMoney, checkoutDate, type CheckoutQuote } from '../model/client-checkout'

export function CheckoutPriceDetails({ quote }: { quote: CheckoutQuote }) {
  const [expanded, setExpanded] = useState(false)
  return <div aria-label="Chi tiết giá cần thanh toán">
    <button className="sum-toggle" type="button" aria-expanded={expanded} aria-controls="checkout-price-lines" onClick={() => setExpanded(value => !value)}>
      Chi tiết giá <DownOutlined />
    </button>
    <div className="sum-body" id="checkout-price-lines" data-expanded={expanded}>
      <h2 className="sum-title">Chi tiết giá</h2>
      <dl className="sum-lines">
        <div className="sum-line"><dt>Tiền phòng · {quote.nights} đêm</dt><dd>{checkoutMoney(quote.roomSubtotalAmount, quote.currency)}</dd></div>
        <div className="sum-line"><dt>Phụ thu</dt><dd>{checkoutMoney(quote.surchargeAmount, quote.currency)}</dd></div>
        <div className="sum-line"><dt>Giảm giá</dt><dd>−{checkoutMoney(quote.discountAmount, quote.currency)}</dd></div>
      </dl>
      <details className="sum-nightly">
        <summary>Giá từng đêm</summary>
        <ul>{quote.items.flatMap(item => item.nightlyPrices.map(night => <li className="sum-line" key={`${item.roomTypeId}-${night.stayDate}`}>
          <span>{checkoutDate(night.stayDate)}</span><span>{checkoutMoney(night.unitPrice, quote.currency)}</span>
        </li>))}</ul>
      </details>
    </div>
    <p className="sum-total"><span>Tổng cộng</span><strong>{checkoutMoney(quote.totalAmount, quote.currency)}</strong></p>
  </div>
}
