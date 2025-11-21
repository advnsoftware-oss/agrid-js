import { Platform } from 'react-native'

import type AgridReactNativeSessionReplay from 'posthog-react-native-session-replay'

export let OptionalReactNativeSessionReplay: typeof AgridReactNativeSessionReplay | undefined = undefined

try {
  OptionalReactNativeSessionReplay = Platform.select({
    macos: undefined,
    web: undefined,
    default: require('posthog-react-native-session-replay'), // Only Android and iOS
  })
} catch (e) {}
