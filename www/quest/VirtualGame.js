/************************************************************
	VirtualGame class
	
	Maintains and manages the active board
*/


function VirtualGame(updates_html)
{
	this.moves_red;			// Int
	this.moves_blue;		// Int
	this.current_turn;		// String
	this.active_board;		// VirtualBoard
	this.against_AI;		// Boolean
	this.is_active;			// Boolean

	this.updates_html = updates_html;	
}

VirtualGame.prototype.startNewGame = function (against_AI) 
{	
	this.is_active = true;
	
	this.current_turn = Math.random()>.5?"red":"blue";
	this.moves_red = 0;
	this.moves_blue = 0;
	this.against_AI = against_AI;
	this.active_board = new VirtualBoard();
	this.active_board.initBlankBoard();
	
	if(this.updates_html) {
		this.active_board.applyToHTMLBoard();		
	}
	
	this.switchTurn();
}

VirtualGame.prototype.getBoard = function () 
{	
	return this.active_board;
}
VirtualGame.prototype.getCurrentTurn = function () 
{	
	return this.current_turn;
}
VirtualGame.prototype.checkGameOver = function () 
{	
	return this.active_board.getWinner(this.moves_red == this.moves_blue);
}
VirtualGame.prototype.switchTurn = function () 
{
	this.current_turn = this.current_turn=="blue"?"red":"blue";
	
	if(this.updates_html) {
		HTMLInterface.updateAfterTurnSwitch();
	}
	
	// Rule: Trapped player loses
	//		check if current player is trapped 
	// 	    if both players played the same number of moves, declare
	// 		the other as winner, otherwise
	// 	    pass the turn to the next player
	// 
	var possible_moves_red = this.active_board.getAllMovesFromType(BOARD_RED).length;;
	var possible_moves_blue = this.active_board.getAllMovesFromType(BOARD_BLUE).length;;
	
	if(this.current_turn == "red" && possible_moves_red==0)	 {
		// RED is trapped
		// ...let's see if the opponent can still play
		if(this.moves_red == this.moves_blue) {
			// RED can't do any move and loses
			// TODO: must check board to see who won
			this.endGame("blue");
		} else {
			// Pass the turn
			this.updateAfterMove();
		}
	}
	if(this.current_turn == "blue" && possible_moves_blue==0)	 {
		// BLUE is trapped
		// ...let's see if the opponent can still play
		if(this.moves_red == this.moves_blue) {
			// BLUE can't do any move and loses
			// TODO: must check board to see who won
			this.endGame("red");
		} else {
			// Pass the turn
			this.updateAfterMove();
		}
	}
	
	// Check if AI should play
	if(this.current_turn == "red" && this.against_AI) {
		this.playAITurn();
	}
	
}

VirtualGame.prototype.playAITurn = function () {
	setTimeout(function() {
		new Agent().performBestMove();
	}, 400);
}
VirtualGame.prototype.updateAfterMove = function () 
{	
	if(this.current_turn == "red") this.moves_red++;
	if(this.current_turn == "blue") this.moves_blue++;
	
	var winner = this.checkGameOver();
	if(winner !== false) {
		this.endGame(winner);
	} else {
		this.switchTurn();		
	}
}
VirtualGame.prototype.commitAIMove = function (fromNode, toNode) 
{
	this.active_board.movePiece(fromNode, toNode, this.current_turn);
	this.active_board.getGrid().resetRewards();
	if(this.updates_html) this.active_board.applyToHTMLBoard();

	this.updateAfterMove();
}
VirtualGame.prototype.commitHumanMove = function (from_coords, to_coords) 
{	
	var moved_piece_type = (this.current_turn=="red") ? BOARD_RED : BOARD_BLUE;
	
	this.active_board.movePieceByCoords(from_coords, to_coords, this.current_turn);
	this.active_board.applyToHTMLBoard();

	this.updateAfterMove();
}
VirtualGame.prototype.endGame = function (winner)
{
	this.is_active = false;
	if(this.updates_html) HTMLInterface.performGameOverCeremony(winner);
}


