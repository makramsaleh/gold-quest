/**
	VirtualBoard class
*/

function VirtualBoard() {
	this.board = [];
	this.cage = [];
	this.caged_locations = [];	// keep track of trapped to remove them from html interface with animation

	this.last_move_score = 0;
	
	// Board score settings
	this.move_score_win = 1000;
	this.move_score_lose = -1000;
	this.move_score_tie = 0; // TODO think if tie is meaningful 
	this.move_score_trap_blue = 200;
	this.move_score_trap_red = -200;
	this.move_score_coin_red = 50;
	this.move_score_coin_blue = -50;
	this.move_score_freeze = 300;
	this.move_score_danger = 40;
	this.move_score_on_path_to_goal_multiplier = 200;
}


VirtualBoard.prototype.initBlankBoard = function() 
{
	this.board = [];
	
	// Populate board with empty blocks
	for (var r=0; r < board_size; r++) {
		var row = [];
		for (var c=0; c < board_size; c++) {
			row.push(BOARD_EMPTY);
		}
		this.board.push(row);
	}
	
	this.initPlayers();
	
	/// TEMPORARY disable coins
	//this.initCoins();
	
	if(this.updates_html) {
		this.active_board.applyToHTMLBoard();
	}
}
VirtualBoard.prototype.initPlayers = function() 
{
	switch(game_mode) {
		case "wall":
		case "easter":
			// full row per player
			// red on top, blue on bottom
			
			/// TEMPORARY add only one red piece
			this.board[0] = BOARD_EMPTY.repeat(board_size-1).split("");
			this.board[0].unshift(BOARD_RED);
			this.board[board_size-1] = BOARD_EMPTY.repeat(board_size-2).split("");
			this.board[board_size-1].unshift(BOARD_BLUE);
			this.board[board_size-1].unshift(BOARD_BLUE);
		break;
		
		case "diamond":
			// only 2 pieces per player
			var per_player = 2;
			var padding = Math.floor((board_size-per_player)/2);
			// red
			for (var i=padding; i < padding+per_player; i++) {
				this.board[0][i] = BOARD_RED;
			}
			// blue
			for (var i=padding; i < padding+per_player; i++) {
				this.board[board_size-1][i] = BOARD_BLUE;
			}
		break;
	}
}
VirtualBoard.prototype.initCoins = function() 
{
	switch(game_mode) {
		case "wall":
			var coin_row = board_size/2;
			for (var i=0; i < board_size; i++) {
				coin_row = (coin_row==board_size/2)?board_size/2-1:board_size/2;
				this.board[coin_row][i] = BOARD_COIN;
			}		
		break;
		
		case "easter":
			var rand = Math.floor(Math.random()*(max_eggs-min_eggs))+min_eggs;
			
			// All rows can host coins except first and last
			var host_rows = board_size-2;
			var coins_distribution = [];
			// fill coins
			for (var i=0; i < rand; i++) {
				coins_distribution.push("x");
			}
			// fill empty spaces
			var host_blocks = host_rows*board_size - rand;
			for (var i=0; i < host_blocks; i++) {
				coins_distribution.push("o");
			}
			
			shuffle(coins_distribution);
			
			var index = 0;
			var curr_row = 1;
			for (var r=1; r < board_size-1; r++) {
				for (var c=0; c < board_size; c++) {
					if(coins_distribution[index] == "x"){
						this.board[r][c] = BOARD_COIN;
					}
					index++;
				};
			}
			
		break;
		
		case "diamond":
			// TODO make this dynamic (now it only works for 8 x 8 board)
			var dist = "oooooooooooxxoooooxxxxooooxxxxoooooxxooooooooooo";
			var coins_distribution = dist.split("");
			var index = 0;
			var curr_row = 1;
			for (var r=1; r < board_size-1; r++) {
				for (var c=0; c < board_size; c++) {
					if(coins_distribution[index] == "x"){
						this.board[r][c] = BOARD_COIN;
					}
					index++;
				};
			}
		break;
	}
}


