window.onload = function() {
	

  
  // Preload a bunch of images (found in the css)
  
  preloadImages([
    'images/ajax-loader.gif',
    'images/icons/1-blue.png',
    'images/icons/2-blue.png',
    'images/icons/3-blue.png',
    'images/icons/4-blue.png',
    'images/icons/5-blue.png',
    'images/icons/1.png',
    'images/icons/2.png',
    'images/icons/3.png',
    'images/icons/4.png',
    'images/icons/5.png'
  ]);
	
	// figure out the device's resolution and adjust html dimension accordingly
	adjustForScreenDimensions();
	
	// create new objects
	penDrawing = new drawing('path');
	mazeDrawing = new drawing('maze');
	storage = new storage();
	events = new events();
	maze = new maze();
	
	if (storage.isAvailable() && !resolutionHasChanged()) {
		// check if a maze has been stored locally and restore it. If false create a new one
		if (window.localStorage.getItem("mazeDrawing") != null) {
			mazeDrawing.restoreImage(storage.loadValueByKey("mazeDrawing"),"mazeDrawing");
			highLightButton(storage.loadValueByKey("difficulty"));
		} else {
			createNewMaze(3);
		}
	
		// check if a path drawing has been stored locally
		if (window.localStorage.getItem("penDrawing") != null) {
			penDrawing.restoreImage(storage.loadValueByKey("penDrawing"),"penDrawing");
		}
		
		// check if a line Width has been stored locally and retrieve it
		if (window.localStorage.getItem("lineWidth") != null) {
			penDrawing.setLineWidth(storage.loadValueByKey("lineWidth"),"penDrawing");
		}
		
		showWorkingOverlay('done');
		
	} else {
		createNewMaze(3);
	}
	

		   
};

// Events Object

function events() {
	
	//various methods
	this.initListenersFor = initListenersFor;
	this.deviceType = deviceType;
	
	if (this.deviceType() == "touch") {
		this.initListenersFor("touch");
	} else {
		this.initListenersFor("mouse");
	}
}

function deviceType() {
	
	var deviceAgent = navigator.userAgent.toLowerCase();
	var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
	if (agentID) {
		return "touch";
	} else {
		return "mouse";
	}
}


function initListenersFor(interaction) {

    if (interaction  == "touch") {
    	
    	var touch, multiplier = 1;
		if( window.devicePixelRatio >= 2 ) {
			multiplier = 2;
		}
		
    	/* prevent scrolling on iOS
    	document.addEventListener('touchmove', function (e) {
    		e.preventDefault();
    	}, false);
		*/
        
    	//start drawing a line on mousedown
        document.addEventListener('touchstart', function (e) {
		    if (e.touches.length == 1) {
		        // Get the information for finger #1
		        touch = e.touches[0];
		        penDrawing.startLineAt(touch.pageX*multiplier, touch.pageY*multiplier);
		    }
    	}, false);
    
        //stop drawing a line on mouseup
        document.addEventListener('touchend', function() {
    		penDrawing.stopLine();
			if( window.devicePixelRatio < 2 ) {
				//don't save the path on retina diaply (too slow :()
				storage.saveKeyValue("penDrawing", penDrawing.returnImageData());
			}
    	}, false);
    	
    	// update path for the line when the mouse moves and the status is set to draw
        document.addEventListener('touchmove', function (e) {
			
			e.preventDefault();
			
			// Only deal with one finger
            if (penDrawing.drawLine) {
			    if (e.touches.length == 1) {
			        // Get the information for finger #1
			        touch = e.touches[0];
			        penDrawing.drawLineTo(touch.pageX*multiplier, touch.pageY*multiplier);
			    }
			}  
       	}, false);
		
        $("#level1").bind('touchend', function(e) {
            selectLevel(1);  
       	});
        $("#level2").bind('touchend', function(e) {
            selectLevel(2);  
       	});
        $("#level3").bind('touchend', function(e) {
            selectLevel(3);  
       	});
        $("#level4").bind('touchend', function(e) {
            selectLevel(4);  
       	});
        $("#level5").bind('touchend', function(e) {
            selectLevel(5);  
       	});
		
       
	} else if (interaction  == "mouse") {
    	
		$(window).resize(function () {
			showWorkingOverlay('working');
			setTimeout('adjustForScreenDimensions();', 200);
			setTimeout('createNewMaze(3);', 500);
	 	});
		
    	//start drawing a line on mousedown
        $(document).bind('mousedown', function(e) {
    		penDrawing.startLineAt(e.pageX, e.pageY);
    	});
    
        //stop drawing a line on mouseup
        $(document).bind('mouseup', function() {
    		penDrawing.stopLine();
    		storage.saveKeyValue("penDrawing", penDrawing.returnImageData());
    	}); 
    	
    	
    	
    	// update path for the line when the mouse moves and the status is set to draw
        $(document).bind('mousemove', function(e) {
            if (penDrawing.drawLine) {
    			penDrawing.drawLineTo(e.pageX, e.pageY);
            }    
       	});
		
		
        $("#level1").bind('click', function(e) {
            selectLevel(1);  
       	});
        $("#level2").bind('click', function(e) {
            selectLevel(2);  
       	});
        $("#level3").bind('click', function(e) {
            selectLevel(3);  
       	});
        $("#level4").bind('click', function(e) {
            selectLevel(4);  
       	});
        $("#level5").bind('click', function(e) {
            selectLevel(5);  
       	});
		
       
	}
}




