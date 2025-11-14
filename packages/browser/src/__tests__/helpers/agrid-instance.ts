// The library depends on having the module initialized before it can be used.

import { Agrid, init_as_module } from '../../agrid-core'
import { AgridConfig } from '../../types'
import { assignableWindow } from '../../utils/globals'
import { uuidv7 } from '../../uuidv7'

export const createPosthogInstance = async (
    token: string = uuidv7(),
    config: Partial<AgridConfig> = {}
): Promise<Agrid> => {
    // We need to create a new instance of the library for each test, to ensure
    // that they are isolated from each other. The way the library is currently
    // written, we first create an instance, then call init on it which then
    // creates another instance.
    const agrid = new Agrid()

    // NOTE: Temporary change whilst testing remote config
    assignableWindow._AGRID_REMOTE_CONFIG = {
        [token]: {
            config: {},
            siteApps: [],
        },
    } as any

    // eslint-disable-next-line compat/compat
    return await new Promise<Agrid>((resolve) =>
        agrid.init(
            // Use a random UUID for the token, such that we don't have to worry
            // about collisions between test cases.
            token,
            {
                request_batching: false,
                api_host: 'http://localhost',
                disable_surveys: true,
                disable_surveys_automatic_display: false,
                ...config,
                loaded: (p) => {
                    config.loaded?.(p)

                    resolve(p)
                },
            },
            'test-' + token
        )
    )
}

const agrid = init_as_module()
export const defaultAgrid = (): Agrid => {
    return agrid
}
