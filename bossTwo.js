// =====================
// FINAL BOSS BATTLE SYSTEM
// =====================

// Game Elements
const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const bossMouth = document.getElementById('bossMouth');
const containerRect = gameContainer.getBoundingClientRect();
const hearts = document.querySelectorAll('.heart');

// Game State
let currentPhase = 1;
let playerX = 50;
let playerY = 20;
let velocityY = 0;
let playerHealth = 10;
let isInvincible = false;
let currentAttackInterval;
let mouthX = 50;
let mouthMoveDirection = 1;
const mouthMoveSpeed = [0.5, 0.8, 1.2];
let activeAcidPools = [];
let activeTongues = [];
let activeLasers = [];
let isFinalAttack = false;
let magicSquare = null;
let pickupPrompt = null;
let gameEnded = false;
let mouthMusic = document.getElementById('mouthMusic');
let isMusicPlaying = false;

// Constants
const moveSpeed = 2; // Reduced from 4
const jumpStrength = 12; // Increased from 10
const gravity = 0.8; // Increased from 0.6
const groundLevel = 20;
const airControl = 0.5;
const phaseDurations = { 1: 25000, 2: 20000, 3: 15000 };
const mouthScale = [1, 1.2, 1.4];

// =====================
// PLAYER MOVEMENT
// =====================
window.addEventListener('DOMContentLoaded', () => {
  initGame();
  updatePlayer(); // Start player movement loop
});

const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'f' && magicSquare && checkCollision(magicSquare) && !gameEnded) {
    pickupMagicSquare();
  }
});
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function updatePlayer() {
  // Horizontal movement with air control
  const currentMoveSpeed = (playerY > groundLevel) ? moveSpeed * airControl : moveSpeed;
  
  if (keys["arrowleft"] || keys["a"]) {
    playerX = Math.max(0, playerX - currentMoveSpeed);
  }
  if (keys["arrowright"] || keys["d"]) {
    playerX = Math.min(gameContainer.offsetWidth - player.offsetWidth, playerX + currentMoveSpeed);
  }

  // Jumping
  if ((keys["arrowup"] || keys["w"] || keys[" "]) && playerY === groundLevel) {
    velocityY = jumpStrength;
    playerY += 1; // Helps prevent ground sticking
  }

  // Apply gravity
  velocityY -= gravity;
  playerY += velocityY;

  // Ground clamping with slight bounce effect
  if (playerY < groundLevel) {
    playerY = groundLevel;
    velocityY = 0;
  }

  player.style.left = playerX + "px";
  player.style.bottom = playerY + "px";
  requestAnimationFrame(updatePlayer);
  checkMouthCollision();

}
updatePlayer();

// =====================
// MOUTH MOVEMENT SYSTEM
// =====================
function updateMouthPosition() {
  if (isFinalAttack || gameEnded) return;
  
  mouthX += mouthMoveDirection * mouthMoveSpeed[currentPhase-1];
  
  if (mouthX > 80) mouthMoveDirection = -1;
  if (mouthX < 20) mouthMoveDirection = 1;
  
  bossMouth.style.left = `${mouthX}%`;
  bossMouth.style.transform = `translateX(-50%) scale(${mouthScale[currentPhase-1]})`;
  
  if (currentPhase > 1 && Math.random() < (0.02 * currentPhase)) {
    createBloodDroplet();
  }
  
  requestAnimationFrame(updateMouthPosition);
}

function setMouthState(state) {
  const phasePrefix = `P${currentPhase}`;
  const states = {
    'closed': `${phasePrefix}closedMouth.png`,
    'charging': `${phasePrefix}mouth2.png`,
    'open': `${phasePrefix}mouth1.png`
  };
  bossMouth.src = `Mouth/${states[state]}`;
}