// Drawing Object

function drawing(canvasID) {
	this.canvas = document.getElementById(canvasID);
	this.context = this.canvas.getContext("2d");
	this.context.globalAlpha = 1;
	this.wallSideColor = "rgb(180,180,180)";
	this.treasureColor = "rgb(250,230,0)";
	this.exitColor = "rgb(0,255,0)";
	this.entryColor = "rgb(255,0,0)";
	this.wallTopColor = "rgb(0,0,0)";
	this.penColor = "rgb(255,0,0)";
	this.allowMultipleLines = false;
	this.drawLine = false;
	
	//various methods
	this.drawLineTo = drawLineTo;
	this.startLineAt = startLineAt;
	this.stopLine = stopLine;
	this.renderMaze = renderMaze;
	this.clearDrawing = clearDrawing;
	this.restoreImage = restoreImage;
	this.returnImageData = returnImageData;
	this.setLineWidth = setLineWidth;
}


//methods for the drawing object

function drawLineTo(x, y) {
	// method of drawing object
	
	// extend the path to target coordinates
	this.context.lineTo(x,y);
	
	// draw the entire path
	this.context.stroke();
}

function setLineWidth(width) {
	// method of drawing object
	
	this.context.lineWidth = width;
	
	// store new line width locally
	storage.saveKeyValue("lineWidth",width);
}


function startLineAt(x,y) {
	// method of drawing object	
	
	
	this.context.strokeStyle = this.penColor;
	this.context.lineJoin = "round";
    this.context.lineCap = "round";
	
	// check if multiple lines are allowed
	if (!this.allowMultipleLines) {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.beginPath();
	}
		
	// move the pen to the current position
	this.context.moveTo(x,y);
	// set the status to true so that an actual line is drawn as the mouse is moved
	this.drawLine = true;
}

function stopLine() {
	// method of drawing object	
	
	// set the status to false so that no line is drawn as the mouse is moved
	this.drawLine = false;
}

function clearDrawing() {
	// method of drawing object
	
	// close any open path
	this.context.closePath();
	// wipe the canvas
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	if (this.allowMultipleLines) {
		// start a new path
		this.context.beginPath();
	}
	
	
}

