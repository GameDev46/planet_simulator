/*

 _____                         ______                 ___   ____ 
|  __ \                        |  _  \               /   | / ___|
| |  \/  __ _  _ __ ___    ___ | | | |  ___ __   __ / /| |/ /___ 
| | __  / _` || '_ ` _ \  / _ \| | | | / _ \\ \ / // /_| || ___ \
| |_\ \| (_| || | | | | ||  __/| |/ / |  __/ \ V / \___  || \_/ |
 \____/ \__,_||_| |_| |_| \___||___/   \___|  \_/      |_/\_____/


*/

/* 
	AUTHOR: GameDev46

	replit: https://replit.com/@GameDev46
	youtube: https://www.youtube.com/@gamedev46
	twitter: https://twitter.com/GameDev46

	Give clear and visible credit if using! (much appreciated 😄)

 	PLEASE DO NOT REMOVE THESE CREDITS!
*/

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

let planets = [];
let particles = [];
let randomColour = "#55ff55";
let randomMass = 1000;

let worldFriction = 1;
let planetDestroyOnColl = false;

let backgroundObjects = [];

let scroll = {
	x: 0,
	y: 0
}

let scrollSpeed = 4;

let keyboard = {}

let recordedMouse = {
	x: 0,
	y: 0,
	x2: 0,
	y2: 0,
	down: false,
	downTime: 0
}

let gravitationalConst = 0.005;

const dragColour = "#ffffff";
const dragWidth = 3;

const particleColour = "#ffffff";

function initCanvas() {

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
}

window.addEventListener("resize", e => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
})

function addBasicSolarSystem() {
	let systemID = Math.round(Math.random() * 2);
	
	if (systemID == 0) {
		addNewPlanet(200, 300, 0, 0, 70000, "#ff9999")
		
		addNewPlanet(300, 300, 0, 1.9, 2000, "#9999ff")
		addNewPlanet(0, 300, 0, -1.4, 2000, "#99FFFF")
		addNewPlanet(500, 300, 0, 1.2, 2000, "#99ff99")
		addNewPlanet(-200, 300, 0, -0.9, 2000, "#eeeeee")
	}
	else if (systemID == 1) {
		addNewPlanet(200, 300, 0, 0.4, 40000, "#9999ff")
		addNewPlanet(600, 300, 0, -0.4, 40000, "#99ff99")
	}
	else if (systemID == 2) {
		addNewPlanet(200, 300, 0, 0, 40000, "#9999ff")
		
		addNewPlanet(300, 300, 0, 1.4, 2000, "#99ff99")
		addNewPlanet(100, 300, 0, -1.4, 2000, "#99ff99")
		addNewPlanet(200, 200, 1.4, 0, 2000, "#99ff99")
		addNewPlanet(200, 400, -1.4, 0, 2000, "#99ff99")
	}
}

addBasicSolarSystem()

function drawMouseDownAimer() {
	if (recordedMouse.down) {
		ctx.strokeStyle = dragColour;
		ctx.lineWidth = dragWidth;
			
		ctx.beginPath();
		ctx.moveTo(recordedMouse.x, recordedMouse.y);
		ctx.lineTo(recordedMouse.x2, recordedMouse.y2);
		ctx.stroke();

		ctx.fillStyle = randomColour;
		
		ctx.beginPath();
		ctx.arc(recordedMouse.x, recordedMouse.y, randomMass / 1000, 0, 2 * Math.PI);
		ctx.fill();

		// Increase planet size when holding down

		let sizeIncrease = Date.now() - recordedMouse.downTime;

		if (recordedMouse.x - 5 < recordedMouse.x2 && recordedMouse.x + 5 > recordedMouse.x2 && recordedMouse.y - 5 < recordedMouse.y2 && recordedMouse.y + 5 > recordedMouse.y2) {
			randomMass = 2000 + (sizeIncrease * 3 * ((randomMass / 8000) + 1));
		}
	}
}

function getAttraction(x1, y1, x2, y2, mass1, mass2, size1, size2) {

	let distance = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
	let recordedDistance = false;

	if (distance < (size1 + size2) / 1) {
		distance = (size1 + size2) / 1;
		recordedDistance = true;
	}
	
	let f = gravitationalConst * ((mass1 * mass2) / (distance * distance));

	let radians = Math.atan2(y1 - y2, x1 - x2);

	let xReturn = (Math.cos(radians) * f) / mass1;
	let yReturn = (Math.sin(radians) * f) / mass1;

	return {
		x: xReturn,
		y: yReturn,
		isSmallerDistance: recordedDistance
	};
}