function createBloodDroplet() {
  const blood = document.createElement('div');
  blood.className = `blood-droplet phase-${currentPhase}`;
  
  const mouthRect = bossMouth.getBoundingClientRect();
  blood.style.left = (mouthRect.left - containerRect.left + mouthRect.width * (0.4 + Math.random() * 0.2)) + 'px';
  blood.style.top = (mouthRect.bottom - containerRect.top) + 'px';
  
  gameContainer.appendChild(blood);
  
  setTimeout(() => {
    blood.style.top = (gameContainer.offsetHeight - 20) + 'px';
    blood.style.transition = `top ${1 + Math.random()}s linear`;
    
    setTimeout(() => blood.remove(), 2000);
  }, 10);
}

// =====================
// FINAL SEQUENCE
// =====================
function startFinalSequence() {
  isFinalAttack = true;
  clearInterval(currentAttackInterval);
  
  // Make boss bleed heavily on the left side
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      createBloodDroplet(true); // Modified function below
    }, i * 200);
  }

  // Hide boss after bleeding
  setTimeout(() => {
    bossMouth.style.opacity = '0';
    setTimeout(launchFinalPukeAttack, 500);
  }, 3000);
}

// Modify createBloodDroplet:
function createBloodDroplet(finalBleed = false) {
  const blood = document.createElement('div');
  blood.className = `blood-droplet phase-${currentPhase}`;
  
  const mouthRect = bossMouth.getBoundingClientRect();
  const xOffset = finalBleed ? 
    (mouthRect.width * 0.2) : 
    (mouthRect.width * (0.4 + Math.random() * 0.2));
  
  blood.style.left = (mouthRect.left - containerRect.left + xOffset) + 'px';
  blood.style.top = (mouthRect.bottom - containerRect.top) + 'px';
  
  gameContainer.appendChild(blood);
  
  setTimeout(() => {
    blood.style.top = (gameContainer.offsetHeight - 20) + 'px';
    blood.style.transition = `top ${1 + Math.random()}s linear`;
    
    setTimeout(() => blood.remove(), 2000);
  }, 10);
}
function launchFinalPukeAttack() {
  setMouthState('open');
  
  // Create giant green puke
  const puke = document.createElement('div');
  puke.className = 'final-puke-attack';
  puke.style.left = '90%';
  puke.style.top = '50%';
  gameContainer.appendChild(puke);
  
  // Expand to cover left side
  setTimeout(() => {
    puke.style.width = '100%';
    puke.style.left = '0';
    puke.style.transition = 'width 1s ease-out, left 1s ease-out';
    
    // Damage player
    setTimeout(() => {
      if (!isInvincible && !gameEnded) {
        reduceHeart();
      }
    }, 800);
    
    // Final explosion
    setTimeout(() => {
      puke.remove();
      createFinalExplosion();
    }, 1200);
  }, 100);
}

function createFinalExplosion() {
  // Create blood explosion
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const blood = document.createElement('div');
      blood.className = 'blood-explosion';
      blood.style.left = '90%';
      blood.style.top = '50%';
      gameContainer.appendChild(blood);
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const velX = Math.cos(angle) * 5;
      const velY = Math.sin(angle) * 5;
      
      let posX = 90;
      let posY = 50;
      
      function updateBlood() {
        posX += velX;
        posY += velY;
        
        blood.style.left = `${posX}%`;
        blood.style.top = `${posY}%`;
        
        if (posX < 0 || posX > 100 || posY < 0 || posY > 100) {
          blood.remove();
          return;
        }
        
        requestAnimationFrame(updateBlood);
      }
      
      updateBlood();
    }, i * 50);
  }
  
  // Create magic square after explosion
  setTimeout(() => {
    createMagicSquare();
  }, 1500);
}

