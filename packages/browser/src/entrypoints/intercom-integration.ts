import { Agrid } from '../agrid-core'
import { assignableWindow } from '../utils/globals'
import { createLogger } from '../utils/logger'

const logger = createLogger('[Agrid Intercom integration]')

const reportedSessionIds = new Set<string>()
let sessionIdListenerUnsubscribe: undefined | (() => void) = undefined

assignableWindow.__AgridExtensions__ = assignableWindow.__AgridExtensions__ || {}
assignableWindow.__AgridExtensions__.integrations = assignableWindow.__AgridExtensions__.integrations || {}
assignableWindow.__AgridExtensions__.integrations.intercom = {
    start: (agrid: Agrid) => {
        if (!agrid.config.integrations?.intercom) {
            return
        }

        const intercom = (assignableWindow as any).Intercom
        if (!intercom) {
            logger.warn('Intercom not found while initializing the integration')
            return
        }

        const updateIntercom = () => {
            const replayUrl = agrid.get_session_replay_url()
            const personUrl = agrid.requestRouter.endpointFor(
                'ui',
                `/project/${agrid.config.token}/person/${agrid.get_distinct_id()}`
            )

            intercom('update', {
                latestPosthogReplayURL: replayUrl,
                latestPosthogPersonURL: personUrl,
            })
            intercom('trackEvent', 'agrid:sessionInfo', { replayUrl, personUrl })
        }

        // this is called immediately if there's a session id
        // and then again whenever the session id changes
        sessionIdListenerUnsubscribe = agrid.onSessionId((sessionId) => {
            if (!reportedSessionIds.has(sessionId)) {
                updateIntercom()
                reportedSessionIds.add(sessionId)
            }
        })

        logger.info('integration started')
    },
    stop: () => {
        sessionIdListenerUnsubscribe?.()
        sessionIdListenerUnsubscribe = undefined
    },
}