VirtualBoard.prototype.getBoard = function() 
{
	return this.board;
}
VirtualBoard.prototype.getCage = function() 
{
	return this.cage;
}
VirtualBoard.prototype.getCagedLocations = function() 
{
	return this.caged_locations;
}
VirtualBoard.prototype.getLastMoveScore = function() 
{
	return this.last_move_score;
}
VirtualBoard.prototype.countAllFromType = function(type)
{
	return this.getAllFromType(type).length;
}
VirtualBoard.prototype.getAllFromType = function(type)
{
	var all = [];
	for (var r=0; r < board_size; r++) {
		for (var c=0; c < board_size; c++) {
			if(this.board[r][c] === type) all.push([r,c]);
		}
	}
	return all;
}
VirtualBoard.prototype.getAllMovesFromType = function(type)
{
	/*

	This array will be a 2D array like this:
	[ [piece, adjacent empty], [piece, adjacent empty]...  ]
	where both piece and adjacent looks like this: [row, col]

	*/
	var moves = [];
	
	var all_player_pieces = this.getAllFromType(type);
	
	// find all empty adjacents to all reds
	for (var i=0; i < all_player_pieces.length; i++) {
		var adjacents = this.getAllAdjacents(all_player_pieces[i][0], all_player_pieces[i][1]);
		// find only empty ones
		for (var k=0; k < adjacents.length; k++) {
			if(this.board[adjacents[k][0]][adjacents[k][1]] === BOARD_EMPTY) {
				moves.push( [all_player_pieces[i], adjacents[k]] );
			}
		}
	}
	
	return moves;
}

VirtualBoard.prototype.getAllAdjacents = function(block_row, block_col) 
{
	// Get all adjacent blocks (cross)
	var adjacents = [];
	
	board = this.board;
	
	// top & bottom
	var tr = block_row-1;
	if(tr >= 0) adjacents.push([tr, block_col]);
	var br = block_row+1;
	if(br < board_size) adjacents.push([br, block_col]);
	
	// left & right
	var c = block_col+1;
	if(c < board_size) adjacents.push([block_row, c]);
	var c = block_col-1;
	if(c < board_size) adjacents.push([block_row, c]);
	
	return adjacents;
}

VirtualBoard.prototype.applyToHTMLBoard = function() {
	for (var r=0; r < board_size; r++) {
		for (var c=0; c < board_size; c++) {
			var block = $("#b_"+r+"_"+c);
			var piece = this.board[r][c];
			
			var piece_class = "";
			switch (piece) {
				case BOARD_RED:
					piece_class = "piece red";
				break;
				case BOARD_BLUE:
					piece_class = "piece blue";
				break;
				case BOARD_COIN:
					piece_class = "coin";
				break;
				case BOARD_FIXED_RED:
					piece_class = "piece red-fixed";
				break;
				case BOARD_FIXED_BLUE:
					piece_class = "piece blue-fixed";
				break;
			}
			
			// Replace old piece with new piece with animation
			if(block.children().length > 0) {
				var existing_piece = $(block).children().first();
				
				// Captured
				var is_caged = false;
				for (var i=0; i < this.caged_locations.length; i++) {
					if(this.caged_locations[i][0]==r && this.caged_locations[i][1]==c) {
						is_caged = true;
						HTMLInterface.replaceCaptured(existing_piece);
					}
				}
				if(is_caged) continue;
				
				// Coins
				if( $(existing_piece).hasClass("coin") && piece_class.indexOf("piece")!=-1) {
					var next_color = piece_class.split(" ")[1];
					HTMLInterface.replaceCoin(existing_piece, next_color);
				} else {
					block.empty();
					if(piece_class != "") {
						$('<div class="'+piece_class+' auto"></div>').prependTo(block);
					}
				}
				
			} else {
				if(piece_class != "") {
					$('<div class="'+piece_class+' auto"></div>').prependTo(block);
				}
			}
			
		}
	}
	
	// Cage
	$(".cage").empty();
	for (var i=0; i < this.cage.length; i++) {
		var pclass = this.cage[i]===BOARD_RED?"red captured":"blue captured";
		$('<div class="'+pclass+'"></div>').appendTo(".cage");
	}
	
	// clear caged locations
	this.caged_locations = [];
}

