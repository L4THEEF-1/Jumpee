// ===== INITIALIZATION =====
setTimeout(() => {
  const overlay = document.querySelector('.fade-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
  }
}, 10);
setTimeout(() => {
  const overlay = document.querySelector('.fade-overlay');
  if (overlay) {
    overlay.parentNode.removeChild(overlay);
  }
  slamSlideAttack(); 
}, 3100);


function setPhase(phase) {
    currentPhase = phase;
    document.querySelector('.phase-display').textContent = `PHASE ${phase}`;
    
    // Update eye visuals
    const eye = document.querySelector('.eye');
    eye.className = `eye phase-${phase}`;
    
    // Start bleeding if phase 2 or 3
    if (phase >= 2) startBleeding(phase === 2 ? 3 : 8);
    
    // Visual transition
    const transition = document.querySelector('.phase-transition-overlay');
    transition.style.opacity = '1';
    setTimeout(() => transition.style.opacity = '0', 1000);
}

let playerHealth = 5;
const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const eye = document.querySelector('.eye');
let finalPhaseActive = false;
let stopEyeFollow = false;
const fadeDuration = 500;
const secondHand = document.querySelector('.hand.hand2');
if (secondHand) {
  secondHand.style.display = 'none';
}
const firstHand = document.querySelector('.hand');
if (firstHand) {
  firstHand.style.zIndex = '10';
}

let playerPosX = 50;
let playerPosY = 20;
const playerSpeed = 5;
let isJumping = false;
let velocityY = 0;
const gravity = -0.5;
let isInvincible = false;
const keys = { a: false, d: false, space: false };

// ===== PHASE SYSTEM =====
let currentPhase = 1;
const PHASE_ATTACKS = {
  1: ['slamSlide', 'eyeBeamBarrage'],
  2: ['twoHandSlide', 'middleSlamAttack'], 
  3: ['laserAttack', 'pupilVortex']
};
let attacksInPhase = 0;
const ATTACKS_PER_PHASE = 5;

function setPhase(phase) {
  currentPhase = phase;
  attacksInPhase = 0;
  const phaseDisplay = document.querySelector('.phase-display');
  phaseDisplay.textContent = `PHASE ${phase}`;
  
  // Update eye visuals
  eye.className = `eye phase-${phase}`;
  
  // Phase transition effect
  const transition = document.querySelector('.phase-transition-overlay');
  transition.style.opacity = '1';
  setTimeout(() => transition.style.opacity = '0', 1000);
  
  // Phase-specific behaviors
  switch(phase) {
    case 2:
      startBleeding(3); // Moderate bleeding
      break;
    case 3:
      startBleeding(8); // Heavy bleeding
      break;
  }
  
  // Restart blinking with phase-specific frames
  blinkCycle();
}

function startBleeding(intensity) {
  // Clear existing intervals
  if (window.bloodInterval) clearInterval(window.bloodInterval);
  
  window.bloodInterval = setInterval(() => {
      for (let i = 0; i < intensity; i++) {
          createBloodParticle();
      }
  }, currentPhase === 2 ? 2500 : 1500);
}

function createBloodParticle() {
  const blood = document.createElement('div');
  blood.className = `blood-particle phase-${currentPhase}`;
  
  const eyeRect = eye.getBoundingClientRect();
  blood.style.left = `${eyeRect.left + Math.random() * eyeRect.width}px`;
  blood.style.top = `${eyeRect.top + Math.random() * eyeRect.height}px`;
  
  document.querySelector('.blood-container').appendChild(blood);
  setTimeout(() => blood.remove(), 2000);
}

function createBloodParticle() {
  const blood = document.createElement('div');
  blood.className = `blood-particle phase-${currentPhase}`;
  
  const eyeRect = eye.getBoundingClientRect();
  blood.style.left = `${eyeRect.left + Math.random() * eyeRect.width}px`;
  blood.style.top = `${eyeRect.top + Math.random() * eyeRect.height}px`;
  
  document.querySelector('.blood-container').appendChild(blood);
  setTimeout(() => blood.remove(), 2000);
}

