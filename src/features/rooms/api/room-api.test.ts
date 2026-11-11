import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetcher = vi.fn<typeof fetch>()
function respond(data: unknown, status = 200) {
  fetcher.mockResolvedValue(new Response(JSON.stringify({ message: 'ok', data }), { status }))
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', fetcher)
  fetcher.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

describe('management room API client', () => {
  const hotelId = '11111111-1111-4111-8111-111111111111'
  const roomId = '47a5fc05-f674-bba7-66ff-c6965488b21b'
  const roomTypeId = '33333333-3333-4333-8333-333333333333'

  // Exact IDs produced by R__seed_demo_data.sql for Demo Huế Hoàng Thành.
  const demoRoomIds = [
    '47a5fc05-f674-bba7-66ff-c6965488b21b',
    'cc006f49-39c6-0e3a-307c-8d63189c1bff',
    'bd1236e7-9420-1ce2-94ca-aee96f232acd',
    '22ff682e-fbdf-5dd2-6c3b-f17b575c80b8',
    'c8fba0af-12d9-9f4a-c1bb-dea01ca989f1',
  ]

  it('reads all seeded demo rooms even when UUID version/variant bits are not RFC-generated', async () => {
    respond({
      content: demoRoomIds.map((id, index) => ({
        id, roomTypeId, roomNumber: String(101 + index), floor: '1',
        readiness: 'READY', operationalFrom: '2026-01-01T00:00:00Z',
      })),
      totalElements: 5, page: 0, size: 20, totalPages: 1,
    })
    const { getManagementRooms } = await import('./room-api')
    const result = await getManagementRooms(hotelId)
    expect(result.items.map((room) => room.id)).toEqual(demoRoomIds)
    expect(result.totalItems).toBe(5)
  })

  it('still rejects malformed room identifiers', async () => {
    const { managementRoomSchema } = await import('./room-api')
    for (const id of ['', 'not-an-id', '47a5fc05-f674-bba7-66ff-c6965488b21z']) {
      expect(managementRoomSchema.safeParse({
        id, roomTypeId, roomNumber: '101', readiness: 'READY', operationalFrom: '2026-01-01T00:00:00Z',
      }).success).toBe(false)
    }
  })

  it('gets management rooms via GET /management/hotels/{hotelId}/rooms', async () => {
    respond({
      content: [
        {
          id: roomId,
          roomTypeId,
          roomNumber: '101',
          floor: '1',
          readiness: 'READY',
          readinessUpdatedAt: null,
          operationalFrom: '2026-11-09T00:00:00Z',
          operationalUntil: null,
          createdAt: '2026-11-09T00:00:00Z',
          updatedAt: '2026-11-09T00:00:00Z',
          version: 0,
        },
      ],
      totalElements: 61,
      first: false,
      last: false,
      page: 1,
      size: 20,
      totalPages: 4,
    })

    const { getManagementRooms } = await import('./room-api')
    const result = await getManagementRooms(hotelId, { roomTypeId, page: 1, size: 20 })

    expect(fetcher.mock.calls[0][0]).toContain(`/management/hotels/${hotelId}/rooms?`)
    expect(fetcher.mock.calls[0][0]).toContain(`roomTypeId=${roomTypeId}`)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].roomNumber).toBe('101')
    expect(result.items[0].readiness).toBe('ready')
    expect(result.totalItems).toBe(61)
    expect(result.page).toBe(1)
    expect(fetcher.mock.calls[0][0]).toContain('page=1&size=20')
  })

  it('creates physical room via POST /management/hotels/{hotelId}/rooms', async () => {
    respond(
      {
        id: roomId,
        roomTypeId,
        roomNumber: '102',
        floor: '1',
        readiness: 'ready',
        readinessUpdatedAt: null,
        operationalFrom: '2026-11-09T00:00:00Z',
        operationalUntil: null,
        createdAt: '2026-11-09T00:00:00Z',
        updatedAt: '2026-11-09T00:00:00Z',
        version: 0,
      },
      201,
    )

    const { createManagementRoom } = await import('./room-api')
    const result = await createManagementRoom(hotelId, {
      roomTypeId,
      roomNumber: '102',
      floor: '1',
      operationalFrom: '2026-11-09T00:00:00Z',
    })

    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${hotelId}/rooms`)
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST')
    expect(result.roomNumber).toBe('102')
  })

  it('updates physical room via PATCH /management/hotels/{hotelId}/rooms/{roomId}', async () => {
    respond({
      id: roomId,
      roomTypeId,
      roomNumber: '102-Renovated',
      hotelId,
      floor: 0,
      status: 'cleaning',
      active: false,
      createdAt: '2026-11-09T00:00:00Z',
      updatedAt: '2026-11-09T01:00:00Z',
    })

    const { updateManagementRoom } = await import('./room-api')
    const result = await updateManagementRoom(hotelId, roomId, {
      roomNumber: '102-Renovated',
      status: 'maintenance',
    })

    expect(fetcher.mock.calls[0][0]).toBe(`/api/v1/management/hotels/${hotelId}/rooms/${roomId}`)
    expect(fetcher.mock.calls[0][1]?.method).toBe('PATCH')
    expect(result.roomNumber).toBe('102-Renovated')
    expect(result).toMatchObject({ floor: '0', readiness: 'dirty', active: false })
    expect(result).not.toHaveProperty('operationalFrom')
  })
})


describe('room edit payloads', () => {
  it('keeps DIRTY and nonnumeric floor out of unrelated PATCHes', async () => {
    const { buildRoomEditPayload } = await import('./room-api')
    expect(buildRoomEditPayload(
      { roomNumber: '101', floor: 'Tầng trệt', readiness: 'dirty' },
      { roomNumber: '102', floor: 'Tầng trệt', status: 'dirty' },
    )).toEqual({ roomNumber: '102' })
  })

  it('accepts floor zero and explicit active/status changes', async () => {
    const { buildRoomEditPayload } = await import('./room-api')
    expect(buildRoomEditPayload(
      { roomNumber: '101', floor: '1', readiness: 'dirty' },
      { roomNumber: '101', floor: '0', status: 'ready', active: false },
    )).toEqual({ floor: 0, status: 'ready', active: false })
  })

  it('rejects clearing or nonnumeric floor instead of silently dropping it', async () => {
    const { buildRoomEditPayload } = await import('./room-api')
    for (const floor of ['', 'Tầng trệt', '32768']) {
      expect(() => buildRoomEditPayload(
        { roomNumber: '101', floor: '1', readiness: 'ready' },
        { roomNumber: '101', floor, status: 'ready' },
      )).toThrow(/Tầng/)
    }
  })
})