function createMagicSquare() {
  bossMouth.remove();
  
  // Create glowing pink square
  magicSquare = document.createElement('div');
  magicSquare.className = 'glowing-pink-square';
  
  // Position and size
  magicSquare.style.position = 'absolute';
  magicSquare.style.left = '80%';
  magicSquare.style.bottom = '20px';
  magicSquare.style.width = '50px';
  magicSquare.style.height = '50px';
  
  // Glowing pink styles
  magicSquare.style.backgroundColor = 'rgba(255, 105, 180, 0.7)'; // Semi-transparent pink
  magicSquare.style.borderRadius = '5px';
  magicSquare.style.border = '2px solid white';
  magicSquare.style.boxShadow = '0 0 15px 5px rgba(255, 105, 180, 0.9)';
  magicSquare.style.transition = 'all 0.3s ease';
  
  // Add pulsing glow animation
  magicSquare.style.animation = 'pulse-glow 1.5s infinite alternate';
  
  gameContainer.appendChild(magicSquare);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-glow {
      0% {
        box-shadow: 0 0 10px 3px rgba(255, 105, 180, 0.7);
        transform: scale(1);
      }
      100% {
        box-shadow: 0 0 20px 8px rgba(255, 105, 180, 0.9);
        transform: scale(1.05);
      }
    }
    
    .glowing-pink-square:hover {
      animation: none;
      box-shadow: 0 0 25px 10px rgba(255, 105, 180, 1);
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(style);
  
  createPickupPrompt();
}

function createPickupPrompt() {
  pickupPrompt = document.createElement('div');
  pickupPrompt.className = 'pickup-prompt';
  pickupPrompt.textContent = 'Press F to continue';
  pickupPrompt.style.position = 'absolute';
  pickupPrompt.style.left = '80%';
  pickupPrompt.style.bottom = '70px'; // Positioned above the square
  pickupPrompt.style.color = 'white';
  pickupPrompt.style.fontFamily = '"dogicabold", sans-serif';
  pickupPrompt.style.fontSize = '14px';
  pickupPrompt.style.textShadow = '0 0 5px #ff69b4';
  pickupPrompt.style.opacity = '0';
  
  // Fade in animation
  setTimeout(() => {
    pickupPrompt.style.opacity = '1';
    pickupPrompt.style.transition = 'opacity 0.5s ease';
  }, 300);
  
  gameContainer.appendChild(pickupPrompt);
  
  // Pulsing animation
  setInterval(() => {
    pickupPrompt.style.textShadow = pickupPrompt.style.textShadow.includes('8px') 
      ? '0 0 5px #ff69b4' 
      : '0 0 8px #ff69b4';
  }, 800);
}

function redirectToPlane() {
  // Create white fade effect
  const fadeOverlay = document.createElement('div');
  fadeOverlay.className = 'fade-overlay';
  document.body.appendChild(fadeOverlay);
  
  // Fade to white
  setTimeout(() => {
    fadeOverlay.style.opacity = '1';
    fadeOverlay.style.transition = 'opacity 1s ease-in';
    
    // Redirect after fade completes
    setTimeout(() => {
      window.location.href = 'levels.html';
    }, 1000);
  }, 50);
}
function pickupMagicSquare() {
  gameEnded = true;
  
  // Add visual feedback
  magicSquare.style.transform = 'scale(1.2)';
  magicSquare.style.opacity = '0.7';
  magicSquare.style.transition = 'all 0.5s ease';
  
  // Create white fade effect
  const fadeOverlay = document.createElement('div');
  fadeOverlay.className = 'fade-overlay';
  document.body.appendChild(fadeOverlay);
  
  // Fade to white
  setTimeout(() => {
    fadeOverlay.style.opacity = '1';
    fadeOverlay.style.transition = 'opacity 2s ease-in';
    
    // Redirect after fade completes
    setTimeout(() => {
      window.location.href = 'levels.html';
    }, 2000);
  }, 50);
}

// =====================
// ATTACK SYSTEM
// =====================
function startPhase(phase) {
  currentPhase = phase;
  clearInterval(currentAttackInterval); // Clear any existing attacks

  // Update mouth appearance
  bossMouth.style.transform = `translateX(-50%) scale(${mouthScale[phase-1]})`;
  setMouthState('closed');

  const attackDelays = [1700, 1500, 1500]; // Attack speeds for each phase
  
  currentAttackInterval = setInterval(() => {
    if (isFinalAttack || gameEnded) return;
    
    const attacks = getPhaseAttacks(phase);
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    
    // Attack sequence
    setMouthState('charging');
    setTimeout(() => {
      setMouthState('open');
      executeAttack(attack);
      
      setTimeout(() => setMouthState('closed'), 300);
    }, 200);
    
  }, attackDelays[phase-1]);

  // Phase progression
  if (phase < 3) {
    setTimeout(() => startPhase(phase + 1), phaseDurations[phase]);
  } else {
    setTimeout(startFinalSequence, phaseDurations[phase]);
  }
}

function getPhaseAttacks(phase) {
  return [
    ['acidSpit', 'tongueLash', 'venomSpray'],
    ['acidPool', 'rapidSpit', 'biteAttack', 'venomRain'],
    ['sonicScream', 'chasingTongue', 'meteorSpit', 'doomLaser']
  ][phase-1];
}

function executeAttack(attack) {
  if (gameEnded) return;
  
  switch (attack) {
    case 'acidSpit':
      createProjectile('acid', 5);
      break;
    case 'tongueLash':
      tongueLashAttack(false);
      break;
    case 'venomSpray':
      createVenomSpray();
      break;
    case 'acidPool':
      createAcidPool();
      break;
    case 'rapidSpit':
      createProjectile('acid', 8);
      setTimeout(() => createProjectile('acid', 8), 300);
      setTimeout(() => createProjectile('acid', 8), 600);
      break;
    case 'biteAttack':
      performBiteAttack();
      break;
    case 'venomRain':
      createVenomRain();
      break;
    case 'sonicScream':
      performSonicScream();
      break;
    case 'chasingTongue':
      tongueLashAttack(true);
      break;
    case 'meteorSpit':
      createMeteorSpit();
      break;
    case 'doomLaser':
      fireDoomLaser();
      break;
  }
}

function createProjectile(type, speed) {
  const projectile = document.createElement('div');
  projectile.className = `pixel-projectile ${type}-projectile`;
  
  const mouthRect = bossMouth.getBoundingClientRect();
  const startX = mouthRect.left - containerRect.left + mouthRect.width / 2;
  const startY = mouthRect.top - containerRect.top + mouthRect.height / 2;
  
  projectile.style.left = startX + 'px';
  projectile.style.top = startY + 'px';
  gameContainer.appendChild(projectile);
  
  const playerRect = player.getBoundingClientRect();
  const targetX = playerRect.left - containerRect.left + playerRect.width / 2;
  const targetY = playerRect.top - containerRect.top + playerRect.height / 2;
  
  const angle = Math.atan2(targetY - startY, targetX - startX);
  const velX = Math.cos(angle) * speed;
  const velY = Math.sin(angle) * speed;
  
  let posX = startX;
  let posY = startY;
  
  function updateProjectile() {
    if (gameEnded) {
      projectile.remove();
      return;
    }
    
    // Update position first
    posX += velX;
    posY += velY;
    projectile.style.left = posX + 'px';
    projectile.style.top = posY + 'px';
    
    // Then check collision
    if (checkCollision(projectile)) {
      if (!isInvincible) {
        reduceHeart();
      }
      projectile.remove();
      return; // Exit the function immediately after collision
    }
    
    // Boundary check
    if (posX < 0 || posX > gameContainer.offsetWidth || 
        posY < 0 || posY > gameContainer.offsetHeight) {
      projectile.remove();
      return;
    }
    
    requestAnimationFrame(updateProjectile);
  }
  
  updateProjectile();
}

function checkMouthCollision() {
  if (isInvincible || gameEnded) return;
  
  const mouthRect = bossMouth.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();
  
  if (!(mouthRect.right < playerRect.left ||
      mouthRect.left > playerRect.right ||
      mouthRect.bottom < playerRect.top ||
      mouthRect.top > playerRect.bottom)) {
    reduceHeart();
  }
}

function tongueLashAttack(chasing) {
  const tongue = document.createElement('div');
  tongue.className = 'pixel-tongue-attack';
  activeTongues.push(tongue);
  
  // Initial position
  updateTonguePosition(tongue);
  gameContainer.appendChild(tongue);
  const HARDRIGHTNOW = new Audio('lickMeHarder.mp3.mp3');
    HARDRIGHTNOW.play();

  // Phase-specific timing
  const extensionTime = currentPhase === 1 ? 0.4 : 0.2;
  const sustainTime = currentPhase === 1 ? 800 : 500;
  const retractionTime = currentPhase === 1 ? 0.3 : 0.15;

  // Add to your Game State section
let mouthMusic = document.getElementById('mouthMusic');
let isMusicPlaying = false;

// Add this function to control the music
function playboss() {
  if (!isMusicPlaying) {
    mouthMusic.volume = 0.7; // Set volume (0.0 to 1.0)
    mouthMusic.loop = true; // Make it loop
    const playPromise = mouthMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio playback failed:", error);
        // Fallback: Try again after user interaction
        document.addEventListener('click', () => {
          mouthMusic.play().catch(e => console.error("Still couldn't play:", e));
        }, { once: true });
      });
    }
    isMusicPlaying = true;
  }
}

