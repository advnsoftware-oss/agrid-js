import { RequestRouter, RequestRouterTarget } from '../../utils/request-router'

describe('request-router', () => {
    const router = (api_host = 'https://app.agrid.com', ui_host?: string) => {
        return new RequestRouter({
            config: {
                api_host,
                ui_host,
            },
        } as any)
    }

    const testCases: [string, RequestRouterTarget, string][] = [
        // US domain
        ['https://app.agrid.com', 'ui', 'https://us.agrid.com'],
        ['https://app.agrid.com', 'assets', 'https://us-assets.i.agrid.com'],
        ['https://app.agrid.com', 'api', 'https://us.i.agrid.com'],
        // US domain via app domain
        ['https://us.agrid.com', 'ui', 'https://us.agrid.com'],
        ['https://us.agrid.com', 'assets', 'https://us-assets.i.agrid.com'],
        ['https://us.agrid.com', 'api', 'https://us.i.agrid.com'],
        ['https://us.i.agrid.com', 'api', 'https://us.i.agrid.com'],
        ['https://us.i.agrid.com', 'assets', 'https://us-assets.i.agrid.com'],
        ['https://us-assets.i.agrid.com', 'assets', 'https://us-assets.i.agrid.com'],
        ['https://us-assets.i.agrid.com', 'api', 'https://us.i.agrid.com'],

        // EU domain
        ['https://eu.agrid.com', 'ui', 'https://eu.agrid.com'],
        ['https://eu.i.agrid.com', 'ui', 'https://eu.agrid.com'],
        ['https://eu.agrid.com', 'assets', 'https://eu-assets.i.agrid.com'],
        ['https://eu.agrid.com', 'api', 'https://eu.i.agrid.com'],
        ['https://eu.i.agrid.com', 'api', 'https://eu.i.agrid.com'],
        ['https://eu.i.agrid.com', 'assets', 'https://eu-assets.i.agrid.com'],
        ['https://eu-assets.i.agrid.com', 'assets', 'https://eu-assets.i.agrid.com'],
        ['https://eu-assets.i.agrid.com', 'api', 'https://eu.i.agrid.com'],

        // custom domain
        ['https://my-custom-domain.com', 'ui', 'https://my-custom-domain.com'],
        ['https://my-custom-domain.com', 'assets', 'https://my-custom-domain.com'],
        ['https://my-custom-domain.com', 'api', 'https://my-custom-domain.com'],
    ]

    it.each(testCases)(
        'should create the appropriate endpoints for host %s and target %s',
        (host, target, expectation) => {
            expect(router(host).endpointFor(target)).toEqual(expectation)
        }
    )

    it.each([
        ['https://app.agrid.com/', 'https://us.i.agrid.com/'],
        // adds trailing slash
        ['https://app.agrid.com', 'https://us.i.agrid.com/'],
        // accepts the empty string
        ['', '/'],
        // ignores whitespace string
        ['     ', '/'],
        ['  https://app.agrid.com       ', 'https://us.i.agrid.com/'],
        ['https://example.com/', 'https://example.com/'],
    ])('should sanitize the api_host values for "%s"', (apiHost, expected) => {
        expect(router(apiHost).endpointFor('api', '/flags?v=2&config=true')).toEqual(`${expected}flags?v=2&config=true`)
    })

    it('should use the ui_host if provided', () => {
        expect(router('https://my.domain.com/', 'https://eu.agrid.com/').endpointFor('ui')).toEqual(
            'https://eu.agrid.com'
        )

        expect(router('https://my.domain.com/', 'https://app.agrid.com/').endpointFor('ui')).toEqual(
            'https://us.agrid.com'
        )
    })

    it('should react to config changes', () => {
        const mockAgrid = { config: { api_host: 'https://app.agrid.com' } }

        const router = new RequestRouter(mockAgrid as any)
        expect(router.endpointFor('api')).toEqual('https://us.i.agrid.com')

        mockAgrid.config.api_host = 'https://eu.agrid.com'
        expect(router.endpointFor('api')).toEqual('https://eu.i.agrid.com')
    })

    describe('flags_api_host configuration', () => {
        it('should use flags_api_host when set', () => {
            const mockAgrid = {
                config: {
                    api_host: 'https://app.agrid.com',
                    flags_api_host: 'https://example.com/feature-flags',
                },
            }
            const router = new RequestRouter(mockAgrid as any)

            expect(router.endpointFor('flags', '/flags/?v=2')).toEqual('https://example.com/feature-flags/flags/?v=2')
        })

        it('should fall back to api_host when flags_api_host is not set', () => {
            const mockAgrid = {
                config: {
                    api_host: 'https://app.agrid.com',
                },
            }
            const router = new RequestRouter(mockAgrid as any)

            expect(router.endpointFor('flags', '/flags/?v=2')).toEqual('https://us.i.agrid.com/flags/?v=2')
        })

        it('should trim trailing slashes from flags_api_host', () => {
            const mockAgrid = {
                config: {
                    api_host: 'https://app.agrid.com',
                    flags_api_host: 'https://flags.example.com/',
                },
            }
            const router = new RequestRouter(mockAgrid as any)

            expect(router.endpointFor('flags', '/flags/?v=2')).toEqual('https://flags.example.com/flags/?v=2')
        })

        it('should react to flags_api_host config changes', () => {
            const mockAgrid = {
                config: {
                    api_host: 'https://app.agrid.com',
                    flags_api_host: 'https://flags1.example.com',
                },
            }
            const router = new RequestRouter(mockAgrid as any)

            expect(router.endpointFor('flags', '/flags/?v=2')).toEqual('https://flags1.example.com/flags/?v=2')

            mockAgrid.config.flags_api_host = 'https://flags2.example.com'
            expect(router.endpointFor('flags', '/flags/?v=2')).toEqual('https://flags2.example.com/flags/?v=2')
        })

        it('should use flags_api_host even when api_host is a custom domain', () => {
            const mockAgrid = {
                config: {
                    api_host: 'https://my-proxy.com',
                    flags_api_host: 'https://flags.example.com',
                },
            }
            const router = new RequestRouter(mockAgrid as any)

            expect(router.endpointFor('flags', '/flags/?v=2')).toEqual('https://flags.example.com/flags/?v=2')
        })
    })
})
