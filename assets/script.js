var testing = false;
var len = 8;
var radius = 29;
var interVal = 80;
var wid = 640;
var canvas;
var context;
var movingColor;
var movingX;
var movingY;
var moved;
var clicked;
var boards = new Array(len);
var ballNum;
var totalScore;
var redoTimes;
var mostRodeTimes;
var rdCleard; /* had a scoring alignment by a random ball */
var cleard;
var clearX; /* this is the position of a moved ball last time */
var clearY;
var clearColor;
var gameover;
var forReloadCookie;

var prevBds = new Array(len);
var prevBallNum;
var prevScore;
var prevClicked;
var prevMovingColor;
var prevMovingX;
var prevMovingY;
var prevCleard;
var prevClearX; /* this is the position of a moved ball last time */
var prevClearY;
var prevClearColor;
var prevRdCleard;

var path;

var requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	function(callback) {
		return setTimeout(callback, 16);
	};

function initBoard() {
	for (var i = 0; i < len; i++) {
		boards[i] = new Array(len);
		prevBds[i] = new Array(len);
		for (var j = 0; j < len; j++) {
			boards[i][j] = 0;
			prevBds[i][j] = 0;
		}
	}
}

function rdBalls(n) {
	if (ballNum + n <= len * len) {
		for (var i = 0; i < n; i++) {
			rdBall();
		}
	} else {
		forReloadCookie = false;
		gameOver();
	}
	setTimeout(checkOver, 345);
}

function checkOver() {
	if (ballNum == len * len) {
		forReloadCookie = false;
		gameOver();
	}
}

function rdBall() { // try this.x this kind of varible
	if (ballNum < len * len) {
		this.x = Math.floor(Math.random() * len);
		this.y = Math.floor(Math.random() * len);
		this.color = Math.floor(Math.random() * 6) + 1;

		while (boards[this.x][this.y] != 0) {
			this.x = Math.floor(Math.random() * len);
			this.y = Math.floor(Math.random() * len);
		}

		theBall(this.x, this.y, this.color);
		if (canClear(this.x, this.y, this.color, 243) > 4) {
			setCookie("board", boards, 60);
			setCookie("score", totalScore, 60);
			setCookie("redo", redoTimes, 60);
			rdCleard = true;
			clicked = false;
		}
	}
}

function theBall(x, y, color) {
	ballNum++;
	if (boards[x][y] == 0) {
		boards[x][y] = parseInt(color);
		var ballA = {
			'x': x,
			'y': y,
			'c': getColor(color),
			'r': 0
		}

		var renderA = function() {
			// Clear the canvas
			context.clearRect(interVal / 2 * (2 * ballA.x + 1) - interVal / 2 + 1, interVal / 2 * (2 * ballA.y + 1) - interVal / 2 + 1, interVal - 3, interVal - 3);
			// Draw the square
			if (clicked) {
				highLight(movingX, movingY, movingColor);
			}
			context.beginPath();
			context.arc(interVal / 2 * (2 * ballA.x + 1), interVal / 2 * (2 * ballA.y + 1), ballA.r, 0, Math.PI * 2, true);
			context.closePath();
			context.fillStyle = ballA.c;
			if (boards[ballA.x][ballA.y] > 0) {
				context.fillStyle = getColor(boards[ballA.x][ballA.y]);
			}
			context.fill();

			// Redraw
			if (boards[ballA.x][ballA.y] > 0) {
				requestAnimationFrame(renderA);
			}
		};

		var animateA = function(prop, val, duration) {
			// The calculations required for the step function
			var start = new Date().getTime();
			var end = start + duration;
			var current = ballA[prop];
			var distance = val - current;

			var step = function() {
				// Get our current progres
				var timestamp = new Date().getTime();
				var progress = Math.min((duration - (end - timestamp)) / duration, 1);

				// Update the square's property
				ballA[prop] = current + (distance * progress);

				// If the animation hasn't finished, repeat the step.
				if (progress < 1 && boards[ballA.x][ballA.y] > 0) requestAnimationFrame(step);
			};

			// Start the animation
			return step();
		};

		renderA();
		animateA('r', ballA['r'] + radius, 256);
	}
}

