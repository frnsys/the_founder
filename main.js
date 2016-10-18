import './css/main.sass';
import Boot from 'states/Boot';
import Manager from 'app/Manager';

// import Sandbox from 'debug/Sandbox';
// Sandbox.create();

Manager.game.state.add('Boot', new Boot());
Manager.game.state.start('Boot');

var VERSION = 'ALPHA VERSION (0.4.3)';
document.getElementById('version-notice').innerHTML = VERSION;

var muted = localStorage.getItem('muted'),
    audio = document.getElementById('music');
muted = muted ? JSON.parse(muted) : false;
audio.muted = muted;
