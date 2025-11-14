/* eslint-disable compat/compat */
/*
 * Test that integration with Segment works as expected. The integration should:
 *
 *   - Set the distinct_id to the user's ID if available.
 *   - Set the distinct_id to the anonymous ID if the user's ID is not available.
 *   - Enrich Segment events with Agrid event properties.
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'

import { USER_STATE } from '../constants'
import { SegmentContext, SegmentPlugin } from '../extensions/segment-integration'
import { Agrid } from '../agrid-core'
import { assignableWindow } from '../utils/globals'
import { AgridConfig } from '../types'

const initAgridInAPromise = (
    segment: any,
    agridName: string,
    config?: Partial<AgridConfig>
): Promise<Agrid> => {
    return new Promise((resolve) => {
        return new Agrid().init(
            `test-token`,
            {
                debug: true,
                persistence: `localStorage`,
                api_host: `https://test.com`,
                segment: segment,
                loaded: resolve,
                disable_surveys: true,
                // want to avoid flags code logging during tests
                advanced_disable_feature_flags: true,
                ...(config || {}),
            },
            agridName
        )
    })
}

// sometimes flakes because of unexpected console.logs
jest.retryTimes(6)

describe(`Segment integration`, () => {
    let segment: any
    let segmentIntegration: SegmentPlugin
    let agridName: string

    jest.setTimeout(500)

    beforeEach(() => {
        assignableWindow._AGRID_REMOTE_CONFIG = {
            'test-token': {
                config: {},
                siteApps: [],
            },
        } as any

        // Create something that looks like the Segment Analytics 2.0 API. We
        // could use the actual client, but it's a little more tricky and we'd
        // want to mock out the network requests, for which we don't have a good
        // way to do so at the moment.
        segment = {
            user: () => ({
                anonymousId: () => 'test-anonymous-id',
                id: () => 'test-id',
            }),
            register: (integration: SegmentPlugin) => {
                // IMPORTANT: the real register function returns a Promise. We
                // want to do the same thing and have some way to verify that
                // the integration is setup in time for the `loaded` callback.
                // To ensure the Promise isn't resolved instantly, we use a
                // setTimeout with a delay of 0 to ensure it happens as a
                // microtask in the future.

                return new Promise((resolve) => {
                    setTimeout(() => {
                        segmentIntegration = integration
                        resolve(integration)
                    }, 0)
                })
            },
        }

        // logging of network requests during init causes this to flake
        console.error = jest.fn()
    })

    it('should call loaded after the segment integration has been set up', async () => {
        const loadPromise = initAgridInAPromise(segment, agridName)
        expect(segmentIntegration).toBeUndefined()
        await loadPromise
        expect(segmentIntegration).toBeDefined()
    })

    it('should set properties from the segment user', async () => {
        const agrid = await initAgridInAPromise(segment, agridName)

        expect(agrid.get_distinct_id()).toBe('test-id')
        expect(agrid.get_property('$device_id')).toBe('test-anonymous-id')
    })

    it('should handle the segment user being a promise', async () => {
        segment.user = () =>
            Promise.resolve({
                anonymousId: () => 'test-anonymous-id',
                id: () => 'test-id',
            })

        const agrid = await initAgridInAPromise(segment, agridName)

        expect(agrid.get_distinct_id()).toBe('test-id')
        expect(agrid.get_property('$device_id')).toBe('test-anonymous-id')
    })

    it('should handle segment.identify after bootstrap', async () => {
        segment.user = () => ({
            anonymousId: () => 'test-anonymous-id',
            id: () => '',
        })

        const agrid = await initAgridInAPromise(segment, agridName, { persistence: 'memory' })

        expect(agrid.get_distinct_id()).not.toEqual('test-id')
        expect(agrid.persistence?.get_property(USER_STATE)).toEqual('anonymous')

        if (segmentIntegration && segmentIntegration.identify) {
            segmentIntegration.identify({
                event: {
                    event: '$identify',
                    userId: 'distinguished user',
                    anonymousId: 'anonymous segment user',
                },
            } as unknown as SegmentContext)

            expect(agrid.get_distinct_id()).toEqual('distinguished user')
            expect(agrid.persistence?.get_property(USER_STATE)).toEqual('identified')
        }
    })
})
