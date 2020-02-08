/**
	Agent class
	analyzes game board and decides best moves and outcomes
*/
function Agent() {}

Agent.prototype.performBestMove = function()
{
	this.performMinimaxMove();
}
Agent.prototype.performRewardsMove = function()
{
	console.log("******************************************");
	var html_board = ACTIVE_GAME.getBoard();
	var moves = html_board.getAllMovesFromType(BOARD_RED);
	var unique_next_nodes = []; // get all possible empty blocks that red can move to
	
    html_board.calculateAllRewards();
	
	console.log(html_board.getGrid().printNodeRewards());
	
	// Sort moves by score to move to positions with lowest score
	moves.sort(rewardCompare);
	
	// pick a random move from the top moves if the difference is not too big
    var diff_threshold = 2;
	var best_moves = [moves[0]];
    for(var i=0; i<moves.length;i++) {
        if(Math.abs( moves[i][1].getReward()-moves[0][1].getReward() )<diff_threshold) {
            best_moves.push(moves[i]);
        }
    }
    
	shuffle(best_moves);
	
	//console.log(">>> PICKED MOVE: ");
	//console.log(best_moves[0]);
	
	ACTIVE_GAME.commitAIMove(best_moves[0][0], best_moves[0][1]);
}

Agent.prototype.performMinimaxMove = function()
{
	console.log("******************** MINIMAX");
	var start_time = new Date().getTime();
	GLOBAL_MOVES = 0;
	
	var top_board = ACTIVE_GAME.getBoard();
	var moves = this.performMinimaxRound(null, top_board, ACTIVE_GAME.getCurrentTurn(), 1);
	this.performMinimaxSumScore(moves);
	moves.sort(scoreCompare);
	moves.reverse();
	
	// Pick a random moves from the moves with very similar score
	var acceptable_diff = 5;
	var similar_moves = [];
	similar_moves.push(moves[0]);
	for(var i=1; i<moves.length;i++) {
        if(Math.abs(moves[i].minimax_score - similar_moves[similar_moves.length-1].minimax_score) < acceptable_diff) {
			similar_moves.push(moves[i]);
		}
    }
	shuffle(similar_moves);
	
	var end_time = new Date().getTime()-start_time;
	
	log("Moves: "+GLOBAL_MOVES+"  in: "+end_time+" ms");
	log(moves);
	ACTIVE_GAME.commitAIMove(similar_moves[0].from_node, similar_moves[0].to_node);
}

Agent.prototype.performMinimaxSumScore = function(moves)
{
	for(var i=0; i<moves.length;i++) {
        moves[i].setMinimaxScoreSum();
    }
}
Agent.prototype.performMinimaxRound = function(move, board, turn, depth)
{
	var type = turn == TURN_RED ? BOARD_RED : BOARD_BLUE;
	var moves = board.getAllMovesFromType(type);
	var virtual_moves = [];
	
	for(var i=0; i<moves.length;i++) {
        var m = new VirtualMove(board, move, moves[i][0], moves[i][1], type, turn, depth);
		virtual_moves.push(m);
    }
	return virtual_moves;
}

Agent.prototype.performMinimaxBubbleUp = function(move)
{
	if(move.parent_move==null) return;
	
	var siblings = move.parent_move.children;
	log("UPPPP: "+move.turn+"   depth:"+move.depth+"  s:"+siblings.length);
	var min_score = 0;
	var max_score = 0;

	for(var i=0; i<siblings.length;i++) {
		min_score = Math.min(min_score, siblings[i].minimax_score);
		max_score = Math.max(max_score, siblings[i].minimax_score);
	}
	
	if(move.turn == TURN_RED) {
		move.parent_move.minimax_score += max_score;
		log("max "+max_score);
	} else {
		move.parent_move.minimax_score += min_score;
		log("min "+min_score);
	}
	this.performMinimaxBubbleUp(move.parent_move);
}

/**************************************************/

function VirtualMove(parent_board, parent_move, from_node, to_node, type, turn, depth) {
	this.parent_board = parent_board;
	this.parent_move = parent_move;
	this.from_node = from_node;
	this.to_node = to_node;
	this.type = type;
	this.turn = turn;
	this.depth = depth;
	this.minimax_score = null;
	this.children = [];
	if(this.parent_move!=null) this.parent_move.children.push(this);
	
	this.move();
}
VirtualMove.prototype.move = function() 
{
	GLOBAL_MOVES++;
	this.board = new VirtualBoard();
	this.board.copyFromBoard(this.parent_board);
	this.board.movePieceByCoords([this.from_node.row, this.from_node.col], [this.to_node.row, this.to_node.col], this.turn)
	if(this.depth < MINIMAX_MAX_DEPTH) {
		new Agent().performMinimaxRound(this, this.board, this.turn==TURN_RED?TURN_BLUE:TURN_RED, this.depth+1);
	}
	this.minimax_score = this.board.calculateMinimaxScore();
}
VirtualMove.prototype.setMinimaxScoreSum = function() 
{
	if(this.children.length>0) {
		for(var i=0;i<this.children.length;i++) {
			this.children[i].setMinimaxScoreSum();
		}
 		this.children.sort(scoreCompare);
		if(this.turn == TURN_BLUE) this.children.reverse();
		this.minimax_score += this.children[0].minimax_score;
		
		this.children = null; 	// Free up memory
		this.board = null;		//
	}
}
			

/**************************************************/


function rewardCompare(a, b) {
    if (a[1].getReward() === b[1].getReward()) {
        return 0;
    } else {
        return (a[1].getReward() < b[1].getReward()) ? -1 : 1;
    }
}

function scoreCompare(a, b) {
    if (a.minimax_score === b.minimax_score) {
        return 0;
    } else {
        return (a.minimax_score < b.minimax_score) ? -1 : 1;
    }
}