// ===== EYE ANIMATIONS =====
const blinkFrames = [
  "url('eyes/Eyes/P1eye1.png')",
  "url('eyes/Eyes/P1eye2.png')",
  "url('eyes/Eyes/P1eye3.png')",
  "url('eyes/Eyes/P1eye4.png')",
  "url('eyes/Eyes/P1eye5.png')",
  "url('eyes/Eyes/closedEye.png')",
  "url('eyes/Eyes/P1eye5.png')",
  "url('eyes/Eyes/P1eye4.png')",
  "url('eyes/Eyes/P1eye3.png')",
  "url('eyes/Eyes/P1eye2.png')",
  "url('eyes/Eyes/P1eye1.png')"
];
const frameDuration = 30;
const blinkDelay = 2300;

function blinkCycle() {
  let currentFrame = 0;
  
  function nextFrame() {
      // Phase-specific frames
      let framePath = blinkFrames[currentFrame];
      if (currentPhase === 2) {
          framePath = framePath.replace('P1', 'P2');
      } else if (currentPhase === 3) {
          framePath = framePath.replace('P1', 'P3');
      }
      
      eye.style.backgroundImage = framePath;
      currentFrame++;
      
      if (currentFrame < blinkFrames.length) {
          setTimeout(nextFrame, frameDuration);
      } else {
          setTimeout(blinkCycle, blinkDelay);
      }
  }
  
  nextFrame();
}
blinkCycle();

let eyeCurrentX = playerPosX + player.offsetWidth / 2 - eye.offsetWidth / 2 + 110;
let eyeFollowAnimId;

// ===== PLAYER CONTROLS =====
function createTrail() {
  const trail = document.createElement('div');
  
  trail.style.position = 'absolute';
  trail.style.width = '5px';
  trail.style.height = '5px';
  trail.style.backgroundColor = 'white';
  trail.style.left = `${playerPosX + player.offsetWidth / 2 - 2.5}px`;
  trail.style.bottom = `${playerPosY + player.offsetHeight / 2 - 2.5}px`;
  trail.style.opacity = '1';
  trail.style.transition = 'opacity 0.5s linear';
  
  gameContainer.appendChild(trail);
  
  setTimeout(() => {
    trail.style.opacity = '0';
    setTimeout(() => trail.remove(), 500);
  }, 50);
}

function updatePlayer() {
  if (keys.a && playerPosX > 0) {
    playerPosX -= playerSpeed;
  }
  if (keys.d && playerPosX < gameContainer.offsetWidth - player.offsetWidth) {
    playerPosX += playerSpeed;
  }
  if (keys.space && !isJumping) {
    isJumping = true;
    velocityY = 12;
  }
  
  if (isJumping) {
    playerPosY += velocityY;
    velocityY += gravity;
    if (playerPosY <= 20) {
      playerPosY = 20;
      isJumping = false;
      velocityY = 0;
    }
  }
  
  player.style.left = `${playerPosX}px`;
  player.style.bottom = `${playerPosY}px`;
  
  if (!stopEyeFollow) {
    const eyeOffset = 0;
    const targetEyeX = playerPosX + player.offsetWidth / 2 - eye.offsetWidth / 2 + eyeOffset;
    const smoothingFactor = 0.05;
    eyeCurrentX += (targetEyeX - eyeCurrentX) * smoothingFactor;
    eye.style.left = `${eyeCurrentX}px`;
  }
  
  createTrail();
  eyeFollowAnimId = requestAnimationFrame(updatePlayer);
}
updatePlayer();

// ===== ATTACK SYSTEM =====
function startAttackCycle() {
  if (attacksInPhase >= ATTACKS_PER_PHASE) {
    if (currentPhase < 3) {
      setPhase(currentPhase + 1);
    } else {
      finalSequence();
    }
    return;
  }
  
  const attacks = PHASE_ATTACKS[currentPhase];
  const attack = attacks[Math.floor(Math.random() * attacks.length)];
  executeAttack(attack);
  attacksInPhase++;
}

function executeAttack(attackName) {
  switch(attackName) {
    case 'slamSlide':
      slamSlideAttack();
      break;
    case 'twoHandSlide':
      twoHandSlideAttack();
      break;
    case 'middleSlamAttack':
      middleSlamAttack();
      break;
    case 'laserAttack':
      laserAttack(0);
      break;
    case 'eyeBeamBarrage':
      eyeBeamBarrage();
      break;
    case 'pupilVortex':
      pupilVortexAttack();
      break;
  }
}