function renderMaze(maze) {
	// method of drawing object
	
	// clear the canvas
	this.clearDrawing();
	
	// calculate ideal pixel width based on canvas and maze dimensions leaving one pixel all around
	var pixelWidth = Math.floor(this.canvas.width / (maze.cols+1));
	var pixelHeight = Math.floor(this.canvas.height / (maze.rows+1));
	
	maze.wallPadding = Math.floor(pixelWidth / 10);
	
	// calculate visual depth for 3d effect
	var depth = Math.floor(pixelHeight/3);
	
	// calculate offset to make sure maze is centered within the canvas
	var xOffset = Math.floor((this.canvas.width - pixelWidth * maze.cols) / 2);
	var yOffset = Math.floor((this.canvas.height - pixelHeight * maze.rows) / 2);	
	
	
	
	this.context.fillStyle = this.wallSideColor;
	for(d=depth; d>-1;d--){
		if (d == 0) {
			this.context.fillStyle = this.wallTopColor;
		}
		for(var y=0; y<maze.rows;y++){
			for(var x=0; x<maze.cols; x++){
				if (maze.field[y][x] == '#') {
					this.context.fillRect (x*pixelWidth-maze.wallPadding+xOffset+d,y*pixelHeight-maze.wallPadding+yOffset+d,pixelWidth+maze.wallPadding*2,pixelHeight+maze.wallPadding*2);
				} else if (maze.field[y][x] == '*' && (d==depth)) {
					// rendering the treasures
					this.context.fillStyle = this.treasureColor;					
					this.context.fillRect (x*pixelWidth+2*maze.wallPadding+xOffset+d,y*pixelHeight+2*maze.wallPadding+yOffset+d,pixelWidth-2*maze.wallPadding*2,pixelHeight-2*maze.wallPadding*2);
					this.context.fillStyle = this.wallSideColor;

				} else if (maze.field[y][x] == 'e' && (d==depth)) {
					// rendering the exit (e = end)
					this.context.fillStyle = this.exitColor;					
					this.context.fillRect (x*pixelWidth+2*maze.wallPadding+xOffset+d,y*pixelHeight+2*maze.wallPadding+yOffset+d,pixelWidth-2*maze.wallPadding*2,pixelHeight-2*maze.wallPadding*2);
					this.context.fillStyle = this.wallSideColor;
				} else if (maze.field[y][x] == 's' && (d==depth)) {
					// rendering the entry (s = start)
					this.context.fillStyle = this.entryColor;					
					this.context.fillRect (x*pixelWidth+2*maze.wallPadding+xOffset+d,y*pixelHeight+2*maze.wallPadding+yOffset+d,pixelWidth-2*maze.wallPadding*2,pixelHeight-2*maze.wallPadding*2);
					this.context.fillStyle = this.wallSideColor;
				}
				
			}
		}
	}
	// update pen drawing width to match the new canvase pixel dimensions
	penDrawing.setLineWidth(Math.floor(pixelWidth / 1.5));
}

function restoreImage(imageData,type) {
	var image = new Image();
	image.src = imageData;
	
	//hack to make sure the image is drawn when page is loaded. sigh
	if (type == "mazeDrawing") {
		image.onload = function () {
		    mazeDrawing.context.drawImage(image, 0, 0);
		}
	} else if (type == "penDrawing") {
		image.onload = function () {
		    penDrawing.context.drawImage(image, 0, 0);
		}
	}
	
}

function returnImageData() {
	return this.canvas.toDataURL("image/png"); 
}






// Storage Object

function storage() {
	
	//various methods
	this.isAvailable = isAvailable;
	this.saveKeyValue = saveKeyValue;
	this.removeKeyValueByKey = removeKeyValueByKey;
	this.clearAll = clearAll;
	this.loadValueByKey = loadValueByKey;
	
}


function isAvailable() {
	if (window.localStorage) {
		return true;
	} else {
		return false;
	}
}

function saveKeyValue(key, value) {
	window.localStorage.setItem(key,value);
}

function loadValueByKey(key) {
	return window.localStorage.getItem(key);
}

function removeKeyValueByKey(key) {
	window.localStorage.removeItem(key);    
}

function clearAll() {
	window.localStorage.clear();
}






// Maze Object

function maze() {
	//parameter branchrate:
	//zero is unbiased, positive will make branches more frequent, negative will cause long passages
	//this controls the position in the list chosen: positive makes the start of the list more likely,
	//negative makes the end of the list more likely
	//large negative values make the original point obvious
	//try values between -10, 10. 'random' woll use different values thorughout the maze generation.
	
	this.nodiagonals = 1;
	
	// various methods
	this.generateMaze = generateMaze;
	this.carve = carve;
	this.harden = harden;
	this.check = check;
	this.addEntryAndExit = addEntryAndExit;
	this.addTreasures = addTreasures;
}

function addTreasures() {
	var xchoice, ychoice, i = 0;
	
	//the number of treasures
	var numberOfTreasures = Math.floor(Math.random()*this.cols/30)+1;
	
	// loop to randomly place the treasures in the finished maze
	while (i < numberOfTreasures) {
		xchoice = Math.floor(Math.random()*(this.cols-2))+1;
		ychoice = Math.floor(Math.random()*(this.rows-2))+1;
		if (this.field[ychoice][xchoice] == ".") {
			this.field[ychoice][xchoice] = "*";
			i++;
		}
	}
	
	
}

