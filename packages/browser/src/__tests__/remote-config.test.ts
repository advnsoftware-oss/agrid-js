import { RemoteConfigLoader } from '../remote-config'
import { RequestRouter } from '../utils/request-router'
import { Agrid } from '../agrid-core'
import { AgridConfig, RemoteConfig } from '../types'
import '../entrypoints/external-scripts-loader'
import { assignableWindow } from '../utils/globals'

describe('RemoteConfigLoader', () => {
    let agrid: Agrid

    beforeEach(() => {
        const defaultConfig: Partial<AgridConfig> = {
            token: 'testtoken',
            api_host: 'https://test.com',
            persistence: 'memory',
        }

        document.body.innerHTML = ''
        document.head.innerHTML = ''
        jest.spyOn(window.console, 'error').mockImplementation()

        agrid = {
            config: { ...defaultConfig },
            _onRemoteConfig: jest.fn(),
            _send_request: jest.fn().mockImplementation(({ callback }) => callback?.({ config: {} })),
            _shouldDisableFlags: () =>
                agrid.config.advanced_disable_flags || agrid.config.advanced_disable_decide || false,
            featureFlags: {
                ensureFlagsLoaded: jest.fn(),
            },
            requestRouter: new RequestRouter({ config: defaultConfig } as unknown as Agrid),
        } as unknown as Agrid
    })

    describe('remote config', () => {
        const config = { surveys: true } as RemoteConfig

        beforeEach(() => {
            agrid.config.__preview_remote_config = true
            assignableWindow._AGRID_REMOTE_CONFIG = undefined
            assignableWindow.AGRID_DEBUG = true

            assignableWindow.__PosthogExtensions__.loadExternalDependency = jest.fn(
                (_ph: Agrid, _name: string, cb: (err?: any) => void) => {
                    assignableWindow._AGRID_REMOTE_CONFIG = {}
                    assignableWindow._AGRID_REMOTE_CONFIG[_ph.config.token] = {
                        config,
                        siteApps: [],
                    }
                    cb()
                }
            )

            agrid._send_request = jest.fn().mockImplementation(({ callback }) => callback?.({ json: config }))
        })

        it('properly pulls from the window and uses it if set', () => {
            assignableWindow._AGRID_REMOTE_CONFIG = {
                [agrid.config.token]: {
                    config,
                    siteApps: [],
                },
            }
            new RemoteConfigLoader(agrid).load()

            expect(assignableWindow.__PosthogExtensions__.loadExternalDependency).not.toHaveBeenCalled()
            expect(agrid._send_request).not.toHaveBeenCalled()

            expect(agrid._onRemoteConfig).toHaveBeenCalledWith(config)
        })

        it('loads the script if window config not set', () => {
            new RemoteConfigLoader(agrid).load()

            expect(assignableWindow.__PosthogExtensions__.loadExternalDependency).toHaveBeenCalledWith(
                agrid,
                'remote-config',
                expect.any(Function)
            )
            expect(agrid._send_request).not.toHaveBeenCalled()
            expect(agrid._onRemoteConfig).toHaveBeenCalledWith(config)
        })

        it('loads the json if window config not set and js failed', () => {
            assignableWindow.__PosthogExtensions__.loadExternalDependency = jest.fn(
                (_ph: Agrid, _name: string, cb: (err?: any) => void) => {
                    cb()
                }
            )

            new RemoteConfigLoader(agrid).load()

            expect(assignableWindow.__PosthogExtensions__.loadExternalDependency).toHaveBeenCalled()
            expect(agrid._send_request).toHaveBeenCalledWith({
                method: 'GET',
                url: 'https://test.com/array/testtoken/config',
                callback: expect.any(Function),
            })
            expect(agrid._onRemoteConfig).toHaveBeenCalledWith(config)
        })

        it.each([
            [true, true],
            [false, false],
            [undefined, true],
        ])('conditionally reloads feature flags - hasFlags: %s, shouldReload: %s', (hasFeatureFlags, shouldReload) => {
            assignableWindow._AGRID_REMOTE_CONFIG = {
                [agrid.config.token]: {
                    config: { ...config, hasFeatureFlags },
                    siteApps: [],
                },
            }

            new RemoteConfigLoader(agrid).load()

            if (shouldReload) {
                expect(agrid.featureFlags.ensureFlagsLoaded).toHaveBeenCalled()
            } else {
                expect(agrid.featureFlags.ensureFlagsLoaded).not.toHaveBeenCalled()
            }
        })
    })
})