VirtualBoard.prototype.copyFromBoard = function(source_board) 
{
	this.board = JSON.parse(JSON.stringify(source_board.getBoard()));
	this.cage = JSON.parse(JSON.stringify(source_board.getCage()));
	this.caged_locations = JSON.parse(JSON.stringify(source_board.getCagedLocations()));
}
VirtualBoard.prototype.movePiece = function(piece, empty_block, turn) 
{
	this.last_move_score = 0;
	log("SCORE: reset");

	// Note: it's important to get the move score before committing the move so that 
	// the graph needed for A* doesn't show the next move as a blocked cell
	if(turn=="red") {
		var target_score = this.getBlockPathScore(piece, empty_block);
		this.last_move_score += target_score;
		log("SCORE: target +"+target_score);
	}

	var piece_value = this.board[piece[0]][piece[1]];
	this.board[empty_block[0]][empty_block[1]] = piece_value;
	this.board[piece[0]][piece[1]] = BOARD_EMPTY;
	
	this.updateAfterMove(turn);
}
VirtualBoard.prototype.replaceCoinWithType = function(coin_block, type) 
{
	this.board[coin_block[0]][coin_block[1]] = type;
}
VirtualBoard.prototype.freezePiece = function(piece_block, type) 
{
	this.board[piece_block[0]][piece_block[1]] = (type===BOARD_RED ? BOARD_FIXED_RED : BOARD_FIXED_BLUE);
	this.last_move_score += (type===BOARD_RED)?this.move_score_freeze:0;
	if(type===BOARD_RED) log("SCORE: freeze "+this.move_score_freeze);
}
VirtualBoard.prototype.moveCaptured = function(piece_block, type) 
{
	this.board[piece_block[0]][piece_block[1]] = BOARD_EMPTY;
	this.cage.push(type);
	this.caged_locations.push(piece_block);
	var score_gain = (type===BOARD_RED)?this.move_score_trap_red:this.move_score_trap_blue;
	this.last_move_score += score_gain;
	log("SCORE: trap "+score_gain);
}
VirtualBoard.prototype.getPiecesInDanger = function(type) 
{
	// Checks which pieces are close to being captured
	// Find the peices that has adjacent opponent, and for those check if any 
	// opponent piece have common adjacents (which means that the opponent might 
	// trap this piece in one move)
	var pieces = this.getAllFromType(type);
	var opponent_type = type===BOARD_RED?BOARD_BLUE:BOARD_RED;
	var opponent_pieces = this.getAllFromType(opponent_type);
	var danger_score = 0;
	for (var i=0; i < pieces.length; i++) {
		var adjacents = this.getAllAdjacents( pieces[i][0], pieces[i][1] );
		var has_adjacent_opponent = false;
		for (var k=0; k < adjacents.length; k++) {
			if(this.board[adjacents[k][0]][adjacents[k][1]] === opponent_type) {
				has_adjacent_opponent = true;
				break;
			}
		}
		if(has_adjacent_opponent) {
			for(var j=0; j<opponent_pieces.length; j++) {
				var opponent_adjacents = this.getAllAdjacents( opponent_pieces[j][0], opponent_pieces[j][1] );
				var intersecting = this.getIntersection(opponent_adjacents, adjacents);
				var has_empty_adjacent_intersections = false;
				for (var f=0; f<intersecting.length; f++) {
					if(this.board[intersecting[f][0]][intersecting[f][1]] === BOARD_EMPTY) {
						has_empty_adjacent_intersections = true;
						break;
					}
				}
			}
		}
		if(has_empty_adjacent_intersections) {
			//log("DANGER PP: "+type+" ---> "+pieces[i][0]+" - "+pieces[i][1]);
			danger_score += this.move_score_danger;
		}
	}
	//log("DANGER: "+type+" ---> "+danger_score);
	return danger_score;
}