function addEntryAndExit() {
	//find suitable exit col at the top (where there is an adjacent path) and carve path
	for(var x=0; x<this.cols;x++){
		if (this.field[1][x] == ".") {
			this.field[0][x] = "e";
			break;
		};
	}
	//find entry col at the bottom (where there is an adjacent path) and carve path
	for(var x=this.cols-1; x>0;x--){
		if (this.field[this.rows-2][x] == ".") {
			this.field[this.rows-1][x] = "s";
			break;
		};
	}
}

function generateMaze(cols, rows, branchrate) {
	// method of maze object
	
	this.cols = cols;
	this.rows = rows;
	this.field = new Array();
	this.frontier = new Array();
	this.branchrate = branchrate;
	
	//create empty grid (filled with ?'s)
	for(var i=0; i<this.rows;i++){
		var row = new Array();
		for(var ii=0; ii<this.cols; ii++){
			row.push('?');
		}
		this.field.push(row);
	}
	
	// find random start position indise the maze (avoid outer walls)
	var xchoice = Math.floor(Math.random()*(this.cols-2))+1;
	var ychoice = Math.floor(Math.random()*(this.rows-2))+1;
	this.carve(new Array(ychoice, xchoice));	
	
	// loop to generate the actual maze
	while(this.frontier.length > 0){
		var pos = Math.random();
		if (this.branchrate == 'random') {
			var branchrate = Math.random()*10-4; //random ness factor. Edit for different results
		}
		pos = Math.pow(pos,Math.pow(Math.E,-branchrate));
		var rpos = Math.floor(pos * this.frontier.length);
		var choice = this.frontier[rpos];
		if (this.check(choice)){
			this.carve(choice);
		} else {
			this.harden(choice);
		}
		this.frontier.splice(rpos,1);
	}
	
	// clean up any leftover fields
	for(var iy=0; iy<this.rows; iy++){
		for(var ix=0; ix<this.cols; ix++){
			if(this.field[iy][ix] == '?'){ this.field[iy][ix] = '#'; }
		}
	}
	
	this.addTreasures();
	this.addEntryAndExit();
}


function check(posi) {
	// method of maze object
	
	var y = posi[0]; var x = posi[1];
	
	var edgestate = 0;
	if (x > 0) {
		if (this.field[y][x-1] == '.'){
			edgestate += 1 ;
		}
	}
	if (x < this.cols-1){
		if (this.field[y][x+1] == '.'){
			edgestate += 2;
		}
	}
	if (y > 0){
		if (this.field[y-1][x] == '.'){
			edgestate += 4;
		}
	}
	if (y < this.rows-1){
		if (this.field[y+1][x] == '.'){
			edgestate += 8 ;
		}
	}
	if(this.nodiagonals){
		if (edgestate == 1){
			if (x < this.cols-1){
				if (y > 0){
					if (this.field[y-1][x+1] == '.'){
						return 0;
					}
				}
				if (y < this.rows-1){
					if (this.field[y+1][x+1] == '.'){
						return 0;
					}
				}
				return 1;
			}
		}
		else if ( edgestate == 2){
			if (x > 0){
				if (y > 0){
					if (this.field[y-1][x-1] == '.'){
						return 0;
					}
				}
				if (y < this.rows-1){
					if (this.field[y+1][x-1] == '.'){
						return 0;
					}
				}
				return 1;
			}
		}
		else if ( edgestate == 4){
			if (y < this.rows-1){
				if (x > 0){
					if (this.field[y+1][x-1] == '.'){
						return 0;
					}
				}
				if (x < this.cols-1){
					if (this.field[y+1][x+1] == '.'){
						return 0;
					}
				}
				return 1;
			}
		}
		else if ( edgestate == 8){
			if (y > 0){
				if (x > 0){
					if (this.field[y-1][x-1] == '.'){
						return 0;
					}
				}
				if (x < this.cols-1){
					if (this.field[y-1][x+1] == '.'){
						return 1;
					}
				}
				return 1;
			}
		}
		return 0;
	}
	else {
		var diags = new Array(1,2,4,8);
		if( arrayCount(diags,edgestate) ){
			return 1;
		}
		return 0;
	}
}





