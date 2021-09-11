// Game status machine
var MAIN_MENU = 0, GAME_LOOP = 1, GAME_OVER = 2;
var status = MAIN_MENU;

// Game menu
var PLAYING_CLASS = 'playing';
var mainMenu = document.getElementById('menu');
var lightbox = document.getElementById('lightbox');

// TODO
var gameStatus = document.getElementById('status');
gameStatus.innerHTML = status;
// TODO

// Player movement controls
var keyA = 'a', keyD = 'd', keyLeft = 'ArrowLeft', keyRight = 'ArrowRight';
var movementKeys = [ keyA, keyD, keyLeft, keyRight ];

// Player properties
var playerOrbit = document.getElementById('spaceship-orbit');
var player = document.getElementById('spaceship');
var currentPosition = 0;
var speed = 0;
var speedIncrement = 0.02;
var minSpeed = -2;
var maxSpeed = 2;
var positionLimit = 360;

// Satellites orbit properties
var orbit = document.getElementById('orbit-template');
var satelliteTemplate = document.getElementById('satellite-template');
var satelliteBasePosition = { x: 84, y: -16 };
var orbitCenter = getCenter(orbit);
var difPosition = {
  x: getOffset(satelliteTemplate).left - satelliteBasePosition.x,
  y: getOffset(satelliteTemplate).top - satelliteBasePosition.y
};

// Game properties
var score = document.getElementById('score');
var remaining = document.getElementById('satellites');
var gameContainer = document.getElementById('game');
var game = document.getElementById('gameCanvas');
var satelliteWidth = 32;
var satellitesRemaining = 5;
var currentScore = 0;

// Rotation calculation properties
var orbitRadius = orbit.offsetWidth / 2;

// ----- Player movement -----
var keys = {};
var movementInterval = setInterval(movePlayer, 20);

onkeydown = function(e) {
  if (status == GAME_LOOP && e && (movementKeys.includes(e.key))) {
    keys[e.key] = true;
  }
}

onkeyup = function(e) {
  if (status == GAME_LOOP && e && (movementKeys.includes(e.key))) {
    keys[e.key] = false;
  }
}

function movePlayer() {
  if (status == GAME_LOOP) {
    for (var key in keys) {
      if (keys[key]) {
        switch (key) {
          case keyA:
          case keyLeft:
            if (speed > minSpeed) {
              speed -= speedIncrement;
            }
          break;
          case keyD:
          case keyRight:
            if (speed < maxSpeed) {
              speed += speedIncrement;
            }
          break;
        }
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
  if (status == GAME_LOOP && event.code == 'Space' && satellitesRemaining > 0) {
    // Shoot satellite
    shootSatellite();

    // Decrease satellite count
    decreaseSatellites();
  }
});

var satellites = [];
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

      var satelliteCollided = checkSatelliteCollided(satellite);
      if (satelliteCollided) {
        removeSatellite(satellite, satelliteInterval);
        gameOver();
      } else if (checkInsideOrbit(satellite)) {
        // Check for collisions
        stickSatellite(satellite);
        clearInterval(satelliteInterval);
        satellites.push(satellite);
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
  var satelliteCenter = getCenter(satellite);
  return isInsideCircle(satelliteCenter, orbitCenter, orbitRadius);
}

// Check if satellite collides with other satellites
function checkSatelliteCollided(satellite) {
  var collision = false;

  for (var i = 0; i < satellites.length && !collision; i++) {
    var target = satellites[i];

    // Get satellite boundaries
    var satelliteOffset = getOffset(satellite);
    var satelliteMinX = satelliteOffset.left;
    var satelliteMaxX = satelliteOffset.left + satellite.offsetWidth;
    var satelliteMinY = satelliteOffset.top;

    // Get target satellite boundaries
    var targetOffset = getOffset(target);
    var targetMinX = targetOffset.left;
    var targetMaxX = targetOffset.left + target.offsetWidth;
    var targetMinY = targetOffset.top;
    var targetMaxY = targetOffset.top + target.offsetHeight;

    // Check if boundaries collide
    if ((satelliteMinX >= targetMinX && satelliteMinX <= targetMaxX && satelliteMinY >= targetMinY && satelliteMinY <= targetMaxY) ||
      (satelliteMaxX >= targetMinX && satelliteMaxX <= targetMaxX && satelliteMinY >= targetMinY && satelliteMinY <= targetMaxY)) {
      collision = true;
    }
  }

  return collision;
}

// Remove a satellite
function removeSatellite(satellite, interval) {
  if (satellite && satellite.parentElement) {
    satellite.parentElement.removeChild(satellite);
    clearInterval(interval);
  }
}

// Sticks satellite to planet's orbit
var orbitId = 0;
function stickSatellite(satellite) {
  // Get satellite new position
  var currentPosition = getOffset(satellite);

  var newPosition = {
    x: currentPosition.left - difPosition.x,
    y: currentPosition.top - difPosition.y
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

// ----- State machine methods -----
function startGame() {
  status = GAME_LOOP;
  gameStatus.innerHTML = status;
  mainMenu.classList.add(PLAYING_CLASS);
  lightbox.classList.add(PLAYING_CLASS);
}

function gameOver() {
  status = GAME_OVER;
  gameStatus.innerHTML = status;
  mainMenu.classList.remove(PLAYING_CLASS);
  lightbox.classList.remove(PLAYING_CLASS);
}