// Add this function to stop the music

  setTimeout(() => {
    if (gameEnded) {
      tongue.remove();
      return;
    }
    
    tongue.style.transition = `width ${extensionTime}s ease-out, height ${extensionTime}s ease-out`;
    tongue.style.width = '250px';
    tongue.style.height = '16px';
    
    if (chasing) {
      const chaseInterval = setInterval(() => {
        if (!tongue.isConnected || gameEnded) {
          clearInterval(chaseInterval);
          return;
        }
        updateTonguePosition(tongue);
        updateTongueTarget(tongue);
      }, 50);
    } else {
      updateTongueTarget(tongue);
    }
    
    const hitInterval = setInterval(() => {
      if (gameEnded) {
        clearInterval(hitInterval);
        return;
      }
      if (checkCollision(tongue)) reduceHeart();
    }, 50);
    
    setTimeout(() => {
      clearInterval(hitInterval);
      tongue.style.transition = `width ${retractionTime}s ease-in, height ${retractionTime}s ease-in`;
      tongue.style.width = '0';
      setTimeout(() => {
        tongue.remove();
        activeTongues = activeTongues.filter(t => t !== tongue);
      }, retractionTime * 1000);
    }, sustainTime);
  }, 50);
}

function updateTonguePosition(tongue) {
  const mouthRect = bossMouth.getBoundingClientRect();
  tongue.style.left = (mouthRect.left - containerRect.left + mouthRect.width * 0.48) + 'px';
  tongue.style.top = (mouthRect.top - containerRect.top + mouthRect.height * 0.8) + 'px';
}