function carve(posi) {
	// method of maze object
	
	var y = posi[0]; var x = posi[1];
	var extra = new Array();
	this.field[y][x] = '.' ;
	if (x > 0){
		if (this.field[y][x-1] == '?') {
			this.field[y][x-1] = ',';
			extra.push(new Array(y,x-1));
		}
	}
	if (x < this.cols - 1){
		if (this.field[y][x+1] == '?') {
			this.field[y][x+1] = ',';
			extra.push(new Array(y,x+1));
		}
	}
	if (y>0){
		if (this.field[y-1][x] == '?') {
			this.field[y-1][x] = ',';
			extra.push(new Array(y-1,x));
		}
	}
	if (y < this.rows - 1){
		if (this.field[y+1][x] == '?') {
			this.field[y+1][x] = ',';
			extra.push(new Array(y+1,x));
		}
	}
	extra = shuffle(extra);
	this.frontier = this.frontier.concat(extra);
}

function harden(posi) {
	// method of maze object
		
	//make the cell at y,x a wall
	var y = posi[0]; var x = posi[1];
	this.field[y][x] = '#';
}



//helper functions

function createNewMaze(difficulty) {
	
	var resolution = new Array(20,40,60,112,145,300);
	var aspectRatio = mazeDrawing.canvas.width / mazeDrawing.canvas.height;
	//clear locally stored drawings
	removeKeyValueByKey("mazeDrawing");
	removeKeyValueByKey("penDrawing");
	removeKeyValueByKey("lineWidth");
	
	//clean any path that may exist
	penDrawing.clearDrawing();
		
	//apply new parameters to the maze object
	maze.generateMaze(Math.floor(aspectRatio*resolution[difficulty-1]),resolution[difficulty-1],"random");
	
	// (re-)render the maze
	mazeDrawing.renderMaze(maze);
	
	//save new maze locally
	storage.saveKeyValue("mazeDrawing", mazeDrawing.returnImageData());
	
	//save difficulty locally
	storage.saveKeyValue("difficulty", difficulty);
	
	setTimeout("showWorkingOverlay('done');", 10);
	
}

function shuffle(o) { //v1.0
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

function debug(txt){
	console.info(txt);
}

function sleep(ms) {
		var dt = new Date();
		dt.setTime(dt.getTime() + ms);
		while (new Date().getTime() < dt.getTime());
	}
	
function resolutionHasChanged() {
	if (storage.loadValueByKey("windowHeight") == $(window).height() && storage.loadValueByKey("windowWidth") == $(window).width()) {
		return false;
	} else {
		storage.saveKeyValue("windowHeight",$(window).height());
		storage.saveKeyValue("windowWidth",$(window).width());
		return true;
	}
}

function showWorkingOverlay(action) {
	if (action == "working") {
		// show loading
		$('#working').show();
		$('#mazeContainer').hide();
		$('#pathContainer').hide();
	} else if (action == "done") {
		// hide loading
		$('#working').hide();
		$('#mazeContainer').fadeIn("200");
		$('#pathContainer').show();
	}
}



function adjustForScreenDimensions() {
	
	// check if retina display
	if( window.devicePixelRatio >= 2) {
		// set canvas dimensions to 2x to make use of the retina display!
		$('#mazeContainer').height($(window).height()-90);
		$('#mazeContainer').width($(window).width());
		$('#pathContainer').height($(window).height());
		$('#pathContainer').width($(window).width());
		$('#maze').attr('height',2*$(window).height()-180);
		$('#maze').attr('width',2*$(window).width());
		$('#path').attr('height',2*$(window).height());
		$('#path').attr('width',2*$(window).width());
		$('#visualNoise').addClass('retina');
	} else {
		// set canvas dimensions
		$('#mazeContainer').height($(window).height()-90);
		$('#mazeContainer').width($(window).width());
		$('#pathContainer').height($(window).height());
		$('#pathContainer').width($(window).width());
		$('#maze').attr('height',$(window).height()-90);
		$('#maze').attr('width',$(window).width());
		$('#path').attr('height',$(window).height());
		$('#path').attr('width',$(window).width());
	}

}

function selectLevel(level) {
	showWorkingOverlay('working');
	setTimeout('createNewMaze('+level+');', 10);
	highLightButton(level);
}

function highLightButton(level) {
	$(".current").removeClass('current');
	$('#level'+level).addClass('current');
}

function preloadImages(arrayOfImages) {
  $(arrayOfImages).each(function(){
                        $('<img/>')[0].src = this;
                        // Alternatively you could use:
                        // (new Image()).src = this;
                        });
}