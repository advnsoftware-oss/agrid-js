import { mockLogger } from './helpers/mock-logger'

import { createPosthogInstance } from './helpers/agrid-instance'
import { uuidv7 } from '../uuidv7'

describe('identify', () => {
    // Note that there are other tests for identify in agrid-core.identify.js
    // These are in the old style of tests, if you are feeling helpful you could
    // convert them to the new style in this file.

    it('should persist the distinct_id', async () => {
        // arrange
        const token = uuidv7()
        const agrid = await createPosthogInstance(token)
        const distinctId = '123'

        // act
        agrid.identify(distinctId)

        // assert
        expect(agrid.persistence!.properties()['$user_id']).toEqual(distinctId)
        expect(mockLogger.error).toBeCalledTimes(0)
        expect(mockLogger.warn).toBeCalledTimes(0)
    })

    it('should convert a numeric distinct_id to a string', async () => {
        // arrange
        const token = uuidv7()
        const agrid = await createPosthogInstance(token)
        const distinctIdNum = 123
        const distinctIdString = '123'

        // act
        agrid.identify(distinctIdNum as any)

        // assert
        expect(agrid.persistence!.properties()['$user_id']).toEqual(distinctIdString)
        expect(mockLogger.error).toBeCalledTimes(0)
        expect(mockLogger.warn).toBeCalledTimes(1)
    })

    it('should send $is_identified = true with the identify event and following events', async () => {
        // arrange
        const token = uuidv7()
        const beforeSendMock = jest.fn().mockImplementation((e) => e)
        const agrid = await createPosthogInstance(token, { before_send: beforeSendMock })
        const distinctId = '123'

        // act
        agrid.capture('custom event before identify')
        agrid.identify(distinctId)
        agrid.capture('custom event after identify')

        // assert
        const eventBeforeIdentify = beforeSendMock.mock.calls[0]
        expect(eventBeforeIdentify[0].properties.$is_identified).toEqual(false)
        const identifyCall = beforeSendMock.mock.calls[1]
        expect(identifyCall[0].event).toEqual('$identify')
        expect(identifyCall[0].properties.$is_identified).toEqual(true)
        const eventAfterIdentify = beforeSendMock.mock.calls[2]
        expect(eventAfterIdentify[0].properties.$is_identified).toEqual(true)
    })
})