function updateTongueTarget(tongue) {
  const playerRect = player.getBoundingClientRect();
  const tongueX = parseFloat(tongue.style.left);
  const tongueY = parseFloat(tongue.style.top);
  
  const targetX = playerRect.left - containerRect.left + playerRect.width / 2;
  const targetY = playerRect.top - containerRect.top + playerRect.height / 2;
  
  const angle = Math.atan2(targetY - tongueY, targetX - tongueX);
  tongue.style.transform = `rotate(${angle}rad)`;
}

function createVenomSpray() {
  flashBossColor('purple');
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      if (gameEnded) return;
      
      const projectile = document.createElement('div');
      projectile.className = 'pixel-projectile venom-projectile';
      
      const mouthRect = bossMouth.getBoundingClientRect();
      const startX = mouthRect.left - containerRect.left + mouthRect.width / 2;
      const startY = mouthRect.top - containerRect.top + mouthRect.height / 2;
      
      projectile.style.left = startX + 'px';
      projectile.style.top = startY + 'px';
      gameContainer.appendChild(projectile);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 2;
      const velX = Math.cos(angle) * speed;
      const velY = Math.sin(angle) * speed;
      
      let posX = startX;
      let posY = startY;
      
      function updateProjectile() {
        if (gameEnded) {
          projectile.remove();
          return;
        }
        
        posX += velX;
        posY += velY;
        
        projectile.style.left = posX + 'px';
        projectile.style.top = posY + 'px';
        
        if (checkCollision(projectile)) {
          reduceHeart();
          projectile.remove();
          return;
        }
        
        if (posX < 0 || posX > gameContainer.offsetWidth || 
            posY < 0 || posY > gameContainer.offsetHeight) {
          projectile.remove();
          return;
        }
        
        requestAnimationFrame(updateProjectile);
      }
      
      updateProjectile();
    }, i * 100);
  }
}

