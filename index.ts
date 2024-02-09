import { AllPatronsPledges, AllPatronsSocials, Options, Patron, PatronStatus } from './types'

const POSSIBLE_PATRON_STATUSES = ["active_patron", "declined_patron", "former_patron", null]

export class Campaign {
    public campaignId: string
    public accessToken: string
    constructor(options: Options) {
        if (!options.campaignId) {
            throw new Error('You must provide a campaignId')
        }
        if (!options.accessToken) {
            throw new Error('You must provide an accessToken')
        }
        this.campaignId = options.campaignId
        this.accessToken = options.accessToken
    }

    private async scrapeData(): Promise<{ allPatronsPledges: AllPatronsPledges[], allPatronsSocials: AllPatronsSocials[] }> {

        let allPatronsPledges: AllPatronsPledges[] = []
        let allPatronsSocials: AllPatronsSocials[] = []

        let nextLink = `https://www.patreon.com/api/oauth2/v2/campaigns/${this.campaignId}/members?include=user,currently_entitled_tiers&fields%5Bmember%5D=campaign_lifetime_support_cents,currently_entitled_amount_cents,email,full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,next_charge_date,note,patron_status,pledge_cadence,pledge_relationship_start,will_pay_amount_cents&fields%5Buser%5D=social_connections`
        let fetchResponse;
        try {
            while (nextLink) {
                fetchResponse = await (
                    await fetch(nextLink, {
                        method: 'GET',
                        headers: { Authorization: 'Bearer ' + this.accessToken }
                    })
                        .catch((err: Error) => console.error(err))
                )
                if (!fetchResponse) {
                    throw new Error('Fetch failed');
                }
                const data = await fetchResponse.json() as { data: AllPatronsPledges[], included: AllPatronsSocials[], links: { next: string } }
                nextLink = data?.links?.next

                allPatronsPledges = [...allPatronsPledges, ...data.data]
                allPatronsSocials = [...allPatronsSocials, ...data.included]
            }
            return { allPatronsPledges, allPatronsSocials }
        } catch (err) {
            console.error(err);
            throw new Error('Fetch failed');
        }

    }

    private async formatPatron(pledge: AllPatronsPledges, socials: AllPatronsSocials[]): Promise<Patron> {
        const patronId = pledge.relationships.user.data.id
        const socialConnections = socials.find(user => user.id === patronId)?.attributes?.social_connections
        const discordUserId = socialConnections?.discord?.user_id
        return {
            ...pledge.attributes,
            pledge_id: pledge.id,
            patron_id: patronId,
            discord_user_id: discordUserId,
            currently_entitled_tier_id: pledge?.relationships?.currently_entitled_tiers?.data[0]?.id,
            social_connections: socialConnections
        }
    }

    private async sortData(pledges: AllPatronsPledges[], socials: AllPatronsSocials[], patronStatusFilter: PatronStatus[] | null): Promise<Patron[]> {

        pledges = pledges.filter(p => (patronStatusFilter || POSSIBLE_PATRON_STATUSES).includes(p.attributes.patron_status))

        const patrons: Patron[] = []
        for (const pledge of pledges) {
            patrons.push(await this.formatPatron(pledge, socials))
        }

        return patrons;
    }

    async fetchPatrons(patronStatusFilter: PatronStatus[] | null): Promise<Patron[]> {

        const { allPatronsPledges: pledges, allPatronsSocials: socials } = await this.scrapeData();
        const patrons = await this.sortData(pledges, socials, patronStatusFilter)
        return patrons;
    }

    async fetchPatron(patronId: string): Promise<Patron> {
        const url = `https://www.patreon.com/api/oauth2/v2/members/${patronId}?include=user,currently_entitled_tiers&fields%5Bmember%5D=campaign_lifetime_support_cents,currently_entitled_amount_cents,email,full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,next_charge_date,note,patron_status,pledge_cadence,pledge_relationship_start,will_pay_amount_cents&fields%5Buser%5D=social_connections`

        let fetchResponse;
        try {
            fetchResponse = await (
                await fetch(url, {
                    method: 'GET',
                    headers: { Authorization: 'Bearer ' + this.accessToken }
                })
                    .catch((err: Error) => console.error(err))
            )
            if (!fetchResponse) {
                throw new Error('Fetch failed');
            }
            const response = await fetchResponse.json() as { data: AllPatronsPledges, included: AllPatronsSocials[] }
            const pledge = response.data;
            const socials = response.included;
            return this.formatPatron(pledge, socials);
        } catch (err) {
            console.error(err);
            throw new Error('Fetch failed');
        }
    }
}