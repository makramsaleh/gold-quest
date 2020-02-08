/**
	VirtualBoard class
*/

function VirtualBoard() {
	this.cage = [];
	this.grid;
	this.caged_locations = [];	// keep track of trapped to remove them from html interface with animation

	// Board score settings
	this.minimax_score_win = 1000;
	this.minimax_score_tie = 0;
	this.minimax_score_piece = 20; // applies for losing pieces (by capture) or gaining pieces (coin convert)
	this.minimax_score_freeze = 300;
	this.minimax_score_free_move = 3;
	this.minimax_score_nearness_to_coin = 10;
}


VirtualBoard.prototype.initBlankBoard = function() 
{
	this.grid = new Grid(board_size, board_size);
	console.log("GRID:\n"+this.grid.toString());
	
	this.initPlayers();
	
	this.initCoins();
	
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
			for (var i=0; i < this.grid.width; i++) {
				this.grid.addNodeAtFirstRow(new GridNode(BOARD_RED), i);
				this.grid.addNodeAtLastRow(new GridNode(BOARD_BLUE), i);
			}
		break;
		
		case "diamond":
			// only 2 pieces per player
			var per_player = 2;
			var padding = Math.floor((board_size-per_player)/2);
			// red
			for (var i=padding; i < padding+per_player; i++) {
				this.grid.addNodeAtFirstRow(new GridNode(BOARD_RED), i);
			}
			// blue
			for (var i=padding; i < padding+per_player; i++) {
				this.grid.addNodeAtLastRow(new GridNode(BOARD_BLUE), i);
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
				this.grid.addNodeAt(new GridNode(BOARD_COIN), coin_row, i);
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
						this.grid.addNodeAt(new GridNode(BOARD_COIN), r, c);
					}
					index++;
				};
			}
			
		break;
		
		case "diamond":
			// TODO make this dynamic (now it only works for 8 x 8 board)
			var dist = "ooxxoooxxxxooxxxxoooxxoooooo";
			var coins_distribution = dist.split("");
			var index = 0;
			var curr_row = 1;
			for (var r=1; r < board_size-1; r++) {
				for (var c=0; c < board_size; c++) {
					if(coins_distribution[index] == "x"){
						this.grid.addNodeAt(new GridNode(BOARD_COIN), r, c);
					}
					index++;
				};
			}
		break;
	}
}
VirtualBoard.prototype.getGrid = function() 
{
	return this.grid;
}
VirtualBoard.prototype.getCage = function() 
{
	return this.cage;
}
VirtualBoard.prototype.getCagedLocations = function() 
{
	return this.caged_locations;
}
VirtualBoard.prototype.countAllFromType = function(type)
{
	// TODO optimise by using string search in grid string instead of loops
	// https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
	return this.getAllFromType(type).length;
}
VirtualBoard.prototype.getAllFromType = function(type)
{
	return this.grid.getNodesOfKind(type);
}
VirtualBoard.prototype.getAllMovesFromType = function(type)
{
	/*

	This array will be a 2D array like this:
	[ [node, adjacent empty node], [node, adjacent empty node]...  ]

	*/
	var moves = [];
	
	var all_player_pieces = this.getAllFromType(type);
	
	// find all empty adjacents to all reds
	for (var i=0; i < all_player_pieces.length; i++) {
		var empty_adjacents = all_player_pieces[i].getEmptyAdjacents();
		// Merge them in one array
		for (var k=0; k < empty_adjacents.length; k++) {
			moves.push( [all_player_pieces[i], empty_adjacents[k]] );
		}
	}
	
	return moves;
}
VirtualBoard.prototype.countAllMovesFromType = function(type)
{
	return this.getAllMovesFromType(type).length;
}