function addNewParticle(x, y, size) {
	let particleObject = {
		x: x,
		y: y,
		size: size / 2,
		colour: particleColour,
		draw: function(win) {
			win.fillStyle = this.colour;
			win.strokeStyle = this.colour;
			
			win.beginPath();
			win.arc(scroll.x + this.x, scroll.y + this.y, this.size, 0, 2 * Math.PI);
			win.fill();
		},
		update: function() {
			this.size -= 0.1;
		}
	}

	particles.push(particleObject);
}

function addNewPlanet(x, y, xvel, yvel, mass, colour) {
	let planetObject = {
		x: x,
		y: y,
		oldX: x,
		oldY: y,
		collision: false,
		xVelocity: xvel,
		yVelocity: yvel,
		mass: mass,
		size: mass / 1000,
		colour: colour,
		draw: function(win) {
			win.fillStyle = this.colour;
			win.strokeStyle = this.colour;
			
			win.beginPath();
			win.arc(scroll.x + this.x, scroll.y + this.y, this.size, 0, 2 * Math.PI);
			win.fill();
		},
		updatePosition: function() {
			if (!this.collision) {
				this.oldX = this.x;
				this.oldY = this.y;
			}
			
			this.x += this.xVelocity;
			this.y += this.yVelocity;

			this.xVelocity = this.xVelocity * worldFriction;
			this.yVelocity = this.yVelocity * worldFriction;

			addNewParticle(this.x, this.y, this.size);
		},
		checkGravity: function(otherPlan) {

			if (otherPlan.mass <= 0 || this.mass <= 0) {
				return;
			}
			
			let otherPlanAttract = getAttraction(otherPlan.x, otherPlan.y, this.x, this.y, this.mass, otherPlan.mass, this.size, otherPlan.size);

			this.xVelocity += otherPlanAttract.x;
			this.yVelocity += otherPlanAttract.y;

			if (otherPlanAttract.isSmallerDistance) {
				this.x = this.oldX;
				this.y = this.oldY;
				this.collision = true;

				this.xVelocity += -this.xVelocity * 1.4;
				this.yVelocity += -this.yVelocity * 1.4;

				otherPlan.xVelocity += this.xVelocity / otherPlan.mass * -this.mass;
				otherPlan.yVelocity += this.yVelocity / otherPlan.mass * -this.mass;

				this.xVelocity += this.xVelocity * 0.2;
				this.yVelocity += this.yVelocity * 1.4;

				if (planetDestroyOnColl) {
					if (this.mass < otherPlan.mass) {
						otherPlan.mass += this.mass;
							otherPlan.size += this.size;
					
						this.mass = 0;
						this.size = 0;
					}
					else {
						this.mass += otherPlan.mass;
						this.size += otherPlan.size;
					
						otherPlan.mass = 0;
						otherPlan.size = 0;
					}
				}
			}
			else {
				this.collision = false;
			}
		}
	}
	
	planets.push(planetObject);
}

function drawParticles() {
	for (var i = 0; i < particles.length; i++) {
		particles[i].draw(ctx);
	}
}

function updateParticles() {
	let iMinus = 0;
	
	for (var i = 0; i < particles.length - iMinus; i++) {
		particles[i].update();

		if (particles[i].size < 0) {
			particles.splice(i, 1);
			i -= 1;
			iMinus += 1;
		}
	}
}

function drawPlanets() {
	for (var i = 0; i < planets.length; i++) {
		planets[i].draw(ctx);
	}
}

function updatePlanetsPos() {
	for (var i = 0; i < planets.length; i++) {
		planets[i].updatePosition();
	}
}

function updatePlanetAttract() {
	for (var i = 0; i < planets.length; i++) {
		for (var y = 0; y < planets.length; y++) {
			
			if (i != y) {
				planets[i].checkGravity(planets[y]);
			}
			
		}
	}
}

for (var i = 0; i < 5000; i++) {
	backgroundObjects.push([0, Math.floor(Math.random() * 5000) - 1000, Math.floor(Math.random() * 5000) - 1000, Math.floor(Math.random() * 2) + 1, Math.floor(Math.random() * 40) + 3])
}

function renderBackground() {
	for (var i = 0; i < backgroundObjects.length; i++) {
		if (backgroundObjects[i][0] == 0) {
			ctx.fillStyle = "#555555";
			ctx.strokeStyle = "#555555";
			
			ctx.fillRect((scroll.x / backgroundObjects[i][4]) + backgroundObjects[i][1], (scroll.y / backgroundObjects[i][4]) + backgroundObjects[i][2], backgroundObjects[i][3], backgroundObjects[i][3]);
		}
	}
}

