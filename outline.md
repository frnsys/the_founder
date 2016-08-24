various systems of The Founder and their main functionalities

some items are still marked as TODO and NEEDS TESTING


# Events
[ ] there are two types of events: news (articles) and emails
[ ] events that can happen are kept in a pool
[ ] events may have conditions before they can be triggered
[ ] events may have countdowns
[ ] events may be repeatable
[ ] emails may have actions that the player must choose from
[ ] an event may have a probability of occurring
[ ] at regular intervals, a random qualifying event is resolved
[ ] events that are skipped during this resolution are randomly scheduled to occur later

# Loading/saving
[ ] saving the game requires saving the player which should recursively save all necessary data for everything else (needs clarification)

# The Market
[ ] when a product launches, the number of products, their strength and movement speed are influenced by the product's stats against its difficult and main stat
[ ] the player places these products in their starting zone
[ ] the competitor does the same
[ ] the difficult of tile capture depends on opinion (this is only from the player's perspective; it can be easier or harder for a competitor to capture)
[ ] capturing influencers makes surrounding tiles easier to capture and harder for the competitor to capture
[ ] market tile income distribution is affected by economic stability
[ ] board size is determined by locations


---

# Perks
[X] are purchasable
[X] are upgradable
[X] have a minimum office level
[X] have company-wide effects
[X] have associated numeric stats, e.g. "cups of coffee produced", generated from a uniform distribution (range) that scales with number of employees

# Verticals
[X] are purchasable
[X] expand product types available for purchase

# Special Projects
[X] are purchasable
[X] have required discovered products (product recipes)
[X] have company-wide effects

# Lobbying
[X] are purchasable
[X] have company-wide effects

# Acquisitions
[X] are purchasable
[X] generates revenue
[X] have company-wide effects
[X] disables associated competitors

# Product Types
[X] are purchasable

# Research
[X] requires a particular vertical
[X] may require other techs
[X] are purchasable
[X] have company-wide effects

# Locations
[X] are purchasable
[X] have company-wide effects
[X] gives access to new markets
[X] cost rent, monthly
[X] contribute productivity and other skills to the company (like an employee; worker bonuses apply)

# Effects
[X] may affect world values
[X] may affect all workers (incl. locations)
[X] may have "special effects" (toggles)
[X] may unlock things
[X] may add events to the event pool
[X] may affect products

# Office
[X] upgradable (purchasable), to a limit
[X] affects max employees

# Board
[X] sets yearly profit target
[X] has happiness based on profit performance

# Employees
[X] have attributes which confer personal bonuses
[X] have a min salary affected by economic stability, wage multiplier, and attributes
[X] can get burnt out over time
[X] burnout times out over days
[X] only non-burnt out employees contribute skills to company development
[X] employees contribute skills to companies
[X] have attributes which confer company bonuses, that scale with # employees/locations
[X] employees gradually improve in their skills overtime
[X] happiness is affected by negative player stats, but counteracted by forgetting rate
[ ] TODO employees have a "last tweet" depending on their attributes, the available perks, their burnout rate, their happiness, etc, drawn uniformly from a collection of tweets that are relevant to their current state

# Promo Campaigns/Hype
[X] are purchasable (repeatedly)
[X] increase company hype
[X] take time to execute
[X] amount of hype produced depends on marketing skills
[X] hype fades over time
[X] hype is negatively affected by "outrage"
[X] "outrage" is mitigated by the "forgetting rate"
[X] "outrage" is computed from negative press events and accumulates over time from bad company variables like deaths caused, pollution etc

# Recruiting/Hiring
[X] workers are scored according to their aggregate skills
[X] the "Purchase Robots" strategy returns only robots (the others do not return any employees)
[X] strategies have a range of scores that they return workers of
[X] robots can be hired multiple times (they are hired as clones)
[X] employees may be poached by competitors
[X] hiring minigame
    [X] various dialog options which decrease acceptable min salary, increase it, or keep it the same
    [X] how a dialog option affects min salary depends on the candidate's personality
    [X] you can make an offer at any time, which they have a probability of accepting (based on their min salary, which changes by the interview)
    [X] you can make only one offer, otherwise they go off the market
    [X] social media perk tells you their personality types
    [X] negotiation options can include perk-based ones

# Company
[X] pays salaries, rent, and taxes
[X] taxes paid vary according to a tax rate variable

# Products
[X] are created by combining two product types
[X] some product types combinations correspond to "recipes"; others are failures; hereafter when a combo is spoken of it's assumed it's a successful one, i.e. one which has a recipe
[X] product combos have different names
[X] during development, the product's stats accumulate based on corresponding employee stats
[X] product development takes time depending on the product difficulty and employee productivity (it has product development points that must be fulfilled, generated by productivity)
[X] product combos may have effects (applied only the first time the combo is "discovered")
[X] when a product launches, it's stats determine the following, depending on product difficulty and the main feature:
    [X] strength of a product unit (engineering)
    [X] number of product units (marketing)
    [X] speed of product units (design)
[X] product combos have a primary feature (marketing, design, or engineering) which has a greater influence on the product's final stats
[X] after a product launches, a competitor launches a similar product, generated from their own stats, and you fight them in the market
[X] products then generate revenue per frame (staggered) based on success in The Market (market share of income tiles)
[X] products generate decaying revenue over time

# Time (ALL NEEDS TESTING)
[X] every frame-ish
    [X] update revenue
    [X] update product development
    [X] update promo development
    [X] harvest revenue
    [X] decay hype
    [X] burnout employees
    [X] grow employees
[X] weekly
    [X] update object stats
    [X] resolve events
    [X] update off market times
[X] monthly
    [X] pay rent
    [X] pay salaries
    [X] change economy
[X] yearly
    [X] pay taxes
    [X] check death
    [X] check gameover

# Death/Game Over
[X] at a certain year, the player dies (unless the Immortal special effect is on) NEEDS TESTING
[X] when/if the player dies, their son inherits the company and play continues NEEDS TESTING
[X] if the board forces you to resign, you "lose" the game, but a new game plus option is available where you start a new company with your buyout from the previous game NEEDS TESTING
