# 0.4.3

- additional tooltips explaining Quantity, Strength, Movement
- more balancing tweaks
- fix for decaying uncreative products (was leading to 0 and NaN revenues)

# 0.4.2

- bumped up the difficulty a bit
- fixed UI bug that was making it impossible to buy some things
- more informative tooltips

# 0.4.1

- fixed high score messages
- reduced base revenue per share (to increase difficulty)
- fixed transit-related stuff
- improved how employees work in the campus office
- many perk tweaks
    - changed names and descriptions to better fit in space
    - made perk objects able to replace other perk objects

# 0.4.0

- changed how the Board works, should make things simpler
- product revenue-per-share decreases with each new version (people want new stuff)
- perk objects were not loading correctly, and so were not showing up in the office...fixed now
- can toggle completed research in the research view
- various bug fixes

# 0.3.5

- nicer perk upgrade UI
- balancing

# 0.3.4

- only pay taxes on profit, paying on revenue was brutal lol
- fix for a bug where the office/clock would not pause while in the Market

# 0.3.3

- fixed conflict alert/popup pausing/unpausing
- UI improvements
    - fade already assigned workers a bit
    - office background color changes depending on the Board's mood
    - the in-game browser should scale better for larger screens
    - perks now say which tech is missing, if one is
- various UI fixes
- fix for card lists which would not properly update if they could be afforded or not
- fixed market AI tile evaluation, which was causing the AI to sometimes not do anything
- balancing
    - office sizes/upgrade prices
    - promo (hype/outrage) decay rates
    - promo hype generation power
- entertainment products no longer generate outrage
- fixed game over checking
- hack to reset the game after a game over
- fixed Board growth calculation for negative previous profits
- fixed employee in-office burnout icon/thought placements
- tweaked how competitor in-Market difficulty scales
- fix for navmesh ignoring (where employees would walk through desks)


# 0.3.2

- balancing tweaks
- various UI fixes
- unlocking system was totally busted, working now
- outrage was not properly accumulating, fixed
- added "moral panic" as a new contributor to outrage (caused by bioengineering and entertainment-related products)

# 0.3.1

- fix for game-breaking Market bug

# 0.3.0

- decreased base revenue per market share to increase difficulty
- an option to "delegate" fighting in the Market
- task assignment views show what skills are important (e.g. Marketing for Lobbying)
- competitor is shown before entering the Market
- audio muting setting is now saved in `localStorage`
- special projects show the prerequisites to unlock
- product types are sorted by un/locked status
- successful product recipes just have one name now, and are "versioned" (e.g. yPhone, yPhone 2, etc)
- better onboarding/intro with the mentor
- different parts of the game are unlocked at a better pace/in a more sensible order
- show idle workers & locations in the HUD
- fixed office upgrading (the button shows up now)
- message to explain when a perk hits its upgrade limit due to office level
- some misc UI improvements & fixes
- sped up time a bit
- reduced research and lobbying times
- alerts are animated in
- added better placeholder music :)
- the Market
    - messages when pieces are damaged or destroyed
    - other misc fixes

# 0.2.4

- various bug fixes
- various style tweaks
- additional office upgrade challenges

# 0.2.3

- show unassigned workers first in task assignment view
- "assign all unassigned" button in task assignment view
- hype reporting/scaling fixes
- the board looks for growth on last profit made (if it was higher than the target)
- better tracking of high score (updated monthly instead of b/w games)
- achievement notification when challenge is completed
- fixed gliding dogs
- other small bug fixes

# 0.2.2

- renamed Mars Colony challenge to "Exit Strategy"
- arrow keys to navigate mentor messages
- esc to close popups
- fixed tax rate and board profit computation (it was way off)
- various bug fixes
- some balancing tweaks

# 0.2.1

- hid the HUD challenge (was blocking the menu)

# 0.2.0

- added the challenge system
- balancing tweaks

# 0.1.3

- only show available research by default
- balanced acquisitions (costs, revenue generated, and effects)
- balanced technology costs
- balanced perks
- changed how product bonuses work (i forgot to update them when i rehauled how products work)

# 0.1.2

- instructions for how to play the Market minigame can be re-accessed in the Market
- improved un/satisfied prerequisite highlighting in research cards
- a filter to show only research which is available to you
- product pieces show little notifications when they capture a tile
- pieces are moved in the Market by drag-and-drop now
- acquired competitors no longer show up in the Market
- popups pause the game. should fix some bugs and also make gameplay a bit easier
- fixed some smaller bugs too