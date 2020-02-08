/**
	Grid 
	...for easier board manipulation
*/
function Grid(width, height) 
{
	this.width = width;
	this.height = height;
	
	this.grid = [];
	this.init();
}
Grid.prototype = {
	init: function(){
		// Populate board with empty blocks
		for (var r=0; r < this.height; r++) {
			this.grid[r] = [];
			for (var c=0; c < this.width; c++) {
				this.grid[r][c] = 0;
				this.addNodeAt(new GridNode(BOARD_EMPTY),r,c);
			}
		}
	},
	copyFromOtherGrid: function(other_grid) {
		this.grid = [];
		this.width = other_grid.width;
		this.height = other_grid.height;
		
		for (var r=0; r < other_grid.height; r++) {
			this.grid[r] = [];
			for (var c=0; c < other_grid.width; c++) {
				this.grid[r][c] = 0;
				var copy = other_grid.getNodeAt(r,c).copy();
				this.addNodeAt(copy,r,c);
			}
		}
	},
	addNodeAt: function (node, row, col) 
	{
		node.row = row;
		node.col = col;
		node.grid = this;
		this.grid[row][col] = node;
	},
	addNodeAtFirstRow: function (node, col) 
	{
		this.addNodeAt(node, 0, col);
	},
	addNodeAtLastRow: function (node, col) 
	{
		this.addNodeAt(node, this.height-1, col);
	},
	moveNode: function(fromNode, toNode) {
		this.addNodeAt(fromNode.copy(), toNode.row, toNode.col);
		this.emptyNodeAt(fromNode.row, fromNode.col);
	},
	toString: function() {
		var str = "";
		for (var r=0; r < this.height; r++) {
			str+=this.grid[r].join(" ") + "\n";
		}
		return str;
	},
	printNodeRewards: function() {
		var str = "";
		for (var r=0; r < this.height; r++) {
			for (var c=0; c < this.width; c++) {
				str += this.getNodeAt(r,c).rewardToString()+"  ";
			}
			str+="\n\n";
		}
		return str;
	},
	resetRewards: function(){
		for (var r=0; r < this.height; r++) {
			for (var c=0; c < this.width; c++) {
				this.getNodeAt(r,c).forceReward(0);
			}
		}
	},
	getNodeAt: function(row, col) {
        if(row > this.height-1 || row < 0 || col < 0 || col > this.width-1) return null; // out of bounds
		return this.grid[row][col];
	},
	emptyNodeAt: function(row, col) {
		this.addNodeAt(new GridNode(BOARD_EMPTY), row, col);
	},
	getNodesOfKind: function(kind) {
		var nodes = [];
		for (var r=0; r < this.height; r++) {
			for (var c=0; c < this.width; c++) {				
				if(this.getNodeAt(r,c).is(kind)) nodes.push(this.getNodeAt(r,c));
			}
		}
		return nodes;
	},
	getNodesOfKindAdjacentToOtherKind: function(kind, other_kind) {
		// For example to get all red pieces that are 
		// adjacent to coins: getNodesOfKindAdjacentToOtherKind(red, coin)
		var nodes_of_other_kind = this.getNodesOfKind(other_kind);
		var nodes = [];
		for (var i=0; i < nodes_of_other_kind.length; i++) {
			nodes = nodes.concat(nodes_of_other_kind[i].getAdjacentsOfKind(kind));
		}
		return nodes;
	},
	getNodesOfKindAtRow: function(kind, row) {
		var nodes = [];
		for (var c=0; c < this.width; c++) {				
			if(this.getNodeAt(row,c).is(kind)) nodes.push(this.getNodeAt(row,c));
		}
		return nodes;
	},
	getNodesOfKindAtLastRow: function(kind) {
		return this.getNodesOfKindAtRow(kind, this.height-1);
	},
	getNodesOfKindAtFirstRow: function(kind) {
		return this.getNodesOfKindAtRow(kind, 0);
	},
    
    calculateDijkstraRewards: function(starting_nodes, start_score, step){
		// Inspired by Djkstra maps
        // http://www.roguebasin.com/index.php?title=Dijkstra_Maps_Visualized
        new DijkstraMapCalculator(starting_nodes, start_score, step);
	}
}


