// import './css/main.sass';
import Boot from 'states/Boot';
import Manager from 'app/Manager';

// import Sandbox from 'debug/Sandbox';
// Sandbox.create();

Manager.game.state.add('Boot', new Boot());
Manager.game.state.start('Boot');

var VERSION = '1.0.1';
document.getElementById('version-notice').innerHTML = VERSION;

var loading = document.getElementById('loading');
loading.parentNode.removeChild(loading);

var muted = localStorage.getItem('muted'),
    audio = document.getElementById('music');
muted = muted ? JSON.parse(muted) : true; // mute by default
audio.muted = muted;
