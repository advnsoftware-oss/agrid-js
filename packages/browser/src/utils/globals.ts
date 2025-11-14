import type { Agrid } from '../agrid-core'
import { SessionIdManager } from '../sessionid'
import {
    DeadClicksAutoCaptureConfig,
    ExternalIntegrationKind,
    Properties,
    RemoteConfig,
    SiteAppLoader,
    SessionStartReason,
} from '../types'
// only importing types here, so won't affect the bundle
// eslint-disable-next-line agrid-js/no-external-replay-imports
import type { SessionRecordingStatus, TriggerType } from '../extensions/replay/external/triggerMatching'
import { eventWithTime } from '../extensions/replay/types/rrweb-types'
import { ErrorTracking } from '@agrid/core'

/*
 * Global helpers to protect access to browser globals in a way that is safer for different targets
 * like DOM, SSR, Web workers etc.
 *
 * NOTE: Typically we want the "window" but globalThis works for both the typical browser context as
 * well as other contexts such as the web worker context. Window is still exported for any bits that explicitly require it.
 * If in doubt - export the global you need from this file and use that as an optional value. This way the code path is forced
 * to handle the case where the global is not available.
 */

// eslint-disable-next-line no-restricted-globals
const win: (Window & typeof globalThis) | undefined = typeof window !== 'undefined' ? window : undefined

export type AssignableWindow = Window &
    typeof globalThis & {
        /*
         * Main Agrid instance
         */
        agrid: any

        /*
         * This is our contract between (potentially) lazily loaded extensions and the SDK
         */
        __AgridExtensions__?: AgridExtensions

        /**
         * When loading remote config, we assign it to this global configuration
         * for ease of sharing it with the rest of the SDK
         */
        _AGRID_REMOTE_CONFIG?: Record<
            string,
            {
                config: RemoteConfig
                siteApps: SiteAppLoader[]
            }
        >

        /**
         * If this is set on the window, our logger will log to the console
         * for ease of debugging. Used for testing purposes only.
         *
         * @see {Config.DEBUG} from config.ts
         */
        AGRID_DEBUG: any

        // Exposed by the browser
        doNotTrack: any

        // See entrypoints/customizations.full.ts
        agridCustomizations: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/exception-autocapture.ts
         *
         * @deprecated use `__AgridExtensions__.errorWrappingFunctions` instead
         */
        agridErrorWrappingFunctions: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/agrid-recorder.ts
         *
         * @deprecated use `__AgridExtensions__.rrweb` instead
         */
        rrweb: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/agrid-recorder.ts
         *
         * @deprecated use `__AgridExtensions__.rrwebConsoleRecord` instead
         */
        rrwebConsoleRecord: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/agrid-recorder.ts
         *
         * @deprecated use `__AgridExtensions__.getRecordNetworkPlugin` instead
         */
        getRecordNetworkPlugin: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/web-vitals.ts
         *
         * @deprecated use `__AgridExtensions__.postHogWebVitalsCallbacks` instead
         */
        postHogWebVitalsCallbacks: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/tracing-headers.ts
         *
         * @deprecated use `__AgridExtensions__.postHogTracingHeadersPatchFns` instead
         */
        postHogTracingHeadersPatchFns: any

        /**
         * This is a legacy way to expose these functions, but we still need to support it for backwards compatibility
         * Can be removed once we drop support for 1.161.1
         *
         * See entrypoints/surveys.ts
         *
         * @deprecated use `__AgridExtensions__.generateSurveys` instead
         */
        extendAgridWithSurveys: any

        /*
         * These are used to handle our toolbar state.
         * @see {Toolbar} from extensions/toolbar.ts
         */
        ph_load_toolbar: any
        ph_load_editor: any
        ph_toolbar_state: any
    } & Record<`__$$ph_site_app_${string}`, any>

/**
 * This is our contract between (potentially) lazily loaded extensions and the SDK
 * changes to this interface can be breaking changes for users of the SDK
 */

export type ExternalExtensionKind = 'intercom-integration' | 'crisp-chat-integration'

export type AgridExtensionKind =
    | 'toolbar'
    | 'exception-autocapture'
    | 'web-vitals'
    | 'recorder'
    | 'lazy-recorder'
    | 'tracing-headers'
    | 'surveys'
    | 'dead-clicks-autocapture'
    | 'remote-config'
    | ExternalExtensionKind

export interface LazyLoadedSessionRecordingInterface {
    start: (startReason?: SessionStartReason) => void
    stop: () => void
    sessionId: string
    status: SessionRecordingStatus
    onRRwebEmit: (rawEvent: eventWithTime) => void
    log: (message: string, level: 'log' | 'warn' | 'error') => void
    sdkDebugProperties: Properties
    overrideLinkedFlag: () => void
    overrideSampling: () => void
    overrideTrigger: (triggerType: TriggerType) => void
    isStarted: boolean
    tryAddCustomEvent(tag: string, payload: any): boolean
}

export interface LazyLoadedDeadClicksAutocaptureInterface {
    start: (observerTarget: Node) => void
    stop: () => void
}

interface AgridExtensions {
    loadExternalDependency?: (
        agrid: Agrid,
        kind: AgridExtensionKind,
        callback: (error?: string | Event, event?: Event) => void
    ) => void

    loadSiteApp?: (agrid: Agrid, appUrl: string, callback: (error?: string | Event, event?: Event) => void) => void

    errorWrappingFunctions?: {
        wrapOnError: (captureFn: (props: ErrorTracking.ErrorProperties) => void) => () => void
        wrapUnhandledRejection: (captureFn: (props: ErrorTracking.ErrorProperties) => void) => () => void
        wrapConsoleError: (captureFn: (props: ErrorTracking.ErrorProperties) => void) => () => void
    }
    rrweb?: { record: any; version: string }
    rrwebPlugins?: { getRecordConsolePlugin: any; getRecordNetworkPlugin?: any }
    generateSurveys?: (agrid: Agrid, isSurveysEnabled: boolean) => any | undefined
    postHogWebVitalsCallbacks?: {
        onLCP: (metric: any) => void
        onCLS: (metric: any) => void
        onFCP: (metric: any) => void
        onINP: (metric: any) => void
    }
    tracingHeadersPatchFns?: {
        _patchFetch: (hostnames: string[], distinctId: string, sessionManager?: SessionIdManager) => () => void
        _patchXHR: (hostnames: string[], distinctId: string, sessionManager?: SessionIdManager) => () => void
    }
    initDeadClicksAutocapture?: (
        ph: Agrid,
        config: DeadClicksAutoCaptureConfig
    ) => LazyLoadedDeadClicksAutocaptureInterface
    integrations?: {
        [K in ExternalIntegrationKind]?: { start: (agrid: Agrid) => void; stop: () => void }
    }
    initSessionRecording?: (ph: Agrid) => LazyLoadedSessionRecordingInterface
}

const global: typeof globalThis | undefined = typeof globalThis !== 'undefined' ? globalThis : win

export const ArrayProto = Array.prototype
export const nativeForEach = ArrayProto.forEach
export const nativeIndexOf = ArrayProto.indexOf

export const navigator = global?.navigator
export const document = global?.document
export const location = global?.location
export const fetch = global?.fetch
export const XMLHttpRequest =
    global?.XMLHttpRequest && 'withCredentials' in new global.XMLHttpRequest() ? global.XMLHttpRequest : undefined
export const AbortController = global?.AbortController
export const userAgent = navigator?.userAgent
export const assignableWindow: AssignableWindow = win ?? ({} as any)

export { win as window }
