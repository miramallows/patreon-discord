# patreon-discord
a patreon api v2 wrapper that helps you grab your patrons' data easily without hassle.

patreon's api documentation can be found [here](https://docs.patreon.com/). do not be confused with other sections, only the "APIv2" sections.

don't think anyone will use this, but the patreon integration is pretty messy and isn't made discord integrations. this package is ideal for you to easily fix discrepancies between roles and pledges, that may occur due to declined payments, or for you to add external perks. c:

### example usage
```js
const { Campaign } = require('patreon-discord')

const myCampaign = new Campaign({ 
    patreonToken: process.env.patreon_token,
    campaignId: process.env.campaign_id
})

myCampaign.fetchPatrons(['active_patron', 'declined_patron'])
    .then(patrons => { 
        // do something
    })

myCampaign.fetchPatron('abcd-149328432-adsfdanca')
    .then(patron => { 
        // do something
    })
```

### reference
`Campaign` class
- takes two mandatory parameters, `patreonToken` and `campaignId`

> your patreon token can be found at the [Developer Portal](https://www.patreon.com/portal/registration/register-clients), called "Creator Access Token".

`campaign.fetchPatrons(patronStatusFilter[]<optional>)` method
- takes one optional argument in an array format. you can input filters to choose what statuses of patrons' you'd like to receive. accepts 4 different options: `active_patron`, `declined_patron`, `former_patron` and `null`. null is possible according to Patreon's documentation and in my experience - this is if the user has never even pledged.
- returns an array of `patron` object.

`campaign.fetchPatron(pledgeId)` method
- inputs an id of a pledge
- returns a `patron` object.


`patron` object

provides all of the Member attributes - for detailed information on what each of these are, go to [Patreon's documentation on "Member"](https://docs.patreon.com/#member).
- `campaign_lifetime_support_cents` number
- `campaign_entitled_amount_cents` number
- `email` string
- `full_name` string
- `is_follower` boolean
- `last_charge_date` string (in utc iso format)
- `last_charge_status` string
- `lifetime_support_cents` number
- `next_charge_date` string (in utc iso format)
- `note` string
- `patron_status` string
- `pledge_cadence` number
- `pledge_relationship_start` string (in utc iso format)
- `will_pay_amount_cents` integer
  
as well as some mandatory information:
- `pledge_id` - this is the id of the pledge. this is also the ID you need to provide in `Campaign.fetchPatron(pledgeId)` if you want to fetch a specific patron.
- `patron_id` - this is the user/creator ID. the profile of the user can always be found via `https://www.patreon.com/user/creators?u=PATRON_ID_HERE`
- `discord_user_id` - can be null, if they have not linked their discord yet. this is the user id of their discord integration.
- `currently_entitled_tier_id` this is the pledge's tier id. this allows you to figure out what tier the user is pledged to.
  

- `social_connections` an object of their social connections. this is from the user scope from Patreon's docs.

### good luck on your integration :)