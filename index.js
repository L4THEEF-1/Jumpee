const player = document.querySelector('.player');
const platform = document.querySelector('.platform');

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

function updatePosition() {
    player.style.left = `${left}px`;
    player.style.bottom = `${bottom}px`;
}

function gameLoop() {
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
        if (left > 750) window.location.href = "beginning.html";
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'a') {
        moveLeft = true;
    } else if (e.key === 'd') {
        moveRight = true;
    } else if (e.key === ' ') {
        jump();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'a') {
        moveLeft = false;
    } else if (e.key === 'd') {
        moveRight = false;
    }
});

gameLoop();
