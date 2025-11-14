import { generateSurveys } from '../extensions/surveys'

import { assignableWindow } from '../utils/globals'

assignableWindow.__AgridExtensions__ = assignableWindow.__AgridExtensions__ || {}
assignableWindow.__AgridExtensions__.generateSurveys = generateSurveys

// this used to be directly on window, but we moved it to __AgridExtensions__
// it is still on window for backwards compatibility
assignableWindow.extendAgridWithSurveys = generateSurveys

export default generateSurveys
