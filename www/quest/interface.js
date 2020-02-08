function initInteractions() 
{
	$("#btn_pause").click(function() {
		showPopup("#popup_pause");
	});
	
	$("#newgame_1player").click(function() {
		game_players_mode = "1";
		$(".player").removeClass("selected");
		$(this).addClass("selected");
	});
	$("#newgame_2players").click(function() {
		game_players_mode = "2";
		$(".player").removeClass("selected");
		$(this).addClass("selected");
	});
	$("#btn_gamestart").click(function() { 
		HTMLInterface.resetGame(game_players_mode=="1"?true:false);
		hidePopup();
	});

	
	// Game modes
	$("#mode_wall").click(function() {
		game_mode = "wall";
		$(".mode").removeClass("selected");
		$(this).addClass("selected");
	});
	$("#mode_easter").click(function() {
		game_mode = "easter";
		$(".mode").removeClass("selected");
		$(this).addClass("selected");
	});
	$("#mode_diamond").click(function() {
		game_mode = "diamond";
		$(".mode").removeClass("selected");
		$(this).addClass("selected");
	});
	
	$("#btn_playagain").click(function() { showPopup("#popup_newgame"); });
	$("#btn_replay").click(function() { showPopup("#popup_newgame"); });
	$("#btn_continue").click(function() { hidePopup(); });
	
	// Sound toggle
	$(".btn_toggle_sound").click(function() {
		sound_enabled = !sound_enabled;
		updateVolumeIcon();
		Cookies.set("sound", sound_enabled?"yes":"no");
	});
}

function showWinnerPopup(message) 
{
	$("#popup_winner h1").html(message);
	showPopup("#popup_winner");
}

function hidePopup() 
{
	$(".popup").fadeOut();
	$(".dim").fadeOut();
}
function showPopup(content_id) 
{
	$(".popup .popupcontent").hide();
	$(content_id).show();
	$(".popup").fadeIn();
	$(".dim").fadeIn(500);
}

function updateVolumeIcon() 
{
	if(sound_enabled) {
		$(".btn_toggle_sound i").text("volume_up");
	} else {
		$(".btn_toggle_sound i").text("volume_off");
	}
}
