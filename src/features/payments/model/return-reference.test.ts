import { expect, it } from 'vitest'
import { returnReference } from './return-reference'
const id = '11111111-1111-4111-8111-111111111111'
it('uses only the reference even when the URL claims success and a different amount', () => {
  expect(returnReference(new URLSearchParams({ vnp_TxnRef: id, vnp_ResponseCode: '00', vnp_Amount: '1' }))).toBe(id)
})
it('rejects missing, duplicate and malformed references', () => {
  for (const search of ['', 'vnp_TxnRef=bad', `vnp_TxnRef=${id}&vnp_TxnRef=${id}`]) {
    expect(returnReference(new URLSearchParams(search))).toBeNull()
  }
})
