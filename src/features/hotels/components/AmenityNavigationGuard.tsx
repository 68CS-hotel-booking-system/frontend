import { Button, Modal } from 'antd'
import { useBeforeUnload, useBlocker } from 'react-router'
import { useCallback } from 'react'
export function AmenityNavigationGuard({ dirty, saving, save, reset, name, error }: { dirty: boolean; saving: boolean; save: () => Promise<boolean>; reset: () => void; name: string; error?: string | null }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (dirty || saving) && `${currentLocation.pathname}${currentLocation.search}${currentLocation.hash}` !== `${nextLocation.pathname}${nextLocation.search}${nextLocation.hash}`)
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => { if (dirty || saving) { event.preventDefault(); event.returnValue = '' } }, [dirty, saving]))
  return <Modal open={blocker.state === 'blocked'} title="Bạn có thay đổi chưa lưu" closable={!saving} mask={{ closable: !saving }} onCancel={() => { if (!saving && blocker.state === 'blocked') blocker.reset() }} footer={<div className="flex flex-wrap justify-end gap-2"><Button disabled={saving} onClick={() => blocker.state === 'blocked' && blocker.reset()}>Ở lại</Button><Button danger disabled={saving} onClick={() => { if (blocker.state === 'blocked') { reset(); blocker.proceed() } }}>Bỏ thay đổi</Button><Button type="primary" aria-label="Lưu và chuyển" loading={saving} onClick={async () => { if (blocker.state === 'blocked' && await save()) blocker.proceed() }}>Lưu và chuyển</Button></div>}>
    <p>Tiện ích của <strong>{name}</strong> chưa được lưu. Bạn muốn xử lý thế nào trước khi chuyển?</p>{error && <p role="alert" className="text-[#ba1a1a]">{error}</p>}
  </Modal>
}
