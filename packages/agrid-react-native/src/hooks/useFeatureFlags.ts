import { useEffect, useState } from 'react'
import type { Agrid } from '../agrid-rn'
import { PostHogFlagsResponse } from '@agrid/core'
import { useAgrid } from './useAgrid'

export function useFeatureFlags(client?: Agrid): PostHogFlagsResponse['featureFlags'] | undefined {
  const contextClient = useAgrid()
  const agrid = client || contextClient
  const [featureFlags, setFeatureFlags] = useState<PostHogFlagsResponse['featureFlags'] | undefined>(
    agrid.getFeatureFlags()
  )

  useEffect(() => {
    setFeatureFlags(agrid.getFeatureFlags())
    return agrid.onFeatureFlags((flags) => {
      setFeatureFlags(flags)
    })
  }, [agrid])

  return featureFlags
}
