import $ from 'jquery';
import util from 'util';
import View from './View';
import MainMenuScene from '../MainMenu';

const template = data => `
<div class="background"></div>
<div class="stars"></div>
<canvas id="earth"></canvas>
<div class="hello">
  <div class="hello-title">
    <h1>The Founder</h1>
    <h3>~Disrupt the world~</h3>
    <h4 class="about">A dystopian business simulator by <a href="https://twitter.com/frnsys">Francis Tseng</a></h4>
    <h4 class="version">Alpha version</h4>
  </div>
  <ul class="main-menu">
    <li><button class="new-game">New Game</button></li>
    ${data.newGamePlus ? '<li><button class="new-game-plus">New Game+</button></li>' : ''}
    <li><button class="load-game" ${data.savedGame ? '': 'disabled'}>Load Game</button></li>
    <li></li>
  <div class="high-score">Highest Profit Achieved: ${data.highScore ? `${util.formatCurrencyAbbrev(data.highScore)}` : '$0'}</div>
  <div class="high-score-blurb">~${data.highScoreBlurb}~</div>
</div>
`

class MainMenuView extends View {
  constructor(manager, debug) {
    super({
      parent: '.ui',
      template: template,
      handlers: {
        '.new-game': function() {
          if (debug) {
            manager.player.company.cash = 1000000;
            manager.game.state.start('Manage');
          } else {
            manager.player.company.cash = 100000;
            manager.game.state.start('Onboarding');
          }
          this.remove();
        },
        '.new-game-plus': function() {
          manager.player.company.cash = manager.newGamePlusCash();
          manager.game.state.start('Onboarding');
          this.remove();
        },
        '.load-game': function() {
          manager.load();
          manager.game.state.start('Manage');
          this.remove();
        }
      }
    });
    this.manager = manager;
  }

  render() {
    var highScore = this.manager.highScore(),
        blurb;

    if (highScore === 0) {
      blurb = 'Time to get to work';
    } else if (highScore < 0) {
      blurb = 'You should be ashamed of yourself';
    } else if (highScore > 100000) {
      blurb = 'What is this, a mom & pop shop?';
    } else if (highScore > 1000000) {
      blurb = 'Just amateur-level';
    } else if (highScore > 1000000000) {
      blurb = 'Welcome to the 3-comma club';
    } else if (highScore > 10000000000) {
      blurb = 'You are a unicorn, I like you';
    } else if (highScore > 100000000000) {
      blurb = 'A true business genius';
    } else if (highScore > 1000000000000) {
      blurb = 'A master of the universe';
    }

    super.render({
      savedGame: this.manager.hasSave(),
      newGamePlus: this.manager.hasNewGamePlus(),
      highScore: highScore,
      highScoreBlurb: blurb
    });
  }

  postRender() {
    super.postRender();
    $('.ui').show();
    var scene = new MainMenuScene();
    scene.render();
  }

  postRemove() {
    super.postRemove();
    $('.ui').hide();
  }
}

export default MainMenuView;
