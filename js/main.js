// Player movement controls
var keyA = 'a';
var keyD = 'd';
var keyLeft = 'ArrowLeft';
var keyRight = 'ArrowRight';
var movementKeys = [ keyA, keyD,keyLeft, keyRight ];

// Player properties
var player = document.getElementById('spaceship-orbit');
var playerSpeed = document.getElementById('speed');
var currentPosition = 0;
var initialSpeed = 0;
var currentIncrement = initialSpeed;
var speed = 0;
var speedIncrement = 0.02;
var minSpeed = -2;
var maxSpeed = 2;
var positionLimit = 360;

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
  player.style.transform = `rotate(${currentPosition += speed}deg)`;
  if (currentPosition > positionLimit || currentPosition < -positionLimit) {
    currentPosition = 0;
  }
}
