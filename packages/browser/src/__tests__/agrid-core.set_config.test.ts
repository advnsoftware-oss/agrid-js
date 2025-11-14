import { defaultAgrid } from './helpers/agrid-instance'
import { uuidv7 } from '../uuidv7'
import Config from '../config'

describe('agrid.set_config', () => {
    const mockURL = jest.fn()
    const mockReferrer = jest.fn()
    const originalWindowLocation = window.location

    beforeEach(() => {
        mockReferrer.mockReturnValue('https://referrer.com')
        mockURL.mockReturnValue('https://example.com')
        console.error = jest.fn()
        console.log = jest.fn()

        // Mock getters using Object.defineProperty
        Object.defineProperty(document, 'URL', {
            get: mockURL,
            configurable: true,
        })
        Object.defineProperty(document, 'referrer', {
            get: mockReferrer,
            configurable: true,
        })

        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            writable: true,
            // eslint-disable-next-line compat/compat
            value: new URL('https://example.com'),
        })

        // Clear localStorage before each test
        localStorage.clear()
        // Reset Config.DEBUG to default
        Config.DEBUG = false
    })

    afterEach(() => {
        defaultAgrid().reset()
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: originalWindowLocation,
        })
        localStorage.clear()
        Config.DEBUG = false
    })

    describe('debug flag behavior', () => {
        it.each([
            { initial: false, setValue: true, expectedDebug: true, expectedStorage: '"true"' },
            { initial: true, setValue: false, expectedDebug: false, expectedStorage: null },
        ])(
            'should set debug to $setValue when initially $initial',
            ({ initial, setValue, expectedDebug, expectedStorage }) => {
                const token = uuidv7()
                const agrid = defaultAgrid().init(token, { debug: initial }, token)!

                agrid.set_config({ debug: setValue })

                expect(agrid.config.debug).toBe(expectedDebug)
                expect(Config.DEBUG).toBe(expectedDebug)
                expect(localStorage.getItem('ph_debug')).toBe(expectedStorage)
            }
        )

        it('should read ph_debug from localStorage when debug defaults to false', () => {
            // Even if ph_debug is in localStorage, default config sets debug to false
            localStorage.setItem('ph_debug', 'true')
            const token = uuidv7()

            const agrid = defaultAgrid().init(token, {}, token)!

            expect(agrid.config.debug).toBe(true)
            expect(Config.DEBUG).toBe(true)
        })

        it('should persist debug=true to localStorage when set', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, {}, token)!
            expect(localStorage.getItem('ph_debug')).toBeNull()

            agrid.set_config({ debug: true })

            expect(localStorage.getItem('ph_debug')).toBe('"true"')
        })

        it('should remove ph_debug from localStorage when debug is set to false', () => {
            // localStore._get returns raw value, so we set 'true' without JSON serialization
            localStorage.setItem('ph_debug', 'true')
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, {}, token)!

            agrid.set_config({ debug: false })

            expect(localStorage.getItem('ph_debug')).toBeNull()
        })

        it('should toggle debug mode multiple times', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, { debug: false }, token)!

            agrid.set_config({ debug: true })
            expect(agrid.config.debug).toBe(true)
            expect(Config.DEBUG).toBe(true)
            expect(localStorage.getItem('ph_debug')).toBe('"true"')

            agrid.set_config({ debug: false })
            expect(agrid.config.debug).toBe(false)
            expect(Config.DEBUG).toBe(false)
            expect(localStorage.getItem('ph_debug')).toBeNull()

            agrid.set_config({ debug: true })
            expect(agrid.config.debug).toBe(true)
            expect(Config.DEBUG).toBe(true)
            expect(localStorage.getItem('ph_debug')).toBe('"true"')
        })

        it('should not modify debug if not a boolean', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, { debug: false }, token)!
            const initialDebug = agrid.config.debug
            const initialConfigDebug = Config.DEBUG

            agrid.set_config({ api_host: 'https://new-host.com' })

            expect(agrid.config.debug).toBe(initialDebug)
            expect(Config.DEBUG).toBe(initialConfigDebug)
        })
    })

    describe('general config updates', () => {
        it('should update simple config values', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, {}, token)!

            agrid.set_config({ api_host: 'https://new-host.com' })

            expect(agrid.config.api_host).toBe('https://new-host.com')
        })

        it('should update multiple config values at once', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, {}, token)!

            agrid.set_config({
                api_host: 'https://new-host.com',
                capture_pageview: false,
                capture_pageleave: false,
            })

            expect(agrid.config.api_host).toBe('https://new-host.com')
            expect(agrid.config.capture_pageview).toBe(false)
            expect(agrid.config.capture_pageleave).toBe(false)
        })

        it('should preserve existing config when updating subset of values', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(
                token,
                {
                    api_host: 'https://original.com',
                    capture_pageview: true,
                },
                token
            )!

            agrid.set_config({ capture_pageview: false })

            expect(agrid.config.api_host).toBe('https://original.com')
            expect(agrid.config.capture_pageview).toBe(false)
        })

        it('should handle empty config object', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, { debug: false }, token)!
            const originalConfig = { ...agrid.config }

            agrid.set_config({})

            expect(agrid.config.debug).toBe(originalConfig.debug)
            expect(agrid.config.api_host).toBe(originalConfig.api_host)
        })
    })

    describe('persistence configuration', () => {
        it('should update session persistence when persistence type changes', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, { persistence: 'localStorage' }, token)!

            // When persistence is localStorage, sessionPersistence is a separate sessionStorage object
            const originalSessionPersistence = agrid.sessionPersistence
            expect(originalSessionPersistence).not.toBe(agrid.persistence)

            agrid.set_config({ persistence: 'cookie' })

            // After changing to cookie, sessionPersistence should be recreated
            expect(agrid.sessionPersistence).not.toBe(originalSessionPersistence)
        })

        it.each([{ persistenceType: 'sessionStorage' }, { persistenceType: 'memory' }] as const)(
            'should keep session persistence same as persistence for $persistenceType',
            ({ persistenceType }) => {
                const token = uuidv7()
                const agrid = defaultAgrid().init(token, { persistence: 'cookie' }, token)!

                agrid.set_config({ persistence: persistenceType })

                expect(agrid.sessionPersistence).toBe(agrid.persistence)
            }
        )
    })

    describe('session recording config', () => {
        it('should update disable_session_recording config', () => {
            const token = uuidv7()
            const agrid = defaultAgrid().init(token, { disable_session_recording: false }, token)!

            agrid.set_config({ disable_session_recording: true })

            expect(agrid.config.disable_session_recording).toBe(true)
        })
    })
})
