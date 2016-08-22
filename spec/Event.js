import _ from 'underscore';
import Player from 'app/Player';
import Event from 'game/Event';

var event = {
  "actions": [],
  "conditions": [],
  "description": "Protesters have begun targeting the buses of <PLAYERCOMPANY>, whose presence has contributed to escalating rent and increasing financial troubles for residents of <PLAYERHQ>.",
  "effects": [
    {
      "type": "productivity",
      "value": -5
    }
  ],
  "from": "Punda Daily",
  "name": "Bus Protests",
  "repeatable": true,
  "type": 1
};


describe('Event', function() {
  var player, company;
  beforeEach(function() {
    player = new Player();
    company = player.company;
  });
});