function ball(x, y, color) {
	boards[x][y] = parseInt(color);
	context.fillStyle = getColor(color);
	context.beginPath();
	context.arc(interVal / 2 * (2 * x + 1), interVal / 2 * (2 * y + 1), radius, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

function getColor(color) {
	switch (color) {
		case 1: // green
			return '#66CDAA';
			break;
		case 2: // blue
			return '#6495ED';
			break;
		case 3: // orange
			return '#FF7F24';
			break;
		case 4: // red
			return '#EE2C2C';
			break;
		case 5: // purple
			return '#9B30FF';
			break;
		case 6: // cyan
			return '#00EEEE';
			break;
		default:
			return "white";
	}
}

function rmTheBall(x, y) {
	var color = boards[x][y];
	boards[x][y] = 0;
	var ballA = {
		'x': x,
		'y': y,
		'c': getColor(color),
		'r': radius
	}
	var renderA = function() {
		// Clear the canvas
		context.clearRect(interVal / 2 * (2 * ballA.x + 1) - interVal / 2 + 1,
			interVal / 2 * (2 * ballA.y + 1) - interVal / 2 + 1,
			interVal - 3, interVal - 3);
		// Draw the square
		context.beginPath();
		context.arc(interVal / 2 * (2 * ballA.x + 1), interVal / 2 * (2 * ballA.y + 1), ballA.r, 0, Math.PI * 2, true);
		context.closePath();
		context.fillStyle = ballA.c;
		context.fill();

		// Redraw
		requestAnimationFrame(renderA);
	};

	var animateA = function(prop, val, duration) {
		// The calculations required for the step function
		var start = new Date().getTime();
		var end = start + duration;
		var current = ballA[prop];
		var distance = val - current;

		var step = function() {
			// Get our current progres
			var timestamp = new Date().getTime();
			var progress = Math.min((duration - (end - timestamp)) / duration, 1);

			// Update the square's property
			ballA[prop] = current + (distance * progress);

			// If the animation hasn't finished, repeat the step.
			if (progress < 1) requestAnimationFrame(step);
		};

		// Start the animation
		return step();
	};

	renderA();
	animateA('r', ballA['r'] + 3, 128);
	setTimeout(animateA, 140, 'r', ballA['r'] - 3 - radius, 188);
}

function rmRect(x, y) {
	boards[x][y] = 0;
	context.fillStyle = 'white';
	context.fillRect(x * interVal + 1, y * interVal + 1, interVal - 2, interVal - 2);
}

function rmBall(x, y) {
	if (boards[x][y] != 0) {
		rmTheBall(x, y);
		ballNum--;
	}
}

function pathBall(x, y) {
	context.fillStyle = '#deeded';
	context.beginPath();
	context.arc(interVal / 2 * (2 * x + 1), interVal / 2 * (2 * y + 1), 15, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

// when clicked a cell make it high light
function highLight(x, y, color) {
	context.fillStyle = '#eeeeee';
	context.fillRect(x * interVal + 1, y * interVal + 1, interVal - 2, interVal - 2);
	ball(x, y, color);
}

function gameOver() {
	if (redoTimes < mostRodeTimes) {
		if (window.confirm("Gave over! You still have " + (mostRodeTimes - redoTimes) + " redo times, use it? \nClick cancel to start a new game.")) {
			reDO();
			forReloadCookie = true;
		} else {
			drawNew();
		}
	} else {
		gameover = true;
		if (window.confirm("Gave over! Wanna a new game?")) {
			drawNew();
		}
	}
}

function init() {
	lines();
	initBoard();
	ballNum = 0;
	movingColor = 0;
	moved = false;
	clicked = false;
	cleard = false;
	rdCleard = false;
	totalScore = 0;
	redoTimes = 0;
	mostRodeTimes = 3;
	gameover = false;
	forReloadCookie = true;
	updateScore();

	if (testing) {
		theBall(2, 2, 3);
		theBall(5, 3, 4);
		theBall(5, 4, 5);
		theBall(5, 5, 5);
		theBall(2, 5, 2);
		theBall(3, 2, 2);
		theBall(4, 2, 6);
		theBall(5, 2, 1);
	} else {
		var boardS = getCookie('board');
		if (boardS != null && boardS != "") {
			totalScore = parseInt(getCookie('score'));
			redoTimes = parseInt(getCookie('redo'));
			updateScore();
			for (var i = 0; i < boardS.length; i++) {
				if (Math.floor(i % 2) == 0) {
					var t = parseInt(boardS[i]);
					if (t > 0) {
						var xi = Math.floor(i / 2 / len);
						var yi = Math.floor(i / 2 % len);
						theBall(xi, yi, t);
					}
				}
			}
		} else {
			totalScore = 0;
			rdBalls(3);
		}
	}
}

function drawBoard() { // main function is here
	canvas = document.getElementById("board");
	if (canvas.getContext) {
		context = canvas.getContext("2d");
		init();
	}
}

function lines() {
	context.beginPath();
	for (var i = 1; i < 9; i++) {
		context.moveTo(0, interVal * i);
		context.lineTo(wid, interVal * i);
		context.moveTo(interVal * i, 0);
		context.lineTo(interVal * i, wid);
	}
	context.strokeStyle = '#0574da';
	context.stroke();
	context.restore();
	context.closePath();
}

function clearAll() {
	for (var i = 0; i < len; i++) {
		for (var j = 0; j < len; j++) {
			rmBall(i, j);
		}
	}
}

function restart() {
	if (window.confirm("Want a new game?")) {
		drawNew();
	} else {
		return;
	}
}

function drawNew() {
	setCookie("board", "", 0);
	setCookie("score", 0, 0);
	setCookie("redo", 0, 0);
	location.reload();
}

function redo() {
	if (prevScore != undefined && moved == true) {
		if (redoTimes < mostRodeTimes) {
			if (window.confirm("After this redo you still have " + (mostRodeTimes - redoTimes - 1) + " redo times")) {
				reDO();
			}
		} else {
			alert("You have at most " + mostRodeTimes + " redo times");
		}
	} else {
		if (redoTimes < mostRodeTimes) {
			alert("you still have " + (mostRodeTimes - redoTimes) + " redo times\n(redo only works after you moved a ball IMMEDIATELY)");
		} else {
			alert("You have at most " + mostRodeTimes + " redo times");
		}
	}
}

function reDO() {
	clearAll(); // clear balls on the board and redraw
	for (var i = 0; i < len; i++) {
		for (var j = 0; j < len; j++) {
			var t = prevBds[i][j];
			if (t > 0) {
				setTimeout(theBall, 300, i, j, t);
			}
		}
	}
	cleard = prevCleard;
	clearX = prevClearX;
	clearY = prevClearY;
	clearColor = prevClearColor;
	rdCleard = prevRdCleard;
	totalScore = prevScore;
	clicked = prevClicked;
	movingColor = prevMovingColor;
	movingX = prevMovingX;
	movingY = prevMovingY;
	moved = false;
	gameover = false;
	updateScore();
	redoTimes++;
	setTimeout(setCookie, 2, "board", prevBds, 60);
	setTimeout(setCookie, 2, "score", totalScore, 60);
	setTimeout(setCookie, 2, "redo", redoTimes, 60);
}

function hashXY(x, y) {
	// hash coordinate x and y to make it easy to judge if positions are eqauls
	return (x + parseFloat("0." + y.toString()));
}

function pos(x, y, parent) {
	// position object
	this.x = x;
	this.y = y;
	this.parent = parent;
}

function vld(x, y) {
	// check a position if is valid or not
	return x < 8 && y < 8 && x >= 0 && y >= 0 && boards[x][y] == 0;
}

function getDis(x1, y1, x2, y2) {
	// get the distance from one position to another position
	// actually this is Manhattan Distance, MD = |x1 - x2| + |y1 - y2| * D where D is 1 here
	return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}


function _canMove(x, y) {
	// A* algorithm idea is studied from below, ALL codes are written by Yuchao
	// http://www.gamedev.net/page/resources/_/technical/artificial-intelligence/a-pathfinding-for-beginners-r2003
	var t = null;
	var visited = new Object();
	var open = new Object();
	var q = new Array();
	var found = false;
	q.push(new pos(movingX, movingY, null));
	open[hashXY(movingX, movingY)] = null;

	while (q != "") {
		t = q.shift();
		var tx = t.x
		var ty = t.y;
		delete open[hashXY(tx, ty)];
		visited[hashXY(tx, ty)] = null;
		if (tx == x && ty == y) {
			found = true;
			break;
		} else {
			var rf = hashXY(tx + 1, ty);
			var lf = hashXY(tx - 1, ty);
			var uf = hashXY(tx, ty - 1);
			var df = hashXY(tx, ty + 1);
			var gOld = getDis(tx, ty, movingX, movingY); // distance from start position
			if (!(rf in visited)) { // right
				if (vld(tx + 1, ty) && !(rf in open)) {
					q.push(new pos(tx + 1, ty, t));
					open[hashXY(tx + 1, ty)] = null;
				} else if (rf in open) {
					if (getDis(tx + 1, ty, movingX, movingY) < gOld) {
						pos(tx + 1, ty, t);
					}
				}
			}
			if (!(df in visited)) { // down
				if (vld(tx, ty + 1) && !(df in open)) {
					q.push(new pos(tx, ty + 1, t));
					open[hashXY(tx, ty + 1)] = null;
				} else if (df in open) {
					if (getDis(tx, ty + 1, movingX, movingY) < gOld) {
						pos(tx, ty + 1, t);
					}
				}
			}
			if (!(lf in visited)) { // left
				if (vld(tx - 1, ty) && !(lf in open)) {
					q.push(new pos(tx - 1, ty, t));
					open[hashXY(tx - 1, ty)] = null;
				} else if (lf in open) {
					if (getDis(tx - 1, ty, movingX, movingY) < gOld) {
						pos(tx - 1, ty, t);
					}
				}
			}
			if (!(uf in visited)) { // up
				if (vld(tx, ty - 1) && !(uf in open)) {
					q.push(new pos(tx, ty - 1, t));
					open[hashXY(tx, ty - 1)] = null;
				} else if (uf in open) {
					if (getDis(tx, ty - 1, movingX, movingY) < gOld) {
						pos(tx, ty - 1, t);
					}
				}
			}
		}
	}

	path = t;
	if (found) {
		return true;
	} else {
		return false;
	}
}

function _move() {
	// get the absolute cell position of coordinate x and y
	var rect = canvas.getBoundingClientRect();
	var xc = event.clientX;
	var yc = event.clientY;
	var x = parseInt((xc - 6 - rect.left) / interVal);
	var y = parseInt((yc - 8 - rect.top) / interVal);
	var color = boards[x][y];
	if (color != 0) {
		if (clicked) {
			// to clear the highlight after re-click a ball
			context.fillStyle = 'white';
			context.fillRect(movingX * interVal + 1, movingY * interVal + 1, interVal - 2, interVal - 2);
			ball(movingX, movingY, movingColor);
		}
		if (moved) {
			// to clear the highlight after moving a ball
			context.fillStyle = 'white';
			context.fillRect(clearX * interVal + 1, clearY * interVal + 1, interVal - 2, interVal - 2);
			if (cleard == false || (rdCleard == true && boards[clearX][clearY] != 0)) {
				ball(clearX, clearY, clearColor);
			}
		}
		// if clicking a ball
		highLight(x, y, color);
		clicked = true;
		cleard = false;
		moved = false;
		movingColor = color;
		movingX = x;
		movingY = y;
		document.getElementById("test").innerHTML = "";
	} else if ((!gameover) && color == 0 && (clicked || (moved && (!clicked) && (!cleard)))) {
		// if already clicked a ball before, and clicking empty space
		if (_canMove(x, y)) {
			if (moved) {
				// to clear the highlight after moving a ball
				context.fillStyle = 'white';
				context.fillRect(clearX * interVal + 1, clearY * interVal + 1, interVal - 2, interVal - 2);
				if (cleard == false || (rdCleard == true && boards[clearX][clearY] != 0)) {
					ball(clearX, clearY, clearColor);
				}
			}
			document.getElementById("test").innerHTML = "";
			for (var i = 0; i < len; i++) {
				for (var j = 0; j < len; j++) {
					prevBds[i][j] = boards[i][j];
				}
			}
			prevBallNum = ballNum;
			prevScore = totalScore;
			prevClicked = clicked;
			prevMovingColor = movingColor;
			prevMovingX = movingX;
			prevMovingY = movingY;
			prevCleard = cleard;
			prevClearX = clearX;
			prevClearY = clearY;
			prevClearColor = clearColor;
			prevRdCleard = rdCleard;

			rmTheBall(movingX, movingY);
			moved = true;
			clicked = false;
			cleard = false;
			rdCleard = false;
			// following three variables are global actually
			clearX = x;
			clearY = y;
			clearColor = movingColor;

			// show the path in animation
			var dsts = 0; // to record the distance, also for setTimeout()
			var showInterval = 60;
			var show = new Array();
			var tmp = path.parent;
			while (tmp.parent != null) { // push the path node into an array
				show.push(tmp);
				tmp = tmp.parent;
			}

			while (show.length != 0) { // show the path in the above array by draw balls
				tmp = show.pop();
				setTimeout(pathBall, dsts * showInterval + 20, tmp.x, tmp.y);
				setTimeout(rmRect, showInterval * (dsts + 3), tmp.x, tmp.y);
				dsts = dsts + 1;
			}

			boards[x][y] = movingColor; // "setTimeout" will make this assignment very late, in "canClear" it will not work
			setTimeout(highLight, dsts * showInterval + 40, x, y, movingColor);
			if (canClear(x, y, movingColor, dsts * showInterval + 150) < 5) {
				if (ballNum < len * len - 2) {
					setTimeout(rdBalls, showInterval * (dsts + 3), 3);
				} else {
					forReloadCookie = false;
					setTimeout(gameOver, showInterval * (dsts + 3) + 3);
					return;
				}
				if (ballNum == len * len) {
					forReloadCookie = false;
					setTimeout(gameOver, showInterval * (dsts + 3) + 3);
					return;
				}
			} else {
				boards[x][y] = 0;
				clicked = false;
			}
			setTimeout(setCks, showInterval * (dsts + 3) + 3);
			movingX = x;
			movingY = y;
		} else {
			document.getElementById("test").innerHTML = "can not move";
		}
	}
}

function setCks() {
	if (forReloadCookie) {
		setCookie("board", boards, 60);
		setCookie("score", totalScore, 60);
		setCookie("redo", redoTimes, 60);
	}
}

function canClear(x, y, color, time) {
	var hNum = 0;
	var vNum = 0;
	var hStart = 0;
	var vStart = 0;
	var checkedH = true;
	var checkedV = true;
	var rmH = false;
	var rmV = false;
	for (var i = 0; i < len; i++) {
		// check horizontally if did not find scoring alignment
		if (boards[x][i] == color && checkedH == true) {
			// set start position of scoring alignment
			if (i == 0) {
				hStart = 0;
			}
			if (i > 0 && boards[x][i - 1] != color) {
				hStart = i;
			}
			// if finded one same color ball then check all the balls next to it
			for (var j = i; j < len; j++) {
				if (boards[x][j] == color) {
					// if this ball is the same color, begin counting
					hNum++;
					// if next ball is not same color, check the number of alignment balls
					if ((j + 1 < len && boards[x][j + 1] != color) || (j + 1 == len)) {
						if (hNum > 4) {
							// if more than 5 or equals to 5 we get it
							rmH = true; // can clear horizontally
							checkedH = false; // if cleared check h no more
							break;
						} else {
							// else we set number to zero and set i to the last position
							// to optimize the running time
							hNum = 0;
							i = j;
						}
					}
				} else {
					// if not the same color directly break
					if (hNum < 5) {
						hNum = 0;
					}
					i = j;
					break;
				}
			}
		}
	}
	for (var i = 0; i < len; i++) {
		// check vertically if did not find scoring alignment
		if (boards[i][y] == color && checkedV == true) {
			// set start position of scoring alignment
			if (i == 0) {
				vStart = 0;
			}
			if (i > 0 && boards[i - 1][y] != color) {
				vStart = i;
			}
			// if finded one same color ball then check all the balls next to it
			for (var j = i; j < len; j++) {
				if (boards[j][y] == color) {
					// if this ball is the same color, begin counting
					vNum++;
					// if next ball is not same color, check the number of alignment balls
					if ((j + 1 < len && boards[j + 1][y] != color) || (j + 1 == len)) {
						if (vNum > 4) {
							// if more than 5 or equals to 5 we get it
							rmV = true; // can clear vertically
							checkedV = false; // if cleared check v no more
							break;
						} else {
							// else we set number to zero and set i to the last position
							// to optimize the running time
							vNum = 0;
							i = j;
						}
					}
				} else {
					// if not the same color directly break
					if (vNum < 5) {
						vNum = 0;
					}
					i = j;
					break;
				}
			}
		}
	}
	if (rmH) {
		// if we can remove horizontally just do it
		cleard = true;
		for (var t = hStart; t < hStart + hNum; t++) {
			setTimeout(rmBall, time, x, t);
		}
		setTimeout(setCookie, time, "board", boards, 60);
		setTimeout(setCookie, time, "score", totalScore, 60);
		setTimeout(setCookie, time, "redo", redoTimes, 60);
	}
	if (rmV) {
		// if we can remove vertically just do it
		cleard = true;
		for (var t = vStart; t < vStart + vNum; t++) {
			setTimeout(rmBall, time, t, y);
		}
		setTimeout(setCookie, time, "board", boards, 60);
		setTimeout(setCookie, time, "score", totalScore, 60);
		setTimeout(setCookie, time, "redo", redoTimes, 60);
	}

	// return the amount of scoring alignment balls
	if (hNum < 5 && vNum < 5) {
		return 0;
	} else if (hNum > 4 && vNum < 5) {
		totalScore += hNum;
		updateScore();
		return hNum;
	} else if (hNum < 5 && vNum > 4) {
		totalScore += vNum;
		updateScore();
		return vNum;
	} else {
		totalScore += hNum + vNum - 1;
		updateScore();
		return hNum + vNum - 1;
	}
}

function updateScore() {
	document.getElementById("nowScore").innerHTML = totalScore;
	var high = getCookie('high');
	if (high != null && high != "") {
		var tmpNow = parseInt(totalScore);
		var tmpHigh = parseInt(high);
		if (tmpHigh >= tmpNow) {
			document.getElementById("highScore").innerHTML = high;
		} else {
			document.getElementById("highScore").innerHTML = totalScore;
			setCookie('high', totalScore, 60);
		}
	} else {
		document.getElementById("highScore").innerHTML = totalScore;
		if (totalScore != null && totalScore != "") {
			setCookie('high', totalScore, 60);
		}
	}
}

// copyright from w3shcool, http://www.w3school.com.cn/js
function getCookie(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=");
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1) c_end = document.cookie.length;
			return unescape(document.cookie.substring(c_start, c_end));
		}
	}
	return "";
}

// copyright from w3shcool, http://www.w3school.com.cn/js
function setCookie(c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + expiredays);
	document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}

function browserRedirect() {
	document.getElementById("helpImg").onclick = function() {
		alert("when there are horizontally or vertically aligning at least 5 balls with the same color, you get the score")
	}
	var userAgent = navigator.userAgent.toLowerCase();
	var m = userAgent.match(/mobile/) == "mobile";
	var ipad = userAgent.match(/ipad/i) == "iPad";
	var iphone = userAgent.match(/iphone os/i) == "iPhone";
	var midp = userAgent.match(/midp/i) == "midp";
	var rv = userAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	var uc = userAgent.match(/ucweb/i) == "ucweb";
	var android = userAgent.match(/android/i) == "android";
	var ce = userAgent.match(/windows ce/i) == "windows ce";
	var wm = userAgent.match(/windows mobile/i) == "windows mobile";
	if (ipad || iphone || midp || rv || uc || android || ce || wm || m) {
		// mobile
		document.getElementById("test2").style.height = "29px";
		document.getElementById("mid").style.height = "26px";
	} else {
		// pc
	}
}
browserRedirect();