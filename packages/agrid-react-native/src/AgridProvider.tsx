import React, { useCallback, useEffect, useMemo } from 'react'
import { GestureResponderEvent, StyleProp, View, ViewStyle } from 'react-native'
import { Agrid, AgridOptions } from './agrid-rn'
import { autocaptureFromTouchEvent } from './autocapture'
import { useNavigationTracker } from './hooks/useNavigationTracker'
import { AgridContext } from './AgridContext'
import { AgridAutocaptureOptions } from './types'
import { defaultAgridLabelProp } from './autocapture'

/**
 * Props for the AgridProvider component.
 *
 * @public
 */
export interface AgridProviderProps {
  /** The child components to render within the Agrid context */
  children: React.ReactNode
  /** Agrid configuration options */
  options?: AgridOptions
  /** Your Agrid API key */
  apiKey?: string
  /** An existing Agrid client instance */
  client?: Agrid
  /** Autocapture configuration - can be a boolean or detailed options */
  autocapture?: boolean | AgridAutocaptureOptions
  /** Enable debug mode for additional logging */
  debug?: boolean
  /** Custom styles for the provider wrapper View */
  style?: StyleProp<ViewStyle>
}

function AgridNavigationHook({
  options,
  client,
}: {
  options?: AgridAutocaptureOptions
  client?: Agrid
}): JSX.Element | null {
  useNavigationTracker(options?.navigation, options?.navigationRef, client)
  return null
}

/**
 * AgridProvider is a React component that provides Agrid functionality to your React Native app. You can find all configuration options in the [React Native SDK docs](https://agrid.com/docs/libraries/react-native#configuration-options).
 *
 * Autocapturing navigation requires further configuration. See the [React Native SDK navigation docs](https://agrid.com/docs/libraries/react-native#capturing-screen-views)
 * for more information about autocapturing navigation.
 *
 * This is the recommended way to set up Agrid for React Native. This utilizes the Context API to pass the Agrid client around, enable autocapture.
 *
 * {@label Initialization}
 *
 * @example
 * ```jsx
 * // Add to App.(js|ts)
 * import { useAgrid, AgridProvider } from 'agrid-react-native'
 *
 * export function MyApp() {
 *     return (
 *         <AgridProvider apiKey="<ph_project_api_key>" options={{
 *             host: '<ph_client_api_host>',
 *         }}>
 *             <MyComponent />
 *         </AgridProvider>
 *     )
 * }
 *
 * // And access the Agrid client via the useAgrid hook
 * import { useAgrid } from 'agrid-react-native'
 *
 * const MyComponent = () => {
 *     const agrid = useAgrid()
 *
 *     useEffect(() => {
 *         agrid.capture("event_name")
 *     }, [agrid])
 * }
 *
 * ```
 *
 * @example
 * ```jsx
 * // Using with existing client
 * import { Agrid } from 'agrid-react-native'
 *
 * const agrid = new Agrid('<ph_project_api_key>', {
 *     host: '<ph_client_api_host>'
 * })
 *
 * export function MyApp() {
 *     return (
 *         <AgridProvider client={agrid}>
 *             <MyComponent />
 *         </AgridProvider>
 *     )
 * }
 * ```
 *
 * @public
 *
 * @param props - The AgridProvider props
 */
export const AgridProvider = ({
  children,
  client,
  options,
  apiKey,
  autocapture,
  style,
  debug = false,
}: AgridProviderProps): JSX.Element | null => {
  if (!client && !apiKey) {
    throw new Error(
      'Either a Agrid client or an apiKey is required. If you want to use the AgridProvider without a client, please provide an apiKey and the options={ disabled: true }.'
    )
  }

  const captureAll = autocapture === true
  const captureNone = autocapture === false

  const agrid = useMemo(() => {
    if (client && apiKey) {
      console.warn(
        'You have provided both a client and an apiKey to AgridProvider. The apiKey will be ignored in favour of the client.'
      )
    }

    if (client) {
      return client
    }

    const parsedOptions = {
      ...options,
      captureAppLifecycleEvents:
        options?.captureAppLifecycleEvents !== undefined
          ? options.captureAppLifecycleEvents
          : !captureNone && captureAll,
    }

    return new Agrid(apiKey ?? '', parsedOptions)
  }, [client, apiKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const autocaptureOptions = useMemo(
    () => (autocapture && typeof autocapture !== 'boolean' ? autocapture : {}),
    [autocapture]
  )

  const captureTouches = !captureNone && agrid && (captureAll || autocaptureOptions?.captureTouches)
  const captureScreens = !captureNone && agrid && (captureAll || (autocaptureOptions?.captureScreens ?? true)) // Default to true if not set
  const phLabelProp = autocaptureOptions?.customLabelProp || defaultAgridLabelProp

  useEffect(() => {
    agrid.debug(debug)
  }, [debug, agrid])

  const onTouch = useCallback(
    (type: 'start' | 'move' | 'end', e: GestureResponderEvent) => {
      // TODO: Improve this to ensure we only capture presses and not just ends of a drag for example
      if (!captureTouches) {
        return
      }

      if (type === 'end') {
        autocaptureFromTouchEvent(e, agrid, autocaptureOptions)
      }
    },
    [captureTouches, agrid, autocaptureOptions]
  )

  return (
    <View
      {...{ [phLabelProp]: 'AgridProvider' }} // Dynamically setting customLabelProp (default: ph-label)
      style={style || { flex: 1 }}
      onTouchEndCapture={captureTouches ? (e) => onTouch('end', e) : undefined}
    >
      <AgridContext.Provider value={{ client: agrid }}>
        {captureScreens && <AgridNavigationHook options={autocaptureOptions} client={agrid} />}
        {children}
      </AgridContext.Provider>
    </View>
  )
}