function eyeBeamBarrage() {
  let beamsFired = 0;
  
  function fireBeam() {
      if (beamsFired >= 8) {
          startAttackCycle();
          return;
      }
      
      const beam = document.createElement('div');
      beam.className = 'mini-laser';
      const eyeRect = eye.getBoundingClientRect();
      const playerRect = player.getBoundingClientRect();
      
      // Position beam at eye
      beam.style.left = `${eyeRect.left + eyeRect.width/2}px`;
      beam.style.top = `${eyeRect.top + eyeRect.height/2}px`;
      
      // Aim at player
      const angle = Math.atan2(
          playerRect.top - eyeRect.top,
          playerRect.left - eyeRect.left
      );
      beam.style.transform = `rotate(${angle}rad)`;
      
      gameContainer.appendChild(beam);
      
      // Collision check
      const beamInterval = setInterval(() => {
          if (checkBeamCollision(beam)) {
              reduceHeart();
              clearInterval(beamInterval);
          }
      }, 50);
      
      setTimeout(() => {
          clearInterval(beamInterval);
          beam.remove();
      }, 500);
      
      beamsFired++;
      setTimeout(fireBeam, 300);
  }
  
  fireBeam();
}

function pupilVortexAttack() {
  const vortex = document.querySelector('.pupil-vortex');
  const eyeRect = eye.getBoundingClientRect();
  
  // Position vortex
  vortex.style.left = `${eyeRect.left + eyeRect.width/2 - 50}px`;
  vortex.style.top = `${eyeRect.top + eyeRect.height/2 - 50}px`;
  vortex.style.opacity = '1';
  vortex.style.transform = 'scale(1)';
  
  // Pull effect
  const pullInterval = setInterval(() => {
      const playerRect = player.getBoundingClientRect();
      const vortexRect = vortex.getBoundingClientRect();
      
      // Calculate pull direction
      const dx = vortexRect.left + vortexRect.width/2 - (playerRect.left + playerRect.width/2);
      const dy = vortexRect.top + vortexRect.height/2 - (playerRect.top + playerRect.height/2);
      
      // Apply pull force
      playerPosX += dx * 0.02;
      playerPosY += dy * 0.02;
      
      // Check collision
      if (Math.hypot(dx, dy) < 30) reduceHeart();
  }, 50);
  
  setTimeout(() => {
      clearInterval(pullInterval);
      vortex.style.opacity = '0';
      vortex.style.transform = 'scale(0)';
      startAttackCycle();
  }, 5000);
}