VirtualBoard.prototype.applyToHTMLBoard = function() {
	for (var r=0; r < board_size; r++) {
		for (var c=0; c < board_size; c++) {
			var block = $("#b_"+r+"_"+c);
			var piece = this.grid.getNodeAt(r,c);
			
			var piece_class = "";
			switch (piece.getKind()) {
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
	this.grid = new Grid();
	this.grid.copyFromOtherGrid(source_board.getGrid());
	this.cage = JSON.parse(JSON.stringify(source_board.getCage()));
	this.caged_locations = JSON.parse(JSON.stringify(source_board.getCagedLocations()));
}

VirtualBoard.prototype.movePieceByCoords = function(fromCoords, toCoords, turn) 
{
	this.movePiece(this.grid.getNodeAt(fromCoords[0], fromCoords[1]), this.grid.getNodeAt(toCoords[0], toCoords[1]), turn);	
}
VirtualBoard.prototype.movePiece = function(fromNode, toNode, turn) 
{
	this.grid.moveNode(fromNode, toNode);	
	this.updateAfterMove(turn);
}
VirtualBoard.prototype.replaceCoinWithType = function(coinNode, type) 
{
	coinNode.setKind(type);
}
VirtualBoard.prototype.freezePiece = function(node) 
{
	node.setKind( (node.getKind()===BOARD_RED ? BOARD_FIXED_RED : BOARD_FIXED_BLUE) );
}
VirtualBoard.prototype.moveCaptured = function(node) 
{
	this.caged_locations.push([node.row, node.col]);
	this.cage.push(node.getKind());
	node.removeFromGrid();
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
}

VirtualBoard.prototype.updateFreeze = function() 
{
	// Convert red and blue pieces in the end rows to frozen pieces
	for (var c=0; c < board_size; c++) {
		// top row for blue
		var top_node = this.grid.getNodeAt(0,c);
		if( top_node.is(BOARD_BLUE) ) this.freezePiece(top_node);
		
		var bottom_node = this.grid.getNodeAt(board_size-1, c);
		if( bottom_node.is(BOARD_RED) ) this.freezePiece(bottom_node);	
	}
}

VirtualBoard.prototype.updateCoins = function() 
{
	var coins = this.getAllFromType(BOARD_COIN);
	
	for (var i=0; i < coins.length; i++) {
		var blue_adjacent = coins[i].getAdjacentsOfKind(BOARD_BLUE).length;
		var red_adjacent = coins[i].getAdjacentsOfKind(BOARD_RED).length;
		if(red_adjacent>=2) {
			this.replaceCoinWithType(coins[i], BOARD_RED);
			this.updateCoins(); // recursive check to see if new converted coin converts more coins
		}
		if(blue_adjacent>=2) {
			this.replaceCoinWithType(coins[i], BOARD_BLUE);
			this.updateCoins(); // recursive check to see if new converted coin converts more coins
		}
	}
}
VirtualBoard.prototype.checkCaptured = function(type) 
{
	var pieces = this.getAllFromType(type);
	for (var i=0; i < pieces.length; i++) {
		var opponent_type = (type===BOARD_RED)?BOARD_BLUE:BOARD_RED;
		var opponent_adjacent = pieces[i].getAdjacentsOfKind(opponent_type).length;
		if(opponent_adjacent >= 2 && !pieces[i].isAtLastRow()) {
			this.moveCaptured(pieces[i]);
		}
	}
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
	log(this.grid.toString());
}


/***** Strategy and Rewards *****/

VirtualBoard.prototype.calculateAllRewards = function() 
{
    //this.grid.calculateDijkstraRewards(this.grid.getNodesOfKind(BOARD_BLUE), 3, -1);
    
    // Go toward last row
    this.grid.calculateDijkstraRewards(this.grid.getNodesOfKindAtLastRow(BOARD_EMPTY), -8, 1);

    // Cluster
    //this.grid.calculateDijkstraRewards(this.grid.getNodesOfKind(BOARD_RED), -3, 1);
    
    // Coins
    this.grid.calculateDijkstraRewards(this.grid.getNodesOfKind(BOARD_COIN), -10, 1);
    
    var empty_nodes = this.grid.getNodesOfKind(BOARD_EMPTY);
    for(var i=0; i<empty_nodes.length; i++) {
        this.calculateNodeReward(empty_nodes[i]);
    }
}

VirtualBoard.prototype.calculateNodeReward = function(node) 
{
	//---------------------------------------------~
	var avoid_direct_danger_reward 		= 10;
	var indirect_danger_multiplier  	= 2;
	var fight_reward 		            = -12;
	//---------------------------------------------~
	
	//console.log("-------- REWARD for "+node.toString(true)+" ----");

	//node.forceReward(0);
	
	// 1a) Capture danger (direct)
	if(!node.isAtLastRow()) {
		var opponent_adjacents = node.getAdjacentsOfKind( BOARD_BLUE );
		if(opponent_adjacents.length >= 2) {
            node.addReward(avoid_direct_danger_reward);		
        } else if (opponent_adjacents.length >= 1) {
            // 1b) Capture danger (indirect)
            // Get all empty adjacenets, then check if any of these has BLUE adjancet to them
            var empty_adjacents = node.getAdjacentsOfKind( BOARD_EMPTY );
            var potential_danger = 0;
            for(var i=0; i<empty_adjacents.length; i++) {
                var blue_adjacents = empty_adjacents[i].getAdjacentsOfKind( BOARD_BLUE );
                if(blue_adjacents.length > 0) potential_danger++;
            }
            node.addReward(indirect_danger_multiplier * potential_danger);
        }
	}
	
	// 2) Capture opportunity
    if(!node.isAtLastRow()) {
		var opponent_adjacents = node.getAdjacentsOfKind( BOARD_BLUE );
        // has one adjacent blue
		if(opponent_adjacents.length == 1) {
            //...and this blue adjacent has at least one red adjacent
            var red_adjacents = opponent_adjacents[0].getAdjacentsOfKind( BOARD_RED );
            if(red_adjacents == 1) {
                node.addReward(fight_reward);
            }
        }
	}
	
	//console.log(">> TOTAL: "+node.toString(true)+ " -> "+node.getReward());
}

VirtualBoard.prototype.calculateMinimaxScore = function()
{
	var score = 0;
	score += (this.countAllFromType(BOARD_RED) - this.countAllFromType(BOARD_BLUE)) * this.minimax_score_piece;
	score += (this.countAllFromType(BOARD_FIXED_RED) - this.countAllFromType(BOARD_FIXED_BLUE)) * this.minimax_score_freeze;
	score += (this.countAllMovesFromType(BOARD_RED) - this.countAllMovesFromType(BOARD_BLUE)) * this.minimax_score_free_move;
	// Nearness to coins
	var reds_near_coins = this.grid.getNodesOfKindAdjacentToOtherKind(BOARD_RED, BOARD_COIN);
	score += reds_near_coins.length * this.minimax_score_nearness_to_coin;
	
	// TODO count winning and losing
	return score;
}

