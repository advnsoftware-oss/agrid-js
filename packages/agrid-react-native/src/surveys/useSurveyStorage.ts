import { PostHogPersistedProperty } from '@agrid/core'
import { useCallback, useEffect, useState } from 'react'
import { useAgrid } from '../hooks/useAgrid'

type SurveyStorage = {
  seenSurveys: string[]
  setSeenSurvey: (surveyId: string) => void
  lastSeenSurveyDate: Date | undefined
  setLastSeenSurveyDate: (date: Date) => void
}

export function useSurveyStorage(): SurveyStorage {
  const agridStorage = useAgrid()
  const [lastSeenSurveyDate, setLastSeenSurveyDate] = useState<Date | undefined>(undefined)
  const [seenSurveys, setSeenSurveys] = useState<string[]>([])

  useEffect(() => {
    agridStorage.ready().then(() => {
      const lastSeenSurveyDate = agridStorage.getPersistedProperty(PostHogPersistedProperty.SurveyLastSeenDate)
      if (typeof lastSeenSurveyDate === 'string') {
        setLastSeenSurveyDate(new Date(lastSeenSurveyDate))
      }

      const serialisedSeenSurveys = agridStorage.getPersistedProperty(PostHogPersistedProperty.SurveysSeen)
      if (typeof serialisedSeenSurveys === 'string') {
        const parsedSeenSurveys: unknown = JSON.parse(serialisedSeenSurveys)
        if (Array.isArray(parsedSeenSurveys) && typeof parsedSeenSurveys[0] === 'string') {
          setSeenSurveys(parsedSeenSurveys)
        }
      }
    })
  }, [agridStorage])

  return {
    seenSurveys,
    setSeenSurvey: useCallback(
      (surveyId: string) => {
        setSeenSurveys((current) => {
          // To keep storage bounded, only keep the last 20 seen surveys
          const newValue = [surveyId, ...current.filter((id) => id !== surveyId)]
          agridStorage.setPersistedProperty(
            PostHogPersistedProperty.SurveysSeen,
            JSON.stringify(newValue.slice(0, 20))
          )
          return newValue
        })
      },
      [agridStorage]
    ),
    lastSeenSurveyDate,
    setLastSeenSurveyDate: useCallback(
      (date: Date) => {
        setLastSeenSurveyDate(date)
        agridStorage.setPersistedProperty(PostHogPersistedProperty.SurveyLastSeenDate, date.toISOString())
      },
      [agridStorage]
    ),
  }
}