// ===== ORIGINAL ATTACKS (RENAMED) =====
function slamSlideAttack() {
  let iteration = 0;
  
  function doIteration() {
    const hand = document.querySelector('.hand');
    if (iteration >= 3) {
      eye.classList.add('red-eye');
    } else {
      eye.classList.remove('red-eye');
    }
    
    let chargePhase, chargeDelay, slamPhase, slideDuration, waitBetween;
    if (iteration < 3) {
      chargePhase = 400;
      chargeDelay = 200;
      slamPhase = 400;
      slideDuration = 1000;
      waitBetween = 500;
    } else {
      chargePhase = 300;
      chargeDelay = 150;
      slamPhase = 350;
      slideDuration = 800;
      waitBetween = 400;
    }
    
    const totalUpDownDuration = chargePhase + chargeDelay + slamPhase;
    const gameWidth = gameContainer.offsetWidth;
    const handWidth = hand.offsetWidth;
    const restingY = gameContainer.offsetHeight - hand.offsetHeight - 10;
    const startingY = restingY - 150;
    const chargeTop = startingY - 30;
    const randomX = Math.random() * (gameWidth - handWidth);
    
    hand.style.transition = 'none';
    hand.style.left = `${randomX}px`;
    hand.style.top = `${startingY}px`;
    void hand.offsetWidth;
    
    hand.style.transition = `top ${chargePhase}ms ease-out`;
    hand.style.top = `${chargeTop}px`;
    
    setTimeout(() => {
      thudSound.play().catch(err => console.error("Thud sound error:", err));
      
      hand.style.transition = `top ${slamPhase}ms ease-in`;
      hand.style.top = `290px`;
      
      setTimeout(() => {
        let colInterval = setInterval(() => {
          const playerRect = player.getBoundingClientRect();
          const handRect = hand.getBoundingClientRect();
          if (playerRect.right > handRect.left &&
              playerRect.left < handRect.right &&
              playerRect.bottom > handRect.top) {
            reduceHeart();
            clearInterval(colInterval);
          }
        }, 50);
        setTimeout(() => { clearInterval(colInterval); }, 300);
        
        document.body.classList.add('shake');
        setTimeout(() => { document.body.classList.remove('shake'); }, 500);
        
        const newPlayerRect = player.getBoundingClientRect();
        const newHandRect = hand.getBoundingClientRect();
        const playerCenterX = newPlayerRect.left + newPlayerRect.width / 2;
        const handCenterX = newHandRect.left + newHandRect.width / 2;
        
        hand.style.transition = `left ${slideDuration}ms ease-out`;
        if (playerCenterX < handCenterX) {
          hand.style.left = `-${handWidth + 20}px`;
        } else {
          hand.style.left = `${gameWidth + 20}px`;
        }
        
        let slideInterval = setInterval(() => {
          const playerRect = player.getBoundingClientRect();
          const handRect = hand.getBoundingClientRect();
          if (playerRect.right > handRect.left &&
              playerRect.left < handRect.right &&
              playerRect.bottom > handRect.top) {
            reduceHeart();
            clearInterval(slideInterval);
          }
        }, 50);
        setTimeout(() => { clearInterval(slideInterval); }, 300);
      }, slamPhase);
    }, chargePhase + chargeDelay);
    
    const iterationDuration = totalUpDownDuration + slideDuration + waitBetween;
    iteration++;
    if (iteration < 8) {
      setTimeout(doIteration, iterationDuration);
    } else {
      setTimeout(() => finalSequence(1), waitBetween);
    }
  }
  
  doIteration();
}

function twoHandSlideAttack(iteration = 0, callback) {
  if (iteration >= 3) {
    setTimeout(() => {
      if (callback) callback();
    }, 400);
    return;
  }
  
  secondHand.style.display = 'block';
  secondHand.style.opacity = '1';
  
  const commonY = gameContainer.offsetHeight - firstHand.offsetHeight - 10;
  const cPhase = 300;
  const cDelay = 150;
  const sPhase = 350;
  const slideDur = 2000;
  const waitB = 400;
  const cOffset = 30;
  const chargeTop = commonY - cOffset;
  
  firstHand.style.transition = `top ${cPhase}ms ease-out`;
  secondHand.style.transition = `top ${cPhase}ms ease-out`;
  firstHand.style.top = `${chargeTop}px`;
  secondHand.style.top = `${chargeTop}px`;
  
  setTimeout(() => {
    firstHand.style.transition = `top ${sPhase}ms ease-in`;
    secondHand.style.transition = `top ${sPhase}ms ease-in`;
    firstHand.style.top = `${commonY}px`;
    secondHand.style.top = `${commonY}px`;
    
    setTimeout(() => {
      let colInterval = setInterval(() => {
        const playerRect = player.getBoundingClientRect();
        const firstHandRect = firstHand.getBoundingClientRect();
        const secondHandRect = secondHand.getBoundingClientRect();
        
        // Enhanced center collision
        const betweenHands = playerRect.right > firstHandRect.left && 
                           playerRect.left < secondHandRect.right;
        const heightOverlap = playerRect.bottom > firstHandRect.top;
        
        if (betweenHands && heightOverlap) {
          reduceHeart();
          clearInterval(colInterval);
        }
      }, 50);
      
      setTimeout(() => { clearInterval(colInterval); }, 300);
      showExclamation();
      
      firstHand.style.transition = `left ${slideDur}ms ease-out`;
      secondHand.style.transition = `left ${slideDur}ms ease-out`;
      firstHand.style.left = '1200px';
      secondHand.style.left = '-200px';
      
      setTimeout(() => {
        firstHand.style.transition = 'none';
        secondHand.style.transition = 'none';
        firstHand.style.left = `-100px`;
        firstHand.style.top = `${commonY}px`;
        secondHand.style.left = `800px`;
        secondHand.style.top = `${commonY}px`;
        secondHand.style.opacity = '1';
        
        setTimeout(() => {
          twoHandSlideAttack(iteration + 1, callback);
        }, waitB);
      }, slideDur);
    }, sPhase + cDelay);
  }, 0);
}