function createAcidPool() {
  flashBossColor('green');
  
  const telegraph = document.createElement('div');
  telegraph.className = 'pixel-acid-telegraph';
  
  // Predict player position
  const playerRect = player.getBoundingClientRect();
  const playerVelX = (keys["arrowleft"] || keys["a"]) ? -moveSpeed : 
                    (keys["arrowright"] || keys["d"]) ? moveSpeed : 0;
  const predictedX = playerRect.left - containerRect.left + playerVelX * 0.5;
  
  telegraph.style.left = (predictedX - 40) + 'px';
  telegraph.style.bottom = '20px';
  gameContainer.appendChild(telegraph);
  
  setTimeout(() => {
    if (gameEnded) {
      telegraph.remove();
      return;
    }
    
    telegraph.remove();
    
    const pool = document.createElement('div');
    pool.className = 'pixel-acid-pool';
    pool.style.left = (predictedX - 40) + 'px';
    pool.style.bottom = '20px';
    gameContainer.appendChild(pool);
    
    activeAcidPools.push({
      element: pool,
      x: predictedX - 40,
      width: 80
    });
    
    setTimeout(() => {
      pool.remove();
      activeAcidPools = activeAcidPools.filter(p => p.element !== pool);
    }, 5000);
  }, 800);
}

function checkAcidPoolCollisions() {
  if (isInvincible || gameEnded) return;
  
  const playerRect = player.getBoundingClientRect();
  const playerLeft = playerRect.left - containerRect.left;
  const playerRight = playerLeft + playerRect.width;
  const playerBottom = playerRect.bottom - containerRect.top;
  
  if (playerBottom > groundLevel + 5) return;
  
  for (const pool of activeAcidPools) {
    const poolRight = pool.x + pool.width;
    
    if (playerRight > pool.x && playerLeft < poolRight && 
        playerBottom <= groundLevel + 5) {
      reduceHeart();
      break;
    }
  }
}

function performBiteAttack() {
  flashBossColor('red');
  gameContainer.classList.add('shake-container');
  
  const mouthRect = bossMouth.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();
  
  const mouthCenterX = mouthRect.left + mouthRect.width / 2;
  const mouthCenterY = mouthRect.top + mouthRect.height / 2;
  
  const distance = Math.sqrt(
    Math.pow(playerRect.left + playerRect.width / 2 - mouthCenterX, 2) +
    Math.pow(playerRect.top + playerRect.height / 2 - mouthCenterY, 2)
  );
  
  if (distance < 150 && !gameEnded) {
    reduceHeart();
    reduceHeart();
  }
  
  setTimeout(() => {
    gameContainer.classList.remove('shake-container');
  }, 500);
}

