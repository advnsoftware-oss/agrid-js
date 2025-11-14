import { Agrid } from '../../agrid-core'
import { createLogger } from '../../utils/logger'

const logger = createLogger('[Stylesheet Loader]')

export const prepareStylesheet = (document: Document, innerText: string, agrid?: Agrid) => {
    // Forcing the existence of `document` requires this function to be called in a browser environment
    let stylesheet: HTMLStyleElement | null = document.createElement('style')
    stylesheet.innerText = innerText

    if (agrid?.config?.prepare_external_dependency_stylesheet) {
        stylesheet = agrid.config.prepare_external_dependency_stylesheet(stylesheet)
    }

    if (!stylesheet) {
        logger.error('prepare_external_dependency_stylesheet returned null')
        return null
    }

    return stylesheet
}