function middleSlamAttack(callback) {
  let slamIteration = 0;
  
  function doSlam() {
    if (slamIteration >= 4) { 
      if (callback) callback(); 
      cyclePhasesSecond();
      return; 
    }
    
    secondHand.style.display = 'none';
    firstHand.style.transition = 'transform 0.5s ease-out';
    firstHand.style.transform = 'scale(1.5)';
    
    const targetX = gameContainer.offsetWidth / 2 - firstHand.offsetWidth / 2;
    const floatY = 100;
    firstHand.style.transition += ', left 1s ease-out, top 1s ease-out';
    firstHand.style.left = `${targetX}px`;
    firstHand.style.top = `${floatY}px`;
    
    setTimeout(() => {
      createIndicatorLines();
      
      setTimeout(() => {
        const groundY = gameContainer.offsetHeight - firstHand.offsetHeight - 10;
        firstHand.style.transition = 'top 0.3s ease-in';
        firstHand.style.top = `280px`;
        
        document.body.classList.add('shake');
        setTimeout(() => { document.body.classList.remove('shake'); }, 500);
        
        removeIndicatorLines();
        spawnRedSquares();
        
        setTimeout(() => {
          firstHand.style.transition = 'transform 0.5s ease-out, left 1s ease-out, top 1s ease-out';
          firstHand.style.transform = 'scale(1)';
          const startX = gameContainer.offsetWidth - firstHand.offsetWidth;
          const startY = gameContainer.offsetHeight - 10 - 20;
          firstHand.style.left = `${startX}px`;
          firstHand.style.top = `${startY}px`;
          
          setTimeout(() => {
            slamIteration++;
            doSlam();
          }, 1000);
        }, 800);
      }, 1000);
    }, 1000);
  }
  
  doSlam();
}

