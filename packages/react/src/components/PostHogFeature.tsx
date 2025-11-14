import { useFeatureFlagPayload, useFeatureFlagVariantKey, useAgrid } from '../hooks'
import React from 'react'
import { Agrid } from '../context'
import { isFunction, isUndefined } from '../utils/type-utils'
import { VisibilityAndClickTrackers } from './internal/VisibilityAndClickTrackers'

export type PostHogFeatureProps = React.HTMLProps<HTMLDivElement> & {
    flag: string
    children: React.ReactNode | ((payload: any) => React.ReactNode)
    fallback?: React.ReactNode
    match?: string | boolean
    visibilityObserverOptions?: IntersectionObserverInit
    trackInteraction?: boolean
    trackView?: boolean
}

export function PostHogFeature({
    flag,
    match,
    children,
    fallback,
    visibilityObserverOptions,
    trackInteraction,
    trackView,
    ...props
}: PostHogFeatureProps): JSX.Element | null {
    const payload = useFeatureFlagPayload(flag)
    const variant = useFeatureFlagVariantKey(flag)
    const agrid = useAgrid()

    const shouldTrackInteraction = trackInteraction ?? true
    const shouldTrackView = trackView ?? true

    if (isUndefined(match) || variant === match) {
        const childNode: React.ReactNode = isFunction(children) ? children(payload) : children
        return (
            <VisibilityAndClickTrackers
                flag={flag}
                options={visibilityObserverOptions}
                trackInteraction={shouldTrackInteraction}
                trackView={shouldTrackView}
                onInteract={() => captureFeatureInteraction({ flag, agrid, flagVariant: variant })}
                onView={() => captureFeatureView({ flag, agrid, flagVariant: variant })}
                {...props}
            >
                {childNode}
            </VisibilityAndClickTrackers>
        )
    }
    return <>{fallback}</>
}

export function captureFeatureInteraction({
    flag,
    agrid,
    flagVariant,
}: {
    flag: string
    agrid: Agrid
    flagVariant?: string | boolean
}) {
    const properties: Record<string, any> = {
        feature_flag: flag,
        $set: { [`$feature_interaction/${flag}`]: flagVariant ?? true },
    }
    if (typeof flagVariant === 'string') {
        properties.feature_flag_variant = flagVariant
    }
    agrid.capture('$feature_interaction', properties)
}

export function captureFeatureView({
    flag,
    agrid,
    flagVariant,
}: {
    flag: string
    agrid: Agrid
    flagVariant?: string | boolean
}) {
    const properties: Record<string, any> = {
        feature_flag: flag,
        $set: { [`$feature_view/${flag}`]: flagVariant ?? true },
    }
    if (typeof flagVariant === 'string') {
        properties.feature_flag_variant = flagVariant
    }
    agrid.capture('$feature_view', properties)
}
