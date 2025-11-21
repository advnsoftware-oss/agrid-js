import { useEffect, useState } from 'react'
import { useAgrid } from './useAgrid'
import { JsonType, FeatureFlagValue } from '@agrid/core'
import { Agrid } from '../agrid-rn'

export function useFeatureFlag(flag: string, client?: Agrid): FeatureFlagValue | undefined {
  const contextClient = useAgrid()
  const agrid = client || contextClient

  const [featureFlag, setFeatureFlag] = useState<FeatureFlagValue | undefined>(agrid.getFeatureFlag(flag))

  useEffect(() => {
    setFeatureFlag(agrid.getFeatureFlag(flag))
    return agrid.onFeatureFlags(() => {
      setFeatureFlag(agrid.getFeatureFlag(flag))
    })
  }, [agrid, flag])

  return featureFlag
}

export type FeatureFlagWithPayload = [FeatureFlagValue | undefined, JsonType | undefined]

export function useFeatureFlagWithPayload(flag: string, client?: Agrid): FeatureFlagWithPayload {
  const contextClient = useAgrid()
  const agrid = client || contextClient
  const [featureFlag, setFeatureFlag] = useState<FeatureFlagWithPayload>([undefined, undefined])

  useEffect(() => {
    setFeatureFlag([agrid.getFeatureFlag(flag), agrid.getFeatureFlagPayload(flag)])
    return agrid.onFeatureFlags(() => {
      setFeatureFlag([agrid.getFeatureFlag(flag), agrid.getFeatureFlagPayload(flag)])
    })
  }, [agrid, flag])

  return featureFlag
}