function getInputs() {
	if (keyboard["w"]) {
		scroll.y += scrollSpeed
	}

	if (keyboard["s"]) {
		scroll.y -= scrollSpeed
	}

	if (keyboard["a"]) {
		scroll.x += scrollSpeed
	}

	if (keyboard["d"]) {
		scroll.x -= scrollSpeed
	}
}

function gameLoop() {
	requestAnimationFrame(gameLoop);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	renderBackground();

	updateParticles();
	drawParticles();

	updatePlanetsPos();
	updatePlanetAttract();
	drawPlanets();

	drawMouseDownAimer();

	 getInputs();
}

initCanvas();
requestAnimationFrame(gameLoop);

canvas.addEventListener("mousedown", e => {
	recordedMouse.x = e.pageX;
	recordedMouse.y = e.pageY;
	recordedMouse.down = true;
	recordedMouse.downTime = Date.now();

	recordedMouse.x2 = e.pageX;
	recordedMouse.y2 = e.pageY;
})

canvas.addEventListener("mousemove", e => {
	recordedMouse.x2 = e.pageX;
	recordedMouse.y2 = e.pageY;
})

canvas.addEventListener("mouseup", e => {
	let x = e.pageX;
	let y = e.pageY;

	let velocities = {
		x: (recordedMouse.x - x) / 20,
		y: (recordedMouse.y - y) / 20
	}

	recordedMouse.down = false;

	addNewPlanet(recordedMouse.x - scroll.x, recordedMouse.y - scroll.y, velocities.x, velocities.y, randomMass, randomColour);

	let base16 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]

	randomColour = "#";
	
	for (var i = 0; i < 6; i++) {
		randomColour = randomColour + base16[Math.round(Math.random() * (base16.length - 1))]
	}
	
})

canvas.addEventListener("touchstart", e => {
	recordedMouse.x = e.changedTouches[0].pageX;
	recordedMouse.y = e.changedTouches[0].pageY;
	recordedMouse.down = true;
	recordedMouse.downTime = Date.now();

	recordedMouse.x2 = e.touches[0].pageX;
	recordedMouse.y2 = e.touches[0].pageY;
})

canvas.addEventListener("touchmove", e => {
	recordedMouse.x2 = e.touches[0].pageX;
	recordedMouse.y2 = e.touches[0].pageY;
})

canvas.addEventListener("touchend", e => {
	
	let x = e.changedTouches[0].pageX;
	let y = e.changedTouches[0].pageY;

	let velocities = {
		x: (recordedMouse.x - x) / 20,
		y: (recordedMouse.y - y) / 20
	}

	recordedMouse.down = false;

	addNewPlanet(recordedMouse.x, recordedMouse.y, velocities.x, velocities.y, randomMass, randomColour);

	let base16 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]

	randomColour = "#";
	
	for (var i = 0; i < 6; i++) {
		randomColour = randomColour + base16[Math.round(Math.random() * (base16.length - 1))]
	}
	
})


window.addEventListener("keydown", e => {
	keyboard[e.key.toLowerCase()] = true;
})

window.addEventListener("keyup", e => {
	keyboard[e.key.toLowerCase()] = false;
})

// Settings listeners

let settingsToggle = false;

document.getElementById("settings-toggle").addEventListener("click", e => {
	settingsToggle = !settingsToggle;
	
	if (settingsToggle) {
		document.getElementById("user-settings").style.height = "250px";
		document.getElementById("user-settings-arrow").style.transform = "translateY(3px) rotateZ(0deg)";
	}
	else {
		document.getElementById("user-settings").style.height = "30px";
			document.getElementById("user-settings-arrow").style.transform = "translateY(3px) rotateZ(-90deg)";
	}
})

function round(num, roundVal) {
	return (Math.round(num * roundVal) / roundVal);
}


document.getElementById("friction").addEventListener("input", e => {
	worldFriction = 1 - Number(document.getElementById("friction").value);

	document.getElementById("friction-counter").innerText = "Friction: " + round(Number(document.getElementById("friction").value), 100);
})

document.getElementById("gravitational-const").addEventListener("input", e => {
	gravitationalConst = Number(document.getElementById("gravitational-const").value);

	document.getElementById("gravitational-const-counter").innerText = "Gravitational Const: " + round(Number(document.getElementById("gravitational-const").value), 1000);
})

document.getElementById("bounce").addEventListener("click", e => {
	if (document.getElementById("bounce").checked) {
		planetDestroyOnColl = false;
	}
	else {
		planetDestroyOnColl = true;
	}
})

document.getElementById("clear-planets").addEventListener("click", e => {
	planets = [];
})
