declare class Campaign {
    constructor(options: Options)
}

export default Campaign
export type Options = {
    campaignId: string
    accessToken: string
}

export type AllPatronsPledges = {
    id: string
    type: string
    attributes: {
        campaign_lifetime_support_cents: number
        currently_entitled_amount_cents: number
        email: string
        full_name: string
        is_follower: boolean
        last_charge_date: string
        last_charge_status: string
        lifetime_support_cents: number
        discord_user_id: string | undefined
        next_charge_date: string
        note: string
        patron_status: PatronStatus
        pledge_cadence: string
        pledge_relationship_start: string
        will_pay_amount_cents: number
    }
    relationships: {
        currently_entitled_tiers: {
            data: {
                id: string
                type: string
            }[]
        }
        user: {
            data: {
                id: string
                type: string
            }
        }
    }
}

export type AllPatronsSocials = {
    id: string
    type: string
    attributes: {
        social_connections: {
            deviantart: string
            discord: {
                user_id: string
            }
            facebook: string
            spotify: string
            twitch: string
            twitter: string
            youtube: string
        } | undefined
    }
}



export type Patron = {
    campaign_lifetime_support_cents: number
    currently_entitled_amount_cents: number
    email: string
    full_name: string
    is_follower: boolean
    last_charge_date: string
    last_charge_status: string
    lifetime_support_cents: number
    next_charge_date: string
    note: string
    patron_status: PatronStatus
    pledge_cadence: string
    pledge_relationship_start: string
    will_pay_amount_cents: number
    pledge_id: string
    patron_id: string
    discord_user_id: string | undefined
    currently_entitled_tier_id: string
    social_connections: {
        deviantart: string
        discord: {
            user_id: string
        }
        facebook: string
        spotify: string
        twitch: string
        twitter: string
        youtube: string
    } | undefined
}


export enum PatronStatus {
    active = "active_patron",
    declined = "declined_patron",
    former = "former_patron"
}