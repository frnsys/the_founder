import $ from 'jquery';
import util from 'util';
import View from './View';
import Splash from '../Splash';
import Thanks from './Thanks';

const template = data => `
<div class="background"></div>
<div class="stars"></div>
<canvas id="earth"></canvas>
<div class="mute-menu"><img src="assets/icons/volume-${data.muted ? 'off' : 'high'}.svg"></div>
<div class="hello">
  <div class="hello-title">
    <h1>The Founder</h1>
    <h3>~Disrupt the world~</h3>
    <h4 class="about">A dystopian business simulator by <a href="https://twitter.com/frnsys">Francis Tseng</a></h4>
    <h4 class="backers-thanks">Thank You to Our Backers!</h4>
  </div>
  <ul class="main-menu">
    <li><button class="new-game">New Game</button></li>
    ${data.newGamePlus ? '<li><button class="new-game-plus">New Game+</button></li>' : ''}
    <li><button class="load-game" ${data.savedGame ? '': 'disabled'}>Load Game</button></li>
    <li></li>
  <div class="high-score">Highest Profit Achieved: ${data.highScore ? `${util.formatCurrencyAbbrev(data.highScore)}` : '$0'}</div>
  <div class="high-score-blurb">~${data.highScoreBlurb}~</div>
</div>

<div class="playtester-note" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);color:#fff;padding:4em;">
  <p>Welcome playtesters!</p>
  <p>Thank you for taking the time to test The Founder. Here's how you can help:</p>
  <p>The game isn't well-balanced at the moment. It might be too hard or too easy - please let me know if it's either of these and any suggestions you have on improving the difficulty.</p>
  <p>The game might still be buggy. I've been playtesting myself and the game ~should~ be free of game-breaking bugs, but you never know! If you encounter any, let me know. A detailed account of the last few actions you took and what exactly isn't working will help me fix it quickly.</p>
  <p>I'm also happy to hear more general gameplay/writing/etc suggestions, so please send those as well!</p>
  <p>You can reach me at f@frnsys.com or <a href="https://twitter.com/frnsys">on Twitter @frnsys</a>.</p>
  <p>Thank you!</p>
  <p class="playtester-close" style="cursor:pointer;color:red;">(click here to close)</p>
</div>
`

$('body').on('click', '.playtester-close', function() {
  $('.playtester-note').fadeOut();
});

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
          manager.game.state.start('Manage', true, false, manager.player);
          this.remove();
        },
        '.backers-thanks': function() {
          var view = new Thanks();
          view.render();
        },
        '.mute-menu': function() {
          var audio = document.getElementById('music');
          audio.muted = !audio.muted;
          localStorage.setItem('muted', audio.muted);
          if (audio.muted) {
            $('.mute-menu').html('<img src="assets/icons/volume-off.svg">');
          } else {
            $('.mute-menu').html('<img src="assets/icons/volume-high.svg">');
          }
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
    } else if (highScore > 1000000000000) {
      blurb = 'A master of the universe';
    } else if (highScore > 100000000000) {
      blurb = 'A true business genius';
    } else if (highScore > 10000000000) {
      blurb = 'You are a unicorn, I like you';
    } else if (highScore > 1000000000) {
      blurb = 'Welcome to the 3-comma club';
    } else if (highScore > 1000000) {
      blurb = 'Just amateur-level';
    } else if (highScore > 100000) {
      blurb = 'What is this, a mom & pop shop?';
    }


    var audio = document.getElementById('music');
    super.render({
      savedGame: this.manager.hasSave(),
      newGamePlus: this.manager.hasNewGamePlus(),
      highScore: highScore,
      highScoreBlurb: blurb,
      muted: audio.muted
    });
  }

  postRender() {
    super.postRender();
    $('.ui').show();
    var scene = new Splash();
    scene.render();
  }

  postRemove() {
    super.postRemove();
    $('.ui').hide();
  }
}

export default MainMenuView;