// ===== PLAYER HEALTH SYSTEM =====
function showDamageIndicator() {
  const damageEl = document.createElement('span');
  damageEl.textContent = "-1";
  damageEl.style.position = 'absolute';
  damageEl.style.top = '-30px';
  damageEl.style.right = '-15px';
  damageEl.style.fontFamily = 'bpx';
  damageEl.style.fontSize = '14px';
  damageEl.style.color = 'white';
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



const damageSound = new Audio("damagedAhh.mp3");
damageSound.volume = 0.1;

function reduceHeart() {
  if (isInvincible) return;
  
  if (playerHealth > 0) {
    const heart = document.getElementById(`heart${playerHealth}`);
    if (heart) {
      heart.style.opacity = '0.3';
    }
    
    damageSound.play().catch(err => console.error("Damage sound error:", err));
    playerHealth--;
    console.log("Player hit! Remaining health: " + playerHealth);
    
    isInvincible = true;
    showDamageIndicator();
    setPlayerInvincible(3000);
    setTimeout(() => {
      isInvincible = false;
    }, 3000);
  }
  
  if (playerHealth === 0) {
    console.log("Game Over");
    window.location.href = "gameOver.html";
  }
}

function setPlayerInvincible(duration) {
  player.classList.add('invincible');
  setTimeout(() => {
    player.classList.remove('invincible');
  }, duration);
}

// ===== UTILITY FUNCTIONS =====
function showExclamation() {
  const exclamation = document.createElement('span');
  exclamation.textContent = '!';
  exclamation.style.position = 'absolute';
  exclamation.style.fontFamily = 'bpx';
  exclamation.style.fontSize = '14px';
  exclamation.style.color = 'white';
  exclamation.style.zIndex = '1000';
  exclamation.style.left = '50%';
  exclamation.style.top = '-20px';
  exclamation.style.transform = 'translateX(-50%)';
  exclamation.style.opacity = '1';
  exclamation.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';

  player.appendChild(exclamation);

  setTimeout(() => {
    exclamation.style.opacity = '0';
    exclamation.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 50);

  setTimeout(() => {
    exclamation.remove();
  }, 600);
}

function isColliding(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

let indicatorPositions = [];
function createIndicatorLines() {
  indicatorPositions = [];
  const startY = gameContainer.offsetHeight - 30;
  let container = document.createElement('div');
  container.id = 'indicator-lines';
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  
  for (let i = 0; i < 5; i++) {
    let line = document.createElement('div');
    line.className = 'indicator-line';
    let randomX = Math.random() * (gameContainer.offsetWidth - 12);
    indicatorPositions.push(randomX);
    line.style.position = 'absolute';
    line.style.width = '12px';
    line.style.height = '100px';
    line.style.backgroundColor = 'rgba(255,255,255,0.5)';
    line.style.left = `${randomX}px`;
    line.style.top = `${startY}px`;
    container.appendChild(line);
  }
  
  gameContainer.appendChild(container);
}

function removeIndicatorLines() {
  let container = document.getElementById('indicator-lines');
  if (container) container.parentNode.removeChild(container);
}

function spawnRedSquares() {
  const numSquares = 5;
  const startY = gameContainer.offsetHeight - 30;
  
  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement('div');
    square.className = 'red-square';
    square.style.width = '20px';
    square.style.height = '20px';
    square.style.backgroundColor = 'white';
    square.style.position = 'absolute';
    square.style.animation = "rotateSquare 1s linear infinite";
    const squareX = indicatorPositions[i] + (12 / 2) - (20 / 2);
    square.style.left = `${squareX}px`;
    square.style.top = `${startY}px`;
    gameContainer.appendChild(square);
    
    setTimeout(() => {
      square.style.transition = 'top 0.5s ease-out';
      square.style.top = `${startY - 100}px`;
    }, 50);
    
    setTimeout(() => {
      square.style.transition = 'top 0.7s ease-in';
      square.style.top = `${startY}px`;
    }, 600);
    
    const intervalId = setInterval(() => {
      const squareRect = square.getBoundingClientRect();
      const playerRect = player.getBoundingClientRect();
      if (playerRect.right > squareRect.left && 
          playerRect.left < squareRect.right && 
          playerRect.bottom > squareRect.top) {
        reduceHeart();
      }
    }, 50);
    
    setTimeout(() => {
      clearInterval(intervalId);
      if (square.parentNode) square.parentNode.removeChild(square);
    }, 1500);
  }
}

function pointToSegmentDistance(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - ax, py - ay);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - bx, py - by);
  const bRatio = c1 / c2;
  const projx = ax + bRatio * vx;
  const projy = ay + bRatio * vy;
  return Math.hypot(px - projx, py - projy);
}

// ===== PHASE TRANSITIONS =====
function finalSequence(roblox, callback) {
  stopEyeFollow = true;
  eye.classList.remove('red-eye');
  const eyeCenterX = gameContainer.offsetWidth / 2 - eye.offsetWidth / 2;
  const eyeCenterY = gameContainer.offsetHeight / 2 - eye.offsetHeight / 2;
  eye.style.transition = 'left 1s ease-out, top 1s ease-out';
  eye.style.left = `${eyeCenterX}px`;
  eye.style.top = `${eyeCenterY}px`;
  
  setTimeout(() => {
    eye.classList.add('vigorously-shaking');
    const commonY = gameContainer.offsetHeight - firstHand.offsetHeight - 10;
    firstHand.style.transition = 'left 1s ease-out, top 1s ease-out, opacity 1s ease-out';
    firstHand.style.opacity = '1';
    firstHand.style.left = `${gameContainer.offsetWidth - firstHand.offsetWidth}px`;
    firstHand.style.top = `${commonY}px`;
    secondHand.style.display = 'block';
    secondHand.style.transition = 'left 1s ease-out, top 1s ease-out, opacity 1s ease-out';
    secondHand.style.opacity = '1';
    secondHand.style.left = '0px';
    secondHand.style.top = `${commonY}px`;
    firstHand.classList.add('vigorously-shaking');
    secondHand.classList.add('vigorously-shaking');
    
    setTimeout(() => {
      firstHand.style.transition = 'transform 0.5s ease-out';
      secondHand.style.transition = 'transform 0.5s ease-out';
      firstHand.style.transform = 'scale(1.1)';
      secondHand.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        firstHand.classList.remove('vigorously-shaking');
        secondHand.classList.remove('vigorously-shaking');
        
        if (roblox === 1) {
          cyclePhases();
        } else if (roblox === 2) {
          if (callback) callback();
        }
      }, 500);
    }, 500);
  }, 1000);
}

