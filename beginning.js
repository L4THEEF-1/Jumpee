const player = document.querySelector('.player');
const platform = document.querySelector('.platform');
const disappear = document.getElementById('deathSen');
const eye = document.querySelector('.eye');

let playerSpeed = 5;
let jumpPower = 10;
let gravity = 0.5;
let velocityY = 0;
let isJumping = false;
let isOnGround = false;

let left = 100;
let bottom = 50;
let moveLeft = false;
let moveRight = false;
let bossActivated = false;
let talking = 1;
eye.style.opacity = '0';

let isMusicPlaying = false;
let bossMusic = new Audio("eyeMusic.mp3");

function updatePosition() {
    player.style.left = `${left}px`;
    player.style.bottom = `${bottom}px`;
    console.log(`Left Position: ${left}`);
}

function playLoopingMusic() {
    bossMusic.loop = true;
    bossMusic.play();
}

function stopBossMusic() {
    bossMusic.pause();
    bossMusic.currentTime = 0;
}

function gameLoop() {
    console.log("Game loop running");
    if (!isOnGround) {
        velocityY -= gravity;
    } else {
        velocityY = 0;
    }

    bottom += velocityY;
    if (bottom <= 20) {
        bottom = 20;
        isOnGround = true;
    } else {
        isOnGround = false;
    }

    if (moveLeft) {
        left -= playerSpeed;
        if (left < 0) left = 0;
    }
    if (moveRight) {
        left += playerSpeed;
        if (left > 750) left = 750;
    }

    updatePosition();
    requestAnimationFrame(gameLoop);
}

function jump() {
    if (isOnGround) {
        velocityY = jumpPower;
        isOnGround = false;
    }
}

function triggerFlashbang() {
    let flashbang = document.createElement('div');
    flashbang.classList.add('flashbang');
    document.body.appendChild(flashbang);

    document.body.classList.add('shake');

    flashbang.style.opacity = 1;  

    setTimeout(() => {
        flashbang.style.transition = 'opacity 1s'; 
        flashbang.style.opacity = 0;  
    }, 1);

    setTimeout(() => {
        document.body.removeChild(flashbang);
        document.body.classList.remove('shake');
    }, 1000);
}



const texts = [
    "Why did you awaken me from my slumber?",
    "You dare challenge me, mortal?",
    "..."
];

let index = 0;

function displayText(onComplete = null) {
    if (index >= texts.length) {
        if (onComplete) onComplete(); 
        return;
    }

    const container = document.getElementById("text");
    container.innerHTML = "";
    container.style.visibility = "visible";

    let i = 0;
    function typeLetter() {
        if (i < texts[index].length) {
            let span = document.createElement("span");
            span.textContent = texts[index][i];
            span.classList.add("letter");
            container.appendChild(span);

            let typingSound = new Audio("typingSound.mp3");
            typingSound.currentTime = 0;
            typingSound.play();

            i++;
            setTimeout(typeLetter, 50);
        } else {
            setTimeout(() => {
                index++;
                if (index < texts.length) {
                    displayText(onComplete); 
                } else {
                    setTimeout(() => {
                        container.classList.add("fade-out");
                        if (onComplete) onComplete(); 
                    }, 2000);
                }
            }, 2500);
        }
    }
    typeLetter();
}

function fadeOutEye() {
    console.log("Fading out the eye...");
    eye.classList.add("fade-out-shrink");

   
    setTimeout(() => {
        eye.style.display = "none";
    }, 1500); }

    function hideEye() {
        const eye = document.querySelector('.eye');
        eye.style.animation = "none"; 
        void eye.offsetWidth; 
        eye.classList.add('shrink-fade');
    }
    

document.addEventListener('keydown', (e) => {
    console.log(`Key pressed: ${e.key}`);
    if (e.key === 'a') {
        moveLeft = true;
    } else if (e.key === 'd') {
        moveRight = true;
    } else if (e.key === ' ') {
        jump();
    } else if (e.key === 'e' && !bossActivated) {
        let thud = new Audio('thud.mp3');
        thud.play();
        let bAwaken = new Audio('bossAwaken.mp3');
        bAwaken.play();
        isMusicPlaying = true;
        playLoopingMusic();
        eye.style.opacity = '1';
        disappear.style.opacity = '0';
        disappear.style.display = 'none';
        triggerFlashbang();
        bossActivated = true;
        setTimeout(() => {
            displayText(() => {
                console.log("Say goodbye to eyeeee");
                fadeOutEye();
                setTimeout(function() {
                    window.location.href = "bossOne.html"
                }, 2000);
            });
        }, 500);
    }
});

document.addEventListener('keyup', (e) => {
    console.log(`Key released: ${e.key}`);
    if (e.key === 'a') {
        moveLeft = false;
    } else if (e.key === 'd') {
        moveRight = false;
    }
});

requestAnimationFrame(gameLoop);