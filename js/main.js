// Player movement controls
var keyA = 'a';
var keyD = 'd';
var keyLeft = 'ArrowLeft';
var keyRight = 'ArrowRight';
var movementKeys = [ keyA, keyD,keyLeft, keyRight ];

// Player properties
var playerOrbit = document.getElementById('spaceship-orbit');
var player = document.getElementById('spaceship');
var playerSpeed = document.getElementById('speed');
var currentPosition = 0;
var initialSpeed = 0;
var currentIncrement = initialSpeed;
var speed = 0;
var speedIncrement = 0.02;
var minSpeed = -2;
var maxSpeed = 2;
var positionLimit = 360;

// Planet properties
var planet = document.getElementById('planet');
var planetOffset = getOffset(planet);

// Game properties
var score = document.getElementById('score');
var satellites = document.getElementById('satellites');
var gameContainer = document.getElementById('game');
var game = document.getElementById('gameCanvas');
// TODO
var satelliteWidth = 10;
// TODO
var satellitesRemaining = 5;
var score = 0;
var shooting = false;

// ----- Player movement -----
var keys = {};
var movementInterval = setInterval(movePlayer, 20);

onkeydown = function(e) {
  if (e && (movementKeys.includes(e.key))) {
    keys[e.key] = true;
  }
}

onkeyup = function(e) {
  if (e && (movementKeys.includes(e.key))) {
    keys[e.key] = false;
  }
}

function movePlayer() {
  for (var key in keys) {
    if (keys[key]) {
      switch (key) {
        case keyA:
        case keyLeft:
          if (speed > minSpeed) {
            speed -= speedIncrement;
            playerSpeed.innerHTML = speed;
          }
        break;
        case keyD:
        case keyRight:
          if (speed < maxSpeed) {
            speed += speedIncrement;
            playerSpeed.innerHTML = speed;
          }
        break;
      }
    }
  }
  playerOrbit.style.transform = `rotate(${currentPosition += speed}deg)`;
  if (currentPosition > positionLimit || currentPosition < -positionLimit) {
    currentPosition = 0;
  }
}

// ----- Satellite shoot -----
document.addEventListener('keyup', event => {
  if (event.code == 'Space') {
    // Shoot satellite
    shootSatellite();

    // Decrease satellite count
    decreaseSatellites();
  }
});

var satelliteId = 0;
function shootSatellite() {
  // Get source position
  var sourcePosition = getOffset(player);

  // Get target position

  // Create satellite
  var satellite = document.createElement('div');
  satellite.setAttribute('id', `s-${satelliteId}`);
  satelliteId++;
  satellite.classList.add('satellite');
  satellite.style.position = 'fixed';
  satellite.style.left = `${sourcePosition.left + player.offsetWidth / 2 - satelliteWidth / 2}px`;
  satellite.style.top = `${sourcePosition.top + player.offsetHeight}px`;

  gameContainer.insertBefore(satellite, game);
}

function decreaseSatellites() {
  satellitesRemaining--;
  satellites.innerHTML = satellitesRemaining;
}

// ----- Utils -----

// Get element X and Y position
function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}
