// Player movement controls
var keyA = 'a';
var keyD = 'd';
var keyLeft = 'ArrowLeft';
var keyRight = 'ArrowRight';
var movementKeys = [ keyA, keyD, keyLeft, keyRight ];

// Player properties
var playerOrbit = document.getElementById('spaceship-orbit');
var player = document.getElementById('spaceship');
var playerSpeed = document.getElementById('speed');
var currentPosition = 0;
var speed = 0;
var speedIncrement = 0.02;
var minSpeed = -2;
var maxSpeed = 2;
var positionLimit = 360;

// Satellites orbit properties
var orbit = document.getElementById('orbit-template');
var orbitCenter = getCenter(orbit);
var magicPosition = { x: 259, y: 369 };

// Game properties
var score = document.getElementById('score');
var satellites = document.getElementById('satellites');
var gameContainer = document.getElementById('game');
var game = document.getElementById('gameCanvas');
// TODO
var satelliteWidth = 10;
// TODO
var satellitesRemaining = 5;
var currentScore = 0;

// Rotation calculation properties
var orbitRadius = orbit.offsetWidth / 2;

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
  var satellitePosition = {
    x: sourcePosition.left + player.offsetWidth / 2 - satelliteWidth / 2,
    y: sourcePosition.top + player.offsetHeight
  };

  // Create satellite
  var satellite = document.createElement('div');
  satellite.setAttribute('id', `s-${satelliteId}`);
  satelliteId++;
  satellite.classList.add('satellite');
  satellite.style.left = `${satellitePosition.x}px`;
  satellite.style.top = `${satellitePosition.y}px`;

  gameContainer.insertBefore(satellite, game);

  // Movement
  var angle = Math.atan2(orbitCenter.y - satellitePosition.y, orbitCenter.x - satellitePosition.x);
  var speed = 5;
  var deltaX = Math.cos(angle) * speed;
  var deltaY = Math.sin(angle) * speed;
  var satelliteInterval = setInterval(
    function() {
      var newPositionX = satellitePosition.x += deltaX;
      var newPositionY = satellitePosition.y += deltaY;

      // Update position
      satellite.style.left = `${newPositionX}px`;
      satellite.style.top = `${newPositionY}px`;

      // Check for collisions
      if (checkInsideOrbit(satellite)) {
        stickSatellite(satellite);
        clearInterval(satelliteInterval);
      }
    }, 10
  );
}

function decreaseSatellites() {
  satellitesRemaining--;
  satellites.innerHTML = satellitesRemaining;
}

// ----- Utils -----

// Get element X and Y base position
function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

// Get element X and Y center position
function getCenter(el) {
  var elementOffset = getOffset(el);
  return {
    x: elementOffset.left + el.offsetWidth / 2,
    y: elementOffset.top + el.offsetHeight / 2
  };
}

// Check if element center is inside a circle
function isInsideCircle(element, circle, radius) {
  var distPoints = (circle.x - element.x) * (circle.x - element.x) + (circle.y - element.y) * (circle.y - element.y);
  radius *= radius;
  return distPoints < radius;
}

// Checks if satellite is colliding planet's orbit
function checkInsideOrbit(satellite) {
  // Get satellite center
  var satelliteCenter = getCenter(satellite);

  // TODO
  /*
  var isInside = isInsideCircle(satelliteCenter, orbitCenter, orbitRadius);
  if (isInside) {
    console.log(satelliteCenter);
    console.log(orbitCenter);
    console.log(orbitRadius);

    console.log(getOffset(satellite));
    console.log(satellite.clientX);
    console.log(satellite.clientY);
  }

  return isInside;
  */
  // TODO

  return isInsideCircle(satelliteCenter, orbitCenter, orbitRadius);
}

// Sticks satellite to planet's orbit
var orbitId = 0;
function stickSatellite(satellite) {
  // Get satellite new position
  var currentPosition = getOffset(satellite);
  var newPosition = {
    x: currentPosition.left - magicPosition.x,
    y: currentPosition.top - magicPosition.y
  };

  // Create new orbit
  var newOrbit = document.createElement('div');
  newOrbit.setAttribute('id', `o-${orbitId}`);
  orbitId++;
  newOrbit.classList.add('satellite-orbit');
  game.appendChild(newOrbit);

  // Apply new satellite properties
  satellite.style.position = 'absolute';
  satellite.style.left = `${newPosition.x}px`;
  satellite.style.top = `${newPosition.y}px`;

  // Stick satellite to new orbit
  newOrbit.appendChild(satellite);
  newOrbit.classList.add('animated');
}
