/* =====================
   SMOOTH PLAYER MOVEMENT WITH JUMPING
   ===================== */

// Get DOM elements
const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const door = document.querySelector('.door');
const doorPrompt = document.getElementById('doorPrompt');

// Set up keys tracking for continuous movement
const keys = {};

// Initial player physics values
let playerX = 50;
let playerY = 20;   // This value is used for the player's bottom (ground level = 20px)
let velocityY = 0;

// Movement physics parameters
const moveSpeed = 4;         // Horizontal speed (pixels per frame)
const jumpStrength = 10;     // Jump strength
const gravity = 0.6;         // Gravity acceleration
const groundLevel = 20;      // Player's bottom when on the platform

// Listen for keydown and keyup events
document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function updatePlayer() {
  // Horizontal movement
  if (keys["arrowleft"] || keys["a"]) {
    playerX = Math.max(0, playerX - moveSpeed);
  }
  if (keys["arrowright"] || keys["d"]) {
    playerX = Math.min(gameContainer.offsetWidth - player.offsetWidth, playerX + moveSpeed);
  }
  // Jumping—if jump key (w, arrowup, or space) is pressed and the player is on the ground:
  if ((keys["arrowup"] || keys["w"] || keys[" "]) && playerY === groundLevel) {
    velocityY = jumpStrength;
  }
  // Apply gravity if the player is airborne
  if (playerY > groundLevel || velocityY > 0) {
    playerY += velocityY;
    velocityY -= gravity;
  }
  // Clamp the player at ground level when falling
  if (playerY < groundLevel) {
    playerY = groundLevel;
    velocityY = 0;
  }
  
  // Update player CSS positions (using left and bottom)
  player.style.left = playerX + "px";
  player.style.bottom = playerY + "px";
  
  // Check door proximity every frame
  checkDoorProximity();
  
  requestAnimationFrame(updatePlayer);
}
updatePlayer();

/* =====================
   HEALTH AND DAMAGE LOGIC
   ===================== */
const maxHealth = 5;           // Maximum health (number of hearts)
let playerHealth = maxHealth;  // Current health
let isInvincible = false;

function reduceHeart() {
  if (isInvincible) return;
  if (playerHealth > 0) {
    // Compute target heart index so that hearts disappear from left to right.
    const targetIndex = maxHealth - playerHealth + 1;
    const heart = document.getElementById(`heart${targetIndex}`);
    if (heart) {
      heart.style.opacity = "0.3";
    }
    showFloatingDamage();  // Displays a floating "-1" above the player
    playerHealth--;
    console.log("Player hit! Remaining health: " + playerHealth);
    isInvincible = true;
    showDamageIndicator();
    setPlayerInvincible(3000); // 3 seconds invincibility
    setTimeout(() => { isInvincible = false; }, 3000);
  }
  if (playerHealth === 0) {
    console.log("Game Over");
    window.location.href = "gameOver.html";
  }
}

/**
 * Displays a floating “-1” above the player.
 * The text is white and uses the “bpx” font.
 */
function showFloatingDamage() {
  const floatElem = document.createElement('div');
  floatElem.textContent = "-1";
  floatElem.style.position = "absolute";
  
  // Calculate the player's position relative to the game container.
  const playerRect = player.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  
  const leftPos = playerRect.left - containerRect.left + (playerRect.width / 2) - 10;
  const topPos = playerRect.top - containerRect.top - 30;
  
  floatElem.style.left = leftPos + "px";
  floatElem.style.top = topPos + "px";
  floatElem.style.color = "white";
  floatElem.style.fontSize = "20px";
  floatElem.style.fontFamily = "bpx";
  floatElem.style.opacity = "1";
  floatElem.style.zIndex = "40";
  
  gameContainer.appendChild(floatElem);
  
  // Animate the floating effect: move upward and fade out.
  setTimeout(() => {
    floatElem.style.transition = "opacity 1s ease-out, top 1s ease-out";
    floatElem.style.opacity = "0";
    floatElem.style.top = (topPos - 20) + "px";
  }, 100);
  
  setTimeout(() => {
    if (gameContainer.contains(floatElem)) {
      gameContainer.removeChild(floatElem);
    }
  }, 1100);
}

/**
 * Brief damage flash effect on the player.
 */
function showDamageIndicator() {
  player.style.filter = "brightness(0.5)";
  setTimeout(() => { player.style.filter = ""; }, 200);
}

/**
 * Adds and then removes the invincibility blinking effect.
 */
function setPlayerInvincible(duration) {
  player.classList.add("invincible");
  setTimeout(() => { player.classList.remove("invincible"); }, duration);
}

/* =====================
   DOOR OPENING LOGIC
   ===================== */
let doorOpenTriggered = false;

/**
 * Checks the player's proximity to the door.
 * If the player is near the door, the door prompt fades in.
 * When the player walks away, it fades out.
 */
function checkDoorProximity() {
  const playerRect = player.getBoundingClientRect();
  const doorRect = door.getBoundingClientRect();
  
  // Determine whether the player is near (or overlapping) the door.
  let isNear = false;
  if (
    playerRect.right > doorRect.left &&
    playerRect.left < doorRect.right &&
    playerRect.bottom > doorRect.top &&
    playerRect.top < doorRect.bottom
  ) {
    isNear = true;
  }
  
  // Fade the door prompt in or out based on proximity:
  doorPrompt.style.opacity = (isNear && !doorOpenTriggered) ? '1' : '0';
}

// Listen for the "E" key. If pressed while near the door, trigger door opening.
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e' && doorPrompt.style.opacity === '1' && !doorOpenTriggered) {
    doorOpenSequence();
  }
});

/**
 * Triggers the door-opening sequence:
 * • Displays a blue key (blueKey.png) at the door.
 * • After a short animation, fades to black and redirects to "bossTwo.html".
 */
function doorOpenSequence() {
  doorOpenTriggered = true;
  doorPrompt.style.opacity = '0';
  
  // Create and position the key element at the door's center.
  const keyElem = document.createElement('img');
  keyElem.src = 'blueKey.png';
  keyElem.id = 'blueKey';
  keyElem.style.position = 'absolute';
  const doorRect = door.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  const keyLeft = doorRect.left - containerRect.left + doorRect.width / 2 - 20;
  const keyTop = doorRect.top - containerRect.top + doorRect.height / 2 - 20;
  keyElem.style.left = keyLeft + 'px';
  keyElem.style.top = keyTop + 'px';
  keyElem.style.width = '40px';
  keyElem.style.height = '40px';
  keyElem.style.opacity = '0';
  keyElem.style.transition = 'opacity 1s ease-in-out';
  keyElem.style.zIndex = '40';
  gameContainer.appendChild(keyElem);
  
  setTimeout(() => {
    keyElem.style.opacity = '1';
  }, 100);
  
  // After the key appears, fade the screen to black and redirect.
  setTimeout(() => {
    const fadeDiv = document.createElement('div');
    fadeDiv.style.position = 'absolute';
    fadeDiv.style.top = '0';
    fadeDiv.style.left = '0';
    fadeDiv.style.width = '100%';
    fadeDiv.style.height = '100%';
    fadeDiv.style.backgroundColor = 'black';
    fadeDiv.style.opacity = '0';
    fadeDiv.style.transition = 'opacity 2s ease-out';
    fadeDiv.style.zIndex = '50';
    gameContainer.appendChild(fadeDiv);
    
    setTimeout(() => {
      fadeDiv.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
      window.location.href = 'bossTwo.html';
    }, 2500);
    
  }, 2000);
}
