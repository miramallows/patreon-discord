const fetch = require('node-fetch')

const POSSIBLE_PATRON_STATUSES = [ "active_patron", "declined_patron", "former_patron", null ]

class Campaign {

    constructor({
                    patreonToken,
                    campaignId
                })
    {

        if ( !patreonToken ) return console.error("Missing Patreon Token in Campaign constructor")
        if ( !campaignId ) return console.error("Missing campaign ID in Campaign constructor")
        this.patreonToken = patreonToken
        this.campaignId = campaignId
    }

    async _scrapeData () {

        let allPatronsPledges = [], allPatronsSocials = []

        console.log(this.campaignId)
        let nextLink = `https://www.patreon.com/api/oauth2/v2/campaigns/${this.campaignId}/members?include=user,currently_entitled_tiers&fields%5Bmember%5D=campaign_lifetime_support_cents,currently_entitled_amount_cents,email,full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,next_charge_date,note,patron_status,pledge_cadence,pledge_relationship_start,will_pay_amount_cents&fields%5Buser%5D=social_connections`

        while (nextLink) {
            const response = await (
                await fetch(nextLink, {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.patreonToken }
            })
                    .catch(err => console.error(err))
            )
                .json()

            if(response.errors) return console.error(response.errors)

            nextLink = response?.links?.next

            allPatronsPledges = [ ...allPatronsPledges, ... response.data]
            allPatronsSocials = [ ...allPatronsSocials, ... response.included ]
        }

        return { allPatronsPledges, allPatronsSocials }
    }

    _formatPatron (pledge, socials) {
        const patronId = pledge.relationships.user.data.id
        const socialConnections = socials.find(user => user.id === patronId)?.attributes?.social_connections
        const discordUserId = socialConnections?.discord?.user_id
        return {
            ... pledge.attributes,
            pledge_id: pledge.id,
            patron_id: patronId,
            discord_user_id: discordUserId,
            currently_entitled_tier_id: pledge?.relationships?.currently_entitled_tiers?.data[0]?.id,
            social_connections: socialConnections
        }
    }
    async _sortData (pledges, socials, patronStatusFilter){

        pledges = pledges.filter(p => (patronStatusFilter || POSSIBLE_PATRON_STATUSES).includes(p.attributes.patron_status))

        const patrons = [];
        for ( const pledge of pledges ) {
            patrons.push(this._formatPatron(pledge, socials))
        }

        return patrons;
    }
    /**
     *
     * @param patronStatusFilter
     */
    async fetchPatrons (patronStatusFilter) {

        const { allPatronsPledges: pledges, allPatronsSocials: socials } = await this._scrapeData();
        const patrons = await this._sortData(pledges, socials, patronStatusFilter)
        return patrons;

    }

    async fetchPatron (pledgeId) {

        const url = `https://www.patreon.com/api/oauth2/v2/members/${pledgeId}?include=user,currently_entitled_tiers&fields%5Bmember%5D=campaign_lifetime_support_cents,currently_entitled_amount_cents,email,full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,next_charge_date,note,patron_status,pledge_cadence,pledge_relationship_start,will_pay_amount_cents&fields%5Buser%5D=social_connections`

        const response = await (
            await fetch(url, {
                method: 'GET',
                headers: { Authorization: 'Bearer ' + this.patreonToken }
            })
                .catch(err => console.error(err))
        )
            .json()

        if(response.errors) return console.error(response.errors)

        const pledge = response.data;
        const socials = response.included;

        return this._formatPatron(pledge, socials);

    }

}
module.exports = Campaign