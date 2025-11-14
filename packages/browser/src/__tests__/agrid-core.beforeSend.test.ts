import { mockLogger } from './helpers/mock-logger'

import { uuidv7 } from '../uuidv7'
import { defaultAgrid } from './helpers/agrid-instance'
import { CaptureResult, AgridConfig } from '../types'
import { Agrid } from '../agrid-core'
import { knownUnsafeEditableEvent } from '@agrid/core'

const rejectingEventFn = () => {
    return null
}

const editingEventFn = (captureResult: CaptureResult): CaptureResult => {
    return {
        ...captureResult,
        properties: {
            ...captureResult.properties,
            edited: true,
        },
        $set: {
            ...captureResult.$set,
            edited: true,
        },
    }
}

describe('agrid core - before send', () => {
    const baseUTCDateTime = new Date(Date.UTC(2020, 0, 1, 0, 0, 0))
    const eventName = '$event'

    const agridWith = (configOverride: Pick<Partial<AgridConfig>, 'before_send'>): Agrid => {
        const agrid = defaultAgrid().init('testtoken', configOverride, uuidv7())
        return Object.assign(agrid, {
            _send_request: jest.fn(),
        })
    }

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(baseUTCDateTime)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('can reject an event', () => {
        const agrid = agridWith({
            before_send: rejectingEventFn,
        })
        ;(agrid._send_request as jest.Mock).mockClear()

        const capturedData = agrid.capture(eventName, {}, {})

        expect(capturedData).toBeUndefined()
        expect(agrid._send_request).not.toHaveBeenCalled()
        expect(mockLogger.info).toHaveBeenCalledWith(`Event '${eventName}' was rejected in beforeSend function`)
    })

    it('can edit an event', () => {
        const agrid = agridWith({
            before_send: editingEventFn,
        })
        ;(agrid._send_request as jest.Mock).mockClear()

        const capturedData = agrid.capture(eventName, {}, {})

        expect(capturedData).toHaveProperty(['properties', 'edited'], true)
        expect(capturedData).toHaveProperty(['$set', 'edited'], true)
        expect(agrid._send_request).toHaveBeenCalledWith({
            batchKey: undefined,
            callback: expect.any(Function),
            compression: 'best-available',
            data: capturedData,
            method: 'POST',
            url: 'https://us.i.agrid.com/e/',
        })
    })

    it('can take an array of fns', () => {
        const agrid = agridWith({
            before_send: [
                (cr) => {
                    cr.properties = { ...cr.properties, edited_one: true }
                    return cr
                },
                (cr) => {
                    if (cr.event === 'to reject') {
                        return null
                    }
                    return cr
                },
                (cr) => {
                    cr.properties = { ...cr.properties, edited_two: true }
                    return cr
                },
            ],
        })
        ;(agrid._send_request as jest.Mock).mockClear()

        const capturedData = [agrid.capture(eventName, {}, {}), agrid.capture('to reject', {}, {})]

        expect(capturedData.filter((cd) => !!cd)).toHaveLength(1)
        expect(capturedData[0]).toHaveProperty(['properties', 'edited_one'], true)
        expect(capturedData[0]).toHaveProperty(['properties', 'edited_one'], true)
        expect(agrid._send_request).toHaveBeenCalledWith({
            batchKey: undefined,
            callback: expect.any(Function),
            compression: 'best-available',
            data: capturedData[0],
            method: 'POST',
            url: 'https://us.i.agrid.com/e/',
        })
    })

    it('can sanitize $set event', () => {
        const agrid = agridWith({
            before_send: (cr) => {
                cr.$set = { value: 'edited' }
                return cr
            },
        })
        ;(agrid._send_request as jest.Mock).mockClear()

        const capturedData = agrid.capture('$set', {}, { $set: { value: 'provided' } })

        expect(capturedData).toHaveProperty(['$set', 'value'], 'edited')
        expect(agrid._send_request).toHaveBeenCalledWith({
            batchKey: undefined,
            callback: expect.any(Function),
            compression: 'best-available',
            data: capturedData,
            method: 'POST',
            url: 'https://us.i.agrid.com/e/',
        })
    })

    it('warned when making arbitrary event invalid', () => {
        const agrid = agridWith({
            before_send: (cr) => {
                cr.properties = undefined
                return cr
            },
        })
        ;(agrid._send_request as jest.Mock).mockClear()

        const capturedData = agrid.capture(eventName, { value: 'provided' }, {})

        expect(capturedData).not.toHaveProperty(['properties', 'value'], 'provided')
        expect(agrid._send_request).toHaveBeenCalledWith({
            batchKey: undefined,
            callback: expect.any(Function),
            compression: 'best-available',
            data: capturedData,
            method: 'POST',
            url: 'https://us.i.agrid.com/e/',
        })
        expect(mockLogger.warn).toHaveBeenCalledWith(
            `Event '${eventName}' has no properties after beforeSend function, this is likely an error.`
        )
    })

    it('logs a warning when rejecting an unsafe to edit event', () => {
        const agrid = agridWith({
            before_send: rejectingEventFn,
        })
        ;(agrid._send_request as jest.Mock).mockClear()
        // chooses a random string from knownUnEditableEvent
        const randomUnsafeEditableEvent =
            knownUnsafeEditableEvent[Math.floor(Math.random() * knownUnsafeEditableEvent.length)]

        agrid.capture(randomUnsafeEditableEvent, {}, {})

        expect(mockLogger.warn).toHaveBeenCalledWith(
            `Event '${randomUnsafeEditableEvent}' was rejected in beforeSend function. This can cause unexpected behavior.`
        )
    })
})
