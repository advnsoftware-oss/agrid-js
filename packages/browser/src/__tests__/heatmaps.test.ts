import './helpers/mock-logger'

import { createPosthogInstance } from './helpers/agrid-instance'
import { uuidv7 } from '../uuidv7'
import { Agrid } from '../agrid-core'
import { FlagsResponse } from '../types'
import { isObject } from '@agrid/core'
import { beforeEach, expect } from '@jest/globals'
import { HEATMAPS_ENABLED_SERVER_SIDE } from '../constants'
import { Heatmaps } from '../heatmaps'

jest.useFakeTimers()

describe('heatmaps', () => {
    let agrid: Agrid
    let beforeSendMock = jest.fn().mockImplementation((e) => e)

    const createMockMouseEvent = (props: Partial<MouseEvent> = {}) =>
        ({
            target: document.body,
            clientX: 10,
            clientY: 20,
            ...props,
        }) as unknown as MouseEvent

    beforeEach(async () => {
        beforeSendMock = beforeSendMock.mockClear()

        agrid = await createPosthogInstance(uuidv7(), {
            before_send: beforeSendMock,
            sanitize_properties: (props) => {
                // what ever sanitization makes sense
                const sanitizeUrl = (url: string) => url.replace(/https?:\/\/[^/]+/g, 'http://replaced')
                if (props['$current_url']) {
                    props['$current_url'] = sanitizeUrl(props['$current_url'])
                }
                if (isObject(props['$heatmap_data'])) {
                    // the keys of the heatmap data are URLs, so we might need to sanitize them to
                    // this sanitized URL would need to be entered in the toolbar for the heatmap display to work
                    props['$heatmap_data'] = Object.entries(props['$heatmap_data']).reduce((acc, [url, data]) => {
                        acc[sanitizeUrl(url)] = data
                        return acc
                    }, {})
                }
                return props
            },
            // simplifies assertions by not needing to ignore events
            capture_pageview: false,
        })

        agrid.config.capture_heatmaps = true

        // make sure we start fresh
        agrid.heatmaps!.startIfEnabled()
        expect(agrid.heatmaps!.getAndClearBuffer()).toBeUndefined()

        agrid.register({ $current_test_name: expect.getState().currentTestName })
    })

    it('should send generated heatmap data', async () => {
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds + 1)

        expect(beforeSendMock).toBeCalledTimes(1)
        expect(beforeSendMock.mock.lastCall[0]).toMatchObject({
            event: '$$heatmap',
            properties: {
                $heatmap_data: {
                    'http://replaced/': [
                        {
                            target_fixed: false,
                            type: 'click',
                            x: 10,
                            y: 20,
                        },
                    ],
                },
            },
        })
    })

    it('should flush on window unload', async () => {
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())

        window.dispatchEvent(new Event('beforeunload'))

        expect(beforeSendMock).toBeCalledTimes(1)
        expect(beforeSendMock.mock.lastCall[0]).toMatchObject({
            event: '$$heatmap',
            properties: {
                $heatmap_data: {
                    'http://replaced/': [
                        {
                            target_fixed: false,
                            type: 'click',
                            x: 10,
                            y: 20,
                        },
                    ],
                },
            },
        })
    })

    it('requires interval to pass before sending data', async () => {
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds - 1)

        expect(beforeSendMock).toBeCalledTimes(0)
        expect(agrid.heatmaps!.getAndClearBuffer()).toBeDefined()
    })

    it('should handle empty mouse moves', async () => {
        agrid.heatmaps?.['_onMouseMove']?.(new Event('mousemove'))

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds + 1)

        expect(beforeSendMock).toBeCalledTimes(0)
    })

    it('should send rageclick events in the same area', async () => {
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds + 1)

        expect(beforeSendMock).toBeCalledTimes(1)
        expect(beforeSendMock.mock.lastCall[0].event).toEqual('$$heatmap')
        const heatmapData = beforeSendMock.mock.lastCall[0].properties.$heatmap_data
        expect(heatmapData).toBeDefined()
        expect(heatmapData['http://replaced/']).toHaveLength(4)
        expect(heatmapData['http://replaced/'].map((x) => x.type)).toEqual(['click', 'click', 'rageclick', 'click'])
    })

    it('should clear the buffer after each call', async () => {
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())
        agrid.heatmaps?.['_onClick']?.(createMockMouseEvent())

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds + 1)

        expect(beforeSendMock).toBeCalledTimes(1)
        expect(beforeSendMock.mock.lastCall[0].event).toEqual('$$heatmap')
        expect(beforeSendMock.mock.lastCall[0].properties.$heatmap_data).toBeDefined()
        expect(beforeSendMock.mock.lastCall[0].properties.$heatmap_data['http://replaced/']).toHaveLength(2)

        expect(agrid.heatmaps!['buffer']).toEqual(undefined)

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds + 1)

        expect(beforeSendMock).toBeCalledTimes(1)
    })

    it('should ignore clicks if they come from the toolbar', async () => {
        const testElementToolbar = document.createElement('div')
        testElementToolbar.id = '__AGRID_TOOLBAR__'

        agrid.heatmaps?.['_onClick']?.(
            createMockMouseEvent({
                target: testElementToolbar,
            })
        )
        expect(agrid.heatmaps?.['buffer']).toEqual(undefined)

        const testElementClosest = document.createElement('div')
        testElementClosest.closest = () => {
            return {}
        }

        agrid.heatmaps?.['_onClick']?.(
            createMockMouseEvent({
                target: testElementClosest,
            })
        )
        expect(agrid.heatmaps?.['buffer']).toEqual(undefined)

        agrid.heatmaps?.['_onClick']?.(
            createMockMouseEvent({
                target: document.body,
            })
        )
        expect(agrid.heatmaps?.getAndClearBuffer()).not.toEqual(undefined)
        expect(beforeSendMock.mock.calls).toEqual([])
    })

    it('should ignore an empty buffer', async () => {
        expect(beforeSendMock.mock.calls).toEqual([])

        expect(agrid.heatmaps?.['buffer']).toEqual(undefined)

        jest.advanceTimersByTime(agrid.heatmaps!.flushIntervalMilliseconds + 1)

        expect(beforeSendMock.mock.calls).toEqual([])
    })

    describe('isEnabled()', () => {
        it.each([
            [undefined, false],
            [true, true],
            [false, false],
        ])('when stored remote config is %p - heatmaps enabled should be %p', (stored, expected) => {
            agrid.persistence!.register({ [HEATMAPS_ENABLED_SERVER_SIDE]: stored })
            agrid.config.enable_heatmaps = undefined
            agrid.config.capture_heatmaps = undefined
            const heatmaps = new Heatmaps(agrid)
            expect(heatmaps.isEnabled).toBe(expected)
        })

        it.each([
            [undefined, false],
            [true, true],
            [false, false],
        ])('when local deprecated config is %p - heatmaps enabled should be %p', (deprecatedConfig, expected) => {
            agrid.persistence!.register({ [HEATMAPS_ENABLED_SERVER_SIDE]: undefined })
            agrid.config.enable_heatmaps = deprecatedConfig
            agrid.config.capture_heatmaps = undefined
            const heatmaps = new Heatmaps(agrid)
            expect(heatmaps.isEnabled).toBe(expected)
        })

        it.each([
            [undefined, false],
            [true, true],
            [false, false],
        ])('when local current config is %p - heatmaps enabled should be %p', (localConfig, expected) => {
            agrid.persistence!.register({ [HEATMAPS_ENABLED_SERVER_SIDE]: undefined })
            agrid.config.enable_heatmaps = localConfig
            agrid.config.capture_heatmaps = undefined
            const heatmaps = new Heatmaps(agrid)
            expect(heatmaps.isEnabled).toBe(expected)
        })

        it.each([
            // deprecated client side not defined
            [undefined, undefined, false, false],
            [undefined, undefined, true, true],
            [undefined, true, false, true],
            [undefined, false, false, false],
            // deprecated client false
            [false, undefined, false, false],
            [false, undefined, true, false],
            [false, false, false, false],
            [false, false, true, false],
            [false, true, false, true],
            [false, true, true, true],

            // deprecated client true
            [true, undefined, false, true],
            [true, undefined, true, true],
            // current config overrides deprecated
            [true, false, false, false],
            [true, true, true, true],
        ])(
            'when deprecated client side config is %p, current client side config is %p, and remote opt in is %p - heatmaps enabled should be %p',
            (deprecatedclientSideOptIn, clientSideOptIn, serverSideOptIn, expected) => {
                agrid.config.enable_heatmaps = deprecatedclientSideOptIn
                agrid.config.capture_heatmaps = clientSideOptIn
                agrid.heatmaps!.onRemoteConfig({
                    heatmaps: serverSideOptIn,
                } as FlagsResponse)
                expect(agrid.heatmaps!.isEnabled).toBe(expected)
            }
        )
    })

    it('starts dead clicks autocapture with the correct config', () => {
        const heatmapsDeadClicksInstance = agrid.heatmaps['_deadClicksCapture']
        expect(heatmapsDeadClicksInstance.isEnabled(heatmapsDeadClicksInstance)).toBe(true)
        // this is a little nasty but the binding to this makes the function not directly comparable
        expect(JSON.stringify(heatmapsDeadClicksInstance.onCapture)).toEqual(
            JSON.stringify(agrid.heatmaps['_onDeadClick'].bind(agrid.heatmaps))
        )
    })

    describe.each([
        [false, undefined, 'http://localhost/?gclid=12345&other=true'],
        [true, undefined, 'http://localhost/?gclid=<masked>&other=true'],
        [true, ['other'], 'http://localhost/?gclid=<masked>&other=<masked>'],
    ])(
        'the behaviour when mask_personal_data_properties is %s and custom_personal_data_properties is %s',
        (
            maskPersonalDataProperties: boolean,
            customPersonalDataProperties: undefined | string[],
            maskedUrl: string
        ) => {
            beforeEach(async () => {
                beforeSendMock = beforeSendMock.mockClear()

                const agridWithMasking = await createPosthogInstance(uuidv7(), {
                    before_send: beforeSendMock,
                    mask_personal_data_properties: maskPersonalDataProperties,
                    custom_personal_data_properties: customPersonalDataProperties,
                })

                Object.defineProperty(window, 'location', {
                    value: {
                        href: 'http://localhost/?gclid=12345&other=true',
                    },
                    writable: true,
                })

                agridWithMasking.config.capture_heatmaps = true
                agridWithMasking.heatmaps!.startIfEnabled()
                agridWithMasking.heatmaps?.['_onClick']?.(createMockMouseEvent())

                jest.advanceTimersByTime(agridWithMasking.heatmaps!.flushIntervalMilliseconds + 1)
            })

            it('masks properties accordingly', async () => {
                const heatmapData = beforeSendMock.mock.lastCall[0].properties.$heatmap_data
                expect(heatmapData).toMatchObject({ [maskedUrl]: {} })
            })
        }
    )
})