VirtualBoard.prototype.updateAfterMove = function(turn) 
{
	// rule: coins switch to either blue or red piece if surrounded by that color from 2 adjacent sides
	// check if any coin is adjacent to red or blue piece
	this.updateCoins();
	
	// rule: any piece surrounded by 2 opponent pieces on sides gets "captured"
	// rule: captured pieces are removed from board
	if(turn == "red") {
		this.checkCaptured(BOARD_BLUE);
		this.checkCaptured(BOARD_RED);
	} else {
		this.checkCaptured(BOARD_RED);
		this.checkCaptured(BOARD_BLUE);
	}
	
	// rule: pieces that reach the opposite end row will be frozen (can't be moved anymore) and count towards the player score
	// 
	// rule: if all pieces of any player are captured and/or reached end row the game is over 
	// rule: player with most pieces on the board wins
	this.updateFreeze();
	
	var red_in_danger_score_loss = this.getPiecesInDanger(BOARD_RED);
	this.last_move_score -= red_in_danger_score_loss;
	var blue_in_danger_score_gain = this.getPiecesInDanger(BOARD_BLUE);
	this.last_move_score += blue_in_danger_score_gain
	
	log("SCORE: danger red  -"+red_in_danger_score_loss);
	log("SCORE: danger blue +"+blue_in_danger_score_gain);
	
	
	var winner = this.getWinner();
	if(winner === "blue") {
		this.last_move_score += this.move_score_lose;
		log("SCORE: win blue "+this.move_score_lose);
	}
	if(winner === "red") {
		this.last_move_score += this.move_score_win;	
		log("SCORE: win red  "+this.move_score_win);
	} 
	if(winner === "tie") {
		this.last_move_score += this.move_score_tie;
		log("SCORE: win tie  "+this.move_score_tie);
	}
}

VirtualBoard.prototype.updateFreeze = function() 
{
	// Convert red and blue pieces in the end rows to frozen pieces
	for (var c=0; c < board_size; c++) {
		// top row for blue
		if(this.board[0][c] === BOARD_BLUE) {
			this.freezePiece([0,c], BOARD_BLUE);
		}
	}
	for (var c=0; c < board_size; c++) {
		// bottom row for red
		if(this.board[board_size-1][c] === BOARD_RED) {
			this.freezePiece([board_size-1,c], BOARD_RED);
		}
	}
}

VirtualBoard.prototype.updateCoins = function() 
{
	var coins = this.getAllFromType(BOARD_COIN);
	for (var i=0; i < coins.length; i++) {
		var adjacents = this.getAllAdjacents( coins[i][0], coins[i][1] );
		var blue_adjacent = 0;
		var red_adjacent = 0;
		for (var k=0; k < adjacents.length; k++) {
			if(this.board[adjacents[k][0]][adjacents[k][1]] === BOARD_RED) red_adjacent++;
			if(this.board[adjacents[k][0]][adjacents[k][1]] === BOARD_BLUE) blue_adjacent++;
		}
		if(red_adjacent>=2) {
			this.replaceCoinWithType(coins[i], BOARD_RED);
			this.last_move_score += this.move_score_coin_red;
			log("SCORE: coin red "+ this.move_score_coin_red);
			this.updateCoins(); // recursive check to see if new converted coin converts more coins
		}
		if(blue_adjacent>=2) {
			this.replaceCoinWithType(coins[i], BOARD_BLUE);
			this.last_move_score += this.move_score_coin_blue;
			log("SCORE: coin blue "+ this.move_score_coin_blue);
			this.updateCoins(); // recursive check to see if new converted coin converts more coins
		}
	}
}
VirtualBoard.prototype.checkCaptured = function(type) 
{
	var pieces = this.getAllFromType(type);
	for (var i=0; i < pieces.length; i++) {
		var adjacents = this.getAllAdjacents( pieces[i][0], pieces[i][1] );
		var opponent_adjacent = 0;
		var opponent_type = (type===BOARD_RED)?BOARD_BLUE:BOARD_RED;
		for (var k=0; k < adjacents.length; k++) {
			if(this.board[adjacents[k][0]][adjacents[k][1]] === opponent_type) opponent_adjacent++;
		}
		if(opponent_adjacent >= 2) { 
			this.moveCaptured(pieces[i], type);
		}
	}
}

VirtualBoard.prototype.getIntersection = function(pieces_array_a, pieces_array_b) 
{
	var intersection = [];
	for (var i=0; i < pieces_array_a.length; i++) {
		for (var j=0; j < pieces_array_b.length; j++) {
			if(pieces_array_a[i][0] == pieces_array_b[j][0] && pieces_array_a[i][1] == pieces_array_b[j][1]) {
				intersection.push(pieces_array_a[i]);
			}
		};
	}
	return intersection;
}