/****************************************************************************************
	Node in the grid
*/
function GridNode(kind) 
{
	this.kind = kind;
	this.row;
	this.col;
	this.grid;
	this.reward = 0;
}
GridNode.prototype = {
	
	isEmpty: function () 
	{
		return this.kind == BOARD_EMPTY;
	},
	isAtLastRow: function() {
		return this.row == this.grid.height-1;
	},
	isAtFirstRow: function() {
		return this.row == 0;
	},
	isAtLastCol: function() {
		return this.col == this.grid.width-1;
	},
	isAtFirstCol: function() {
		return this.col == 0;
	},
	getKind: function() {
		return this.kind;
	},
	setKind: function(kind) {
		this.kind = kind;
	},
	is: function(kind) {
		return (this.kind === kind);
	},
	toString: function(verbose) {
		if(verbose) return "Node ["+this.row+" "+this.col+"]("+this.kind+")";
		else return this.kind.toString();
	},
	getReward: function() {
		return this.reward;
	},
	forceReward: function(reward) {
		this.reward = reward;
	},
	addReward: function(increment) {
		this.reward += increment;	
		this.reward = Math.round(this.reward*1000) / 1000; // Round to 3 decimal places
	},
	rewardToString: function() {
		var rs = this.reward+"";
		if(rs.length < 5) {
			rs += (" ".repeat(5-rs.length));
		}
		return rs;
	},
	copy: function() {
		var new_node = new GridNode(this.kind);
		new_node.grid = this.grid;
		new_node.row = this.row;
		new_node.col = this.col;
		return new_node;
	},
	removeFromGrid: function(){
		this.grid.emptyNodeAt(this.row, this.col);
	},
	getAdjacents: function() {
		var nodes = [];
		
        // top
        var n1 = this.grid.getNodeAt(this.row-1, this.col);
		if(n1!==null) nodes.push(n1);
		// bottom
        var n2 = this.grid.getNodeAt(this.row+1, this.col);
        if(n2!==null) nodes.push(n2);
        // left
        var n3 = this.grid.getNodeAt(this.row, this.col-1);
		if(n3!==null) nodes.push(n3);
		// right
        var n4 = this.grid.getNodeAt(this.row, this.col+1);
		if(n4!==null) nodes.push(n4);
		
		return nodes;
	},
    getCorners: function() {
		var nodes = [];
		
        // top left
        var n1 = this.grid.getNodeAt(this.row-1, this.col-1);
		if(n1!==null) nodes.push(n1);
		// bottom left
        var n2 = this.grid.getNodeAt(this.row+1, this.col-1);
        if(n2!==null) nodes.push(n2);
        // top right
        var n3 = this.grid.getNodeAt(this.row-1, this.col+1);
		if(n3!==null) nodes.push(n3);
		// bottom right
        var n4 = this.grid.getNodeAt(this.row+1, this.col+1);
		if(n4!==null) nodes.push(n4);
		
		return nodes;
	},
    getSurroundings: function() {
		var adjacents = this.getAdjacents();
		var corners = this.getCorners();
        return adjacents.concat(corners);
	},
	getEmptyAdjacents: function() {
		return this.getAdjacentsOfKind(BOARD_EMPTY);
	},
	getAdjacentsOfKind: function(kind) {
		var nodes = [];
		var adjacents = this.getAdjacents();
		for (var i=0; i < adjacents.length; i++) {
			if(adjacents[i].is(kind)) nodes.push(adjacents[i]);
		};
		return nodes;
	},
    getSurroundingsOfKind: function(kind) {
		var nodes = [];
		var surrounding = this.getSurroundings();
		for (var i=0; i < surrounding.length; i++) {
			if(surrounding[i].is(kind)) nodes.push(surrounding[i]);
		}
		return nodes;
	}

}


//*******************************************************************

function DijkstraMapCalculator(start_nodes, start_score, step) 
{
	this.start_nodes = start_nodes;
	this.start_score = start_score;
	this.step = step;
    this.computed = [];
    this.todo = [];
    
    this.compute();
}
DijkstraMapCalculator.prototype = {
    compute: function () {
        this._add(this.start_nodes, this.start_score);
        while(this.todo.length > 0) {
            var item = this.todo.shift();
            this._setNodesScore(item.nodes, item.score);
        }
    },
    _setNodesScore: function (nodes, score) {
        for (var i=0; i < nodes.length; i++) {
            var node = nodes[i];
			if(this.computed.indexOf(node)!=-1) continue;
            this.computed.push(node);
            node.addReward(score);
		    var neighbors = node.getAdjacentsOfKind(BOARD_EMPTY);
            this._add(neighbors, score + this.step);
        }
    },
    _add: function(nodes, score) {
        this.todo.push({nodes:nodes, score:score});
    }
}