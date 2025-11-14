import { Agrid } from '../agrid-core'
import { assignableWindow } from '../utils/globals'
import { createLogger } from '../utils/logger'

const logger = createLogger('[Agrid Crisp Chat]')

const reportedSessionIds = new Set<string>()
let sessionIdListenerUnsubscribe: undefined | (() => void) = undefined

assignableWindow.__AgridExtensions__ = assignableWindow.__AgridExtensions__ || {}
assignableWindow.__AgridExtensions__.integrations = assignableWindow.__AgridExtensions__.integrations || {}
assignableWindow.__AgridExtensions__.integrations.crispChat = {
    start: (agrid: Agrid) => {
        if (!agrid.config.integrations?.crispChat) {
            return
        }

        const crispChat = (assignableWindow as any).$crisp
        if (!crispChat) {
            logger.warn('Crisp Chat not found while initializing the integration')
            return
        }

        const updateCrispChat = () => {
            const replayUrl = agrid.get_session_replay_url()
            const personUrl = agrid.requestRouter.endpointFor(
                'ui',
                `/project/${agrid.config.token}/person/${agrid.get_distinct_id()}`
            )

            crispChat.push([
                'set',
                'session:data',
                [
                    [
                        ['agridSessionURL', replayUrl],
                        ['agridPersonURL', personUrl],
                    ],
                ],
            ])
        }

        // this is called immediately if there's a session id
        // and then again whenever the session id changes
        sessionIdListenerUnsubscribe = agrid.onSessionId((sessionId) => {
            if (!reportedSessionIds.has(sessionId)) {
                updateCrispChat()
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
