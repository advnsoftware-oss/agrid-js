import type { PostHogCoreOptions } from '@agrid/core'

export type PostHogOptions = {
  autocapture?: boolean
  persistence?: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory'
  persistence_name?: string
  captureHistoryEvents?: boolean
} & PostHogCoreOptions