function cyclePhases() {
  twoHandSlideAttack(0, function() {
    middleSlamAttack(function() {
      // Phase continues
    });
  });
}

function cyclePhasesSecond() {
  finalSequence(2, function() {
    twoHandSlideAttack(0, function() {
      laserAttack(0);
    });
  });
}

function endCycles() {
  eye.style.transform = 'scale(1) rotate(0deg) translate(0, 0)';
  eye.style.transition = 'transform 2s ease-out';
  void eye.offsetWidth;
  
  const randomX = (Math.random() - 0.5) * 200;
  const randomY = (Math.random() - 0.5) * 200;
  eye.style.transform = `scale(2) rotate(720deg) translate(${randomX}px, ${randomY}px)`;
  
  setTimeout(() => {
    explodeEye();
  }, 2200);
}

function explodeEye() {
  const eyeRect = eye.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  const eyeCenterX = eyeRect.left - containerRect.left + eyeRect.width / 2;
  const eyeCenterY = eyeRect.top - containerRect.top + eyeRect.height / 2;
  
  eye.style.display = 'none';
  
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    particle.className = 'red-particle';
    particle.style.position = 'absolute';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.backgroundColor = 'red';
    particle.style.left = `${eyeCenterX - 5}px`;
    particle.style.top = `${eyeCenterY - 5}px`;
    particle.style.opacity = '1';
    particle.style.transition = 'transform 2s ease-out, opacity 2s ease-out';
    gameContainer.appendChild(particle);
    
    void particle.offsetWidth;
    
    const fallDistance = (gameContainer.offsetHeight - eyeCenterY) + Math.random() * 50;
    const rotateDeg = 360 * Math.random();
    const randomXOffset = (Math.random() - 0.5) * 100;
    particle.style.transform = `translate(${randomXOffset}px, ${fallDistance}px) rotate(${rotateDeg}deg)`;
    particle.style.opacity = '0';
    
    setTimeout(() => {
      particle.remove();
    }, 2000);
  }

  
  
  const blueSquare = document.createElement('div');
  blueSquare.id = 'blue-square';
  blueSquare.style.position = 'absolute';
  blueSquare.style.width = '40px';
  blueSquare.style.height = '40px';
  blueSquare.style.backgroundImage = 'blueKey.png';
  blueSquare.style.imageRendering = 'pixelated'
  blueSquare.style.left = `${eyeCenterX - 20}px`;
  blueSquare.style.top = `${eyeCenterY - 20}px`;
  gameContainer.appendChild(blueSquare);
  
  const checkBlueInterval = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    const blueRect = blueSquare.getBoundingClientRect();
    if (isColliding(playerRect, blueRect)) {
      clearInterval(checkBlueInterval);
      showPickupPrompt(blueSquare);
    }
  }, 100);
}

function showPickupPrompt(blueSquare) {
  const prompt = document.createElement('div');
  prompt.id = 'pickup-prompt';
  prompt.textContent = "Press F to pickup";
  prompt.style.position = 'absolute';
  prompt.style.color = 'white';
  prompt.style.fontFamily = 'bpx, sans-serif';
  prompt.style.fontSize = '18px';
  prompt.style.backgroundColor = 'rgba(0,0,0,0.6)';
  prompt.style.padding = '5px 10px';
  prompt.style.borderRadius = '4px';
  
  const blueRect = blueSquare.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  prompt.style.left = `${blueRect.left - containerRect.left}px`;
  prompt.style.top = `${blueRect.top - containerRect.top - 40}px`;
  gameContainer.appendChild(prompt);
  
  function handlePickup(e) {
    if (e.key === 'f' || e.key === 'F') {
      prompt.remove();
      blueSquare.remove();
      document.removeEventListener('keydown', handlePickup);
      startWhiteoutAndRedirect();
    }
  }
  
  document.addEventListener('keydown', handlePickup);
}

function startWhiteoutAndRedirect() {
  const overlay = document.createElement('div');
  overlay.id = 'whiteout-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'white';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'opacity 2s ease-out';
  document.body.appendChild(overlay);
  
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
  
  setTimeout(() => {
    window.location.href = 'levels.html';
  }, 2500);
}