function createVenomRain() {
  flashBossColor('purple');
  
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      if (gameEnded) return;
      
      const projectile = document.createElement('div');
      projectile.className = 'pixel-projectile venom-projectile';
      
      const startX = Math.random() * gameContainer.offsetWidth;
      projectile.style.left = startX + 'px';
      projectile.style.top = '0px';
      gameContainer.appendChild(projectile);
      
      let posY = 0;
      const speed = 5 + Math.random() * 3;
      
      function updateProjectile() {
        if (gameEnded) {
          projectile.remove();
          return;
        }
        
        posY += speed;
        projectile.style.top = posY + 'px';
        
        if (checkCollision(projectile)) {
          reduceHeart();
          projectile.remove();
          return;
        }
        
        if (posY > gameContainer.offsetHeight) {
          projectile.remove();
          return;
        }
        
        requestAnimationFrame(updateProjectile);
      }
      
      updateProjectile();
    }, i * 300);
  }
}

function performSonicScream() {
  flashBossColor('blue');
  gameContainer.classList.add('shake-container');
  
  const scream = document.createElement('div');
  scream.className = 'pixel-sonic-scream';
  
  const mouthRect = bossMouth.getBoundingClientRect();
  scream.style.left = mouthRect.left - containerRect.left + mouthRect.width / 2 + 'px';
  scream.style.top = mouthRect.top - containerRect.top + mouthRect.height / 2 + 'px';
  gameContainer.appendChild(scream);
  
  const damageInterval = setInterval(() => {
    if (gameEnded) {
      clearInterval(damageInterval);
      return;
    }
    
    const playerRect = player.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(playerRect.left + playerRect.width / 2 - parseFloat(scream.style.left), 2) +
      Math.pow(playerRect.top + playerRect.height / 2 - parseFloat(scream.style.top), 2)
    );
    
    if (distance < 200) {
      reduceHeart();
    }
  }, 200);
  
  setTimeout(() => {
    clearInterval(damageInterval);
    scream.remove();
    gameContainer.classList.remove('shake-container');
  }, 1500);
}

function createMeteorSpit() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      if (gameEnded) return;
      
      const meteor = document.createElement('div');
      meteor.className = 'pixel-meteor-spit';
      
      const mouthRect = bossMouth.getBoundingClientRect();
      const startX = mouthRect.left - containerRect.left + mouthRect.width / 2;
      const startY = mouthRect.top - containerRect.top + mouthRect.height / 2;
      
      meteor.style.left = startX + 'px';
      meteor.style.top = startY + 'px';
      gameContainer.appendChild(meteor);
      
      const targetX = Math.random() * gameContainer.offsetWidth;
      const targetY = gameContainer.offsetHeight - groundLevel;
      
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const speed = 4;
      const velX = Math.cos(angle) * speed;
      const velY = Math.sin(angle) * speed;
      
      let posX = startX;
      let posY = startY;
      
      function updateMeteor() {
        if (gameEnded) {
          meteor.remove();
          return;
        }
        
        posX += velX;
        posY += velY;
        
        meteor.style.left = posX + 'px';
        meteor.style.top = posY + 'px';
        
        if (checkCollision(meteor)) {
          reduceHeart();
          createPixelImpactEffect(posX, posY);
          meteor.remove();
          return;
        }
        
        if (posY > gameContainer.offsetHeight - groundLevel) {
          createPixelImpactEffect(posX, posY);
          meteor.remove();
          return;
        }
        
        requestAnimationFrame(updateMeteor);
      }
      
      updateMeteor();
    }, i * 500);
  }
}

function fireDoomLaser() {
  flashBossColor('yellow');
  
  const laser = document.createElement('div');
  laser.className = 'pixel-doom-laser';
  activeLasers.push(laser);
  
  const mouthRect = bossMouth.getBoundingClientRect();
  laser.style.left = mouthRect.left - containerRect.left + mouthRect.width / 2 + 'px';
  laser.style.top = mouthRect.top - containerRect.top + mouthRect.height / 2 + 'px';
  
  const playerRect = player.getBoundingClientRect();
  const angle = Math.atan2(
    playerRect.top - containerRect.top - parseFloat(laser.style.top),
    playerRect.left - containerRect.left - parseFloat(laser.style.left)
  );
  
  laser.style.transform = `rotate(${angle}rad)`;
  gameContainer.appendChild(laser);
  
  setTimeout(() => {
    if (gameEnded) {
      laser.remove();
      return;
    }
    
    laser.style.width = '800px';
    laser.style.transition = 'width 0.3s ease-out';
    
    const hitInterval = setInterval(() => {
      if (gameEnded) {
        clearInterval(hitInterval);
        return;
      }
      if (checkCollision(laser)) {
        reduceHeart();
      }
    }, 100);
    
    setTimeout(() => {
      clearInterval(hitInterval);
      laser.style.width = '0';
      laser.style.transition = 'width 0.2s ease-in';
      
      setTimeout(() => {
        laser.remove();
        activeLasers = activeLasers.filter(l => l !== laser);
      }, 200);
    }, 1000);
  }, 100);
}

function createPixelImpactEffect(x, y) {
  const impact = document.createElement('div');
  impact.className = 'pixel-impact-effect';
  impact.style.left = x + 'px';
  impact.style.top = y + 'px';
  gameContainer.appendChild(impact);
  
  setTimeout(() => impact.remove(), 500);
}

// =====================
// COLLISION & DAMAGE
// =====================
function checkCollision(element) {
  if (isInvincible || gameEnded) return false;
  
  const elementRect = element.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();
  
  // More precise collision detection
  return (
    elementRect.right > playerRect.left &&
    elementRect.left < playerRect.right &&
    elementRect.bottom > playerRect.top &&
    elementRect.top < playerRect.bottom
  );
}

function showDamageIndicator() {
  const damageEl = document.createElement('span');
  damageEl.textContent = "-1";
  damageEl.style.position = 'absolute';
  damageEl.style.top = '-30px';
  damageEl.style.right = '-15px';
  damageEl.style.fontFamily = '"dogicabold", sans-serif'; // Changed font
  damageEl.style.fontSize = '14px';
  damageEl.style.color = 'white';
  damageEl.style.textShadow = '0 0 3px red';
  damageEl.style.zIndex = '1000';
  damageEl.style.opacity = '1';
  damageEl.style.transition = 'all 1s ease-out';

  player.appendChild(damageEl);

  setTimeout(() => {
    damageEl.style.opacity = '0';
    damageEl.style.top = '-50px';
  }, 50);

  setTimeout(() => { 
    damageEl.remove(); 
  }, 1050);
}

function reduceHeart() {
  if (isInvincible || gameEnded) return;
  
  playerHealth--;
  hearts[playerHealth].style.opacity = '0.3';
  
  isInvincible = true;
  player.classList.add('invincible');
  showDamageIndicator();
  
  // Clean up any stuck projectiles
  document.querySelectorAll('.pixel-projectile').forEach(proj => {
    if (checkCollision(proj)) proj.remove();
  });
  
  setTimeout(() => {
    isInvincible = false;
    player.classList.remove('invincible');
  }, 4000);
  
  if (playerHealth <= 0) {
    gameOver();
  }
}

function flashBossColor(color) {
  bossMouth.style.filter = `drop-shadow(0 0 10px ${color})`;
  setTimeout(() => bossMouth.style.filter = '', 300);
}

function gameOver() {
  gameEnded = true;
  clearInterval(currentAttackInterval);
  window.location.href = 'gameOver.html';
}

// =====================
// START THE GAME
// =====================
function initGame() {
  updateMouthPosition();
  startPhase(1); // This line was missing or not properly called
}

initGame();