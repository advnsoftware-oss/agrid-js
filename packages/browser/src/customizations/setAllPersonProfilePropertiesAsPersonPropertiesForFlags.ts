import { Agrid } from '../agrid-core'
import {
    CAMPAIGN_PARAMS,
    getCampaignParams,
    EVENT_TO_PERSON_PROPERTIES,
    getEventProperties,
    getReferrerInfo,
} from '../utils/event-utils'
import { each, extend } from '../utils'
import { includes } from '@agrid/core'

export const setAllPersonProfilePropertiesAsPersonPropertiesForFlags = (agrid: Agrid): void => {
    const allProperties = extend(
        {},
        getEventProperties(
            agrid.config.mask_personal_data_properties,
            agrid.config.custom_personal_data_properties
        ),
        getCampaignParams(
            agrid.config.custom_campaign_params,
            agrid.config.mask_personal_data_properties,
            agrid.config.custom_personal_data_properties
        ),
        getReferrerInfo()
    )
    const personProperties: Record<string, string> = {}
    each(allProperties, function (v, k: string) {
        if (includes(CAMPAIGN_PARAMS, k) || includes(EVENT_TO_PERSON_PROPERTIES, k)) {
            personProperties[k] = v
        }
    })

    agrid.setPersonPropertiesForFlags(personProperties)
}