// ===== LASER ATTACK =====
function laserAttack(iteration, callback) {
  if (iteration === 0) {
    firstHand.style.display = 'none';
    secondHand.style.display = 'none';
  }

  if (iteration >= 10) {
    firstHand.style.display = 'block';
    secondHand.style.display = 'block';
    endCycles();
    return;
  }

  const containerRect = gameContainer.getBoundingClientRect();
  const eyeRect = eye.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  const eyeCenterX = eyeRect.left - containerRect.left + eyeRect.width / 2;
  const eyeCenterY = eyeRect.top - containerRect.top + eyeRect.height / 2;
  const playerCenterX = playerRect.left - containerRect.left + playerRect.width / 2;
  const playerCenterY = playerRect.top - containerRect.top + playerRect.height / 2;

  const deltaX = playerCenterX - eyeCenterX;
  const deltaY = playerCenterY - eyeCenterY;
  const angle = Math.atan2(deltaY, deltaX);
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  const indicator = document.createElement('div');
  indicator.style.position = 'absolute';
  indicator.style.left = `${eyeCenterX}px`;
  indicator.style.top = `${eyeCenterY}px`;
  indicator.style.width = `${distance}px`;
  indicator.style.height = '2px';
  indicator.style.backgroundColor = 'white';
  indicator.style.transformOrigin = '0 50%';
  indicator.style.transform = `rotate(${angle}rad)`;
  indicator.style.opacity = '1';
  gameContainer.appendChild(indicator);

  setTimeout(() => {
    indicator.remove();

    const laserBeam = document.createElement('div');
    laserBeam.style.position = 'absolute';
    laserBeam.style.left = `${eyeCenterX}px`;
    laserBeam.style.top = `${eyeCenterY}px`;
    laserBeam.style.width = `${distance}px`;
    laserBeam.style.height = '4px';
    laserBeam.style.backgroundColor = 'red';
    laserBeam.style.transformOrigin = '0 50%';
    laserBeam.style.transform = `rotate(${angle}rad)`;
    laserBeam.style.opacity = '1';
    laserBeam.style.zIndex = '1000';
    gameContainer.appendChild(laserBeam);

    const currentPlayerRect = player.getBoundingClientRect();
    const currentPlayerCenterX = currentPlayerRect.left - containerRect.left + currentPlayerRect.width / 2;
    const currentPlayerCenterY = currentPlayerRect.top - containerRect.top + currentPlayerRect.height / 2;
    const endX = eyeCenterX + distance * Math.cos(angle);
    const endY = eyeCenterY + distance * Math.sin(angle);
    const d = pointToSegmentDistance(currentPlayerCenterX, currentPlayerCenterY, eyeCenterX, eyeCenterY, endX, endY);
    
    if (d < 20) {
      reduceHeart();
    }

    setTimeout(() => {
      laserBeam.style.opacity = '0';
      setTimeout(() => {
        laserBeam.remove();
      }, 200);
    }, 200);

    setTimeout(() => {
      laserAttack(iteration + 1, callback);
    }, 500);
  }, 1000);
}

// ===== SOUND EFFECTS =====
const thudSound = new Audio("thudSound.mp3");
thudSound.volume = 0.5;
const handWhooshSound = new Audio("handWhoosh.mp3");
handWhooshSound.volume = 0.5;

// ===== MUSIC SYSTEM =====
const bossMusic = new Audio("eyeMusic.mp3");
bossMusic.volume = 0.5;
let musicStarted = false;

document.addEventListener('keydown', function handleD(e) {
  if (!musicStarted && (e.key === 'd' || e.key === 'D')) {
    bossMusic.play()
      .then(() => {
        musicStarted = true;
        document.removeEventListener('keydown', handleD);
      })
      .catch(err => console.error("Boss music error:", err));
  }
});

// ===== EVENT LISTENERS =====
window.addEventListener('keydown', (event) => {
  if (event.key === 'a') keys.a = true;
  if (event.key === 'd') keys.d = true;
  if (event.key === ' ') keys.space = true;
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'a') keys.a = false;
  if (event.key === 'd') keys.d = false;
  if (event.key === ' ') keys.space = false;
});

// ===== START GAME =====
setPhase(1);