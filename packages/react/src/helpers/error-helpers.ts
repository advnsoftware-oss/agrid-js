import type { ErrorInfo } from 'react'
import { Agrid } from '../context'
import { CaptureResult } from 'agrid-js'

export const setupReactErrorHandler = (
    client: Agrid,
    callback?: (event: CaptureResult | undefined, error: any, errorInfo: ErrorInfo) => void
) => {
    return (error: any, errorInfo: ErrorInfo): void => {
        const event = client.captureException(error)
        if (callback) {
            callback(event, error, errorInfo)
        }
    }
}
