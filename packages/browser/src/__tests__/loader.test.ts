/*
 * Test that basic SDK usage (init, capture, etc) does not
 * blow up in non-browser (node.js) envs. These are not
 * tests of server-side capturing functionality (which is
 * currently not supported in the browser lib).
 */

import { Agrid } from '../agrid-core'
import { defaultAgrid } from './helpers/agrid-instance'

import sinon from 'sinon'
import { assignableWindow, window } from '../utils/globals'

describe(`Module-based loader in Node env`, () => {
    const agrid = defaultAgrid()

    beforeEach(() => {
        // NOTE: Temporary change whilst testing remote config
        assignableWindow._AGRID_REMOTE_CONFIG = {
            'test-token': {
                config: {},
                siteApps: [],
            },
        } as any
        // assignableWindow.__PosthogExtensions__ = {}

        jest.useFakeTimers()
        jest.spyOn(agrid, '_send_request').mockReturnValue()
        jest.spyOn(window!.console, 'log').mockImplementation()
    })

    it('should load and capture the pageview event', () => {
        const sandbox = sinon.createSandbox()
        let loaded = false
        const _originalCapture = agrid.capture
        agrid.capture = sandbox.spy()
        agrid.init(`test-token`, {
            disable_surveys: true,
            debug: true,
            persistence: `localStorage`,
            api_host: `https://test.com`,
            loaded: function () {
                loaded = true
            },
        })

        jest.runOnlyPendingTimers()

        sinon.assert.calledOnce(agrid.capture as sinon.SinonSpy<any>)
        const captureArgs = (agrid.capture as sinon.SinonSpy<any>).args[0]
        const event = captureArgs[0]
        expect(event).toBe('$pageview')
        expect(loaded).toBe(true)

        agrid.capture = _originalCapture
    })

    it(`supports identify()`, () => {
        expect(() => agrid.identify(`Pat`)).not.toThrow()
    })

    it(`supports capture()`, () => {
        expect(() => agrid.capture(`Pat`)).not.toThrow()
    })

    it(`always returns agrid from init`, () => {
        console.error = jest.fn()
        console.warn = jest.fn()

        expect(agrid.init(`my-test`, { disable_surveys: true }, 'sdk-1')).toBeInstanceOf(Agrid)
        expect(agrid.init(``, { disable_surveys: true }, 'sdk-2')).toBeInstanceOf(Agrid)

        expect(console.error).toHaveBeenCalledWith(
            '[Agrid.js]',
            'Agrid was initialized without a token. This likely indicates a misconfiguration. Please check the first argument passed to agrid.init()'
        )

        // Already loaded logged even when not debug
        expect(agrid.init(`my-test`, { disable_surveys: true }, 'sdk-1')).toBeInstanceOf(Agrid)
        expect(console.warn).toHaveBeenCalledWith(
            '[Agrid.js]',
            'You have already initialized Agrid! Re-initializing is a no-op'
        )
    })
})
