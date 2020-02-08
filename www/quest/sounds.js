////// AUDIO Stuff //////

var SOUND_START;
var SOUND_MOVE;
var SOUND_FREEZE;
var SOUND_COIN;
var SOUND_CAPTURE;
var SOUND_GAMEOVER;


function initAllAudio() 
{
	SOUND_START = new Howl({
	  src: ['assets/sounds/start.mp3'],
	  preload:true
	});
	SOUND_MOVE = new Howl({
	  src: ['assets/sounds/move.mp3'],
	  preload:true
	});
	SOUND_FREEZE = new Howl({
	  src: ['assets/sounds/freeze.mp3'],
	  preload:true
	});
	SOUND_COIN = new Howl({
	  src: ['assets/sounds/coin.mp3'],
	  preload:true
	});
	SOUND_CAPTURE = new Howl({
	  src: ['assets/sounds/capture.mp3'],
	  preload:true
	});
	SOUND_GAMEOVER = new Howl({
	  src: ['assets/sounds/win.mp3'],
	  preload:true
	});
	
	if(typeof Cookies.get('sound') != "undefined") {
		if(Cookies.get('sound') == "no") {
		    sound_enabled = false;
			updateVolumeIcon();
		}		
	}
}

function startAudioMove() {
	if(!sound_enabled) return;
	SOUND_MOVE.play();
}
function startAudioFreeze() {
	if(!sound_enabled) return;
	SOUND_FREEZE.play();
}
function startAudioCoin() {
	if(!sound_enabled) return;
	SOUND_COIN.play();
}
function startAudioWin() {
	if(!sound_enabled) return;
	SOUND_GAMEOVER.play();
}
function startAudioCapture() {
	if(!sound_enabled) return;
	SOUND_CAPTURE.play();
}
function startAudioStart() {
	if(!sound_enabled) return;
	SOUND_START.play();
}