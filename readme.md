## setup

```
npm install -d
npm start
```

## build

```
npm run build
```

## testing

```
npm test
```

---

Dog models are derived from [PigArt's Low Poly Wolf model](http://www.blendswap.com/blends/view/72239).

The license that came with the model has it under a different (non-existent) user: nabagielis. It is released under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

---

The following icons are from [paomedia](http://www.iconarchive.com/artist/paomedia.html), released in the Public Domain:

- `assets/company/confirm.png`
- `assets/company/mail.png`
- `assets/company/news.png`
- `assets/company/time.png`
- `assets/company/market.png`
- `assets/company/completed.png`

---

For easier serialization, all data that needs to be un/serialized (i.e. loaded/saved) should be kept at the top-level of the `player` (which keeps track of the more general game world state) or `company`. No objects should save a reference to the `player` or `company` except for the `Manager` - references to either of these should be passed in as needed. This is to avoid circular references.

---

notes on the project structure

- `game` contains only the core logic defining the game's systems (it does not deal with their presentation, i.e. views)
- `market` contains only the logic for the Market, including its board (the hexworld)
- `office` contains only the logic for rendering the in-game office
- `views` deal with all DOM elements; they just render data
- `states` ties together these different components

three important objects are:

- the `game`, which is the Phaser game object
- the `player`, which contains all data that must be persisted/loaded for a save game; that is, all the data that uniquely represents an active game
- the `manager`, which coordinates between the Phaser game object, the Player object, and handles functionality like saving/loading, new game creation, etc

---

# MIT LICENSE

Copyright 2016-2017 Francis Tseng

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.