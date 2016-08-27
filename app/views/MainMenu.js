import util from 'util';
import View from './View';
import Manager from 'app/Manager';

const template = data => `
<div class="hello">
  <div class="hello-title">
    <h1>The Founder</h1>
    <h3>Disrupt the world</h3>
    <h4 class="about">By <a href="https://twitter.com/frnsys">Francis Tseng</a></h4>
    <h4 class="version">Alpha version</h4>
  </div>
  <ul class="main-menu">
    <li><button class="new-game">New Game</button></li>
    ${data.newGamePlus ? '<li><button class="new-game-plus">New Game+</button></li>' : ''}
    <li><button class="load-game" ${data.savedGame ? '': 'disabled'}>Load Game</button></li>
    <li>${data.highScore ? `Highest Profit: ${util.formatCurrencyAbbrev(data.highScore)}` : ''}</li>
  </ul>
</div>
`

class MainMenuView extends View {
  constructor() {
    super({
      template: template,
      handlers: {
        '.new-game': function() {
          // Manager.player.company.cash = 100000; // TEMP
          Manager.player.company.cash = 1000000000;
          Manager.game.state.start('Manage');
          //Manager.game.state.start('Onboarding');
        },
        '.new-game-plus': function() {
          Manager.player.company.cash = Manager.newGamePlusCash();
          Manager.game.state.start('Manage');
          //Manager.game.state.start('Onboarding');
        },
        '.load-game': function() {
          Manager.load();
          Manager.game.state.start('Manage');
        }
      }
    });
  }
}

export default MainMenuView;