VirtualBoard.prototype.getBlockPathScore = function(piece, next) 
{	
	var reward = 0;
	
	var graph = this.toGraph();
	//console.log(graph.toString());
	var start = graph.grid[piece[0]][piece[1]];
	
	// Check if 'next' is on the path towards nearest goal block (goal is end row)
	var empty_goal_blocks = [];
	for(var c=0; c<board_size; c++) {
		if(this.board[board_size-1][c] === BOARD_EMPTY) {
			empty_goal_blocks.push([board_size-1, c]);
		}
	}
	
	for (var i=0; i < empty_goal_blocks.length; i++) {
		// result is an array containing the shortest A* path
		var end = graph.grid[empty_goal_blocks[i][0]][empty_goal_blocks[i][1]];
		//console.log("start >> end "+ start.toString() + " >> "+ end.toString());
		var result = astar.search(graph, start, end);
		//console.log(result.toString());
		var step_reward_increment = 1/result.length;
		for (var t=0; t < result.length; t++) {
			var step = result[t];
			if(step.x == next[0] && step.y == next[1]) {
				// next block is on the path
				var step_reward = (t+1)*step_reward_increment; // less reward the further it is from goal
				if(reward < step_reward) reward = step_reward;
				//console.log("rewarded: "+reward);
			}
		}
	}
	return reward * this.move_score_on_path_to_goal_multiplier;
}
VirtualBoard.prototype.toGraph = function() 
{
	// https://github.com/bgrins/javascript-astar
	// 0 is wall
	// 1 is open
	var graph_array = [];
	
	for (var r=0; r < board_size; r++) {
		graph_array[r] = [];
		for (var c=0; c < board_size; c++) {
			graph_array[r][c] = this.board[r][c]==BOARD_EMPTY?1:0;
		}
	}
	return new Graph(graph_array, { diagonal: false });
}

/**
	getWinner
	
	CHecks who won this board and returns one of the following
	
	false	no wiiner
	"red"	red won
	"blue"	blue won
	"tie"	it's a tie		
*/
VirtualBoard.prototype.getWinner = function(players_played_equal_turns)
{
	var pieces_red = this.countAllFromType(BOARD_RED);
	var frozen_red = this.countAllFromType(BOARD_FIXED_RED);
	var pieces_blue = this.countAllFromType(BOARD_BLUE);
	var frozen_blue = this.countAllFromType(BOARD_FIXED_BLUE);
	var possible_red_moves = this.getAllMovesFromType(BOARD_RED);
	var possible_blue_moves = this.getAllMovesFromType(BOARD_BLUE);
	
	// rule: only check winners when both players played same number of moves or when both 
	//       players have no more unfrozen pieces 
	// rule: red wins if all blue pieces are captured and red frozen and active are more than blue frozen
	// rule: red wins also if all pieces of red are frozen and are more than blue frozen pieces, even if 
	//       blue still has unfrozen pieces
		
	// TODO
	// rule: winner is declared when all the end row is filled with frozen 
	//		 player pieces. This might happen even when any/both players 
	//		 can still play		
		
	// Do nothing if both players still have free (unfrozen and untrapped) pieces
	if(possible_red_moves>0 && possible_blue_moves>0) {
		return false;
	}
	
	// ...now we know at least one of the players don't have free pieces,
	//    let's check if both played the same number of moves and can still play
	var red_can_play = (possible_red_moves>0) && !players_played_equal_turns;
	var blue_can_play = (possible_blue_moves>0) && !players_played_equal_turns;
	if(red_can_play || blue_can_play) {
		return false;
	}
	
	// ...now we know that both players played the same number of moves. Let's check if we have a tie
	// TIE
	if( (!pieces_blue && !pieces_red) && (frozen_red == frozen_blue) ) {
		return "tie";
	}
	
	//...now that we know it's not a tie, let's see who won
	
	// red wins
	if(  (!pieces_blue && (frozen_red+pieces_red > frozen_blue)) || (!pieces_red && frozen_red>frozen_blue)  ) {
		return "red";
	}
	// blue wins
	if(  (!pieces_red && (frozen_blue+pieces_blue > frozen_red)) || (!pieces_blue && frozen_blue>frozen_red)  ) {
		return "blue";
	}
		
	return false;
}

VirtualBoard.prototype.print = function() 
{
	if(!ENABLE_BOARD_PRINT) return;
	var str = "";
	for (var i=0; i < this.board.length; i++) {
		str += (this.board[i].join(" "));
		str += ("\n");
	};
	log(str);
}
