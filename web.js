let eyeOpen = false;
let frameIndex = 1;
let animationInterval;
const totalFrames = 6; // Total number of frames in your animation

function preloadImages() {
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = `images/frame_${i}.png`; // Adjust the path if needed.  Assumes images are named frame_1.png, frame_2.png, etc.
    }
}

function animateEye() {
    if (eyeOpen) {
        frameIndex++;
        if (frameIndex > totalFrames) {
            frameIndex = totalFrames; // Stop at the last frame
            clearInterval(animationInterval); // Stop animation
        }
    } else {
        frameIndex--;
        if (frameIndex < 1) {
            frameIndex = 1;  // Stop at the first frame
            clearInterval(animationInterval);
        }
    }

    //show the frame.
    const frameId = `frame_${frameIndex}`;
    const frames = document.querySelectorAll('.eye-frame'); //Gets all the frames.
    frames.forEach(frame => { //Hides all the frames.
        frame.style.opacity = 0;
    });
    document.getElementById(frameId).style.opacity = 1; //Shows the frame we want.
}

function handleMouseEnter() {
    if (!eyeOpen) {
        eyeOpen = true;
        clearInterval(animationInterval); // Clear any existing interval
        frameIndex = 1;
        animateEye();
        animationInterval = setInterval(animateEye, 50); // Adjust for animation speed, 100 is good for 3 frames.
    }
}

function handleMouseLeave() {
    if (eyeOpen) {
        eyeOpen = false;
        clearInterval(animationInterval);
        animateEye();
        animationInterval = setInterval(animateEye, 50);
    }
}

window.onload = function() {
    preloadImages(); // Start preloading images
    const eyeContainer = document.getElementById('eye-container');
    eyeContainer.addEventListener('mouseenter', handleMouseEnter);
    eyeContainer.addEventListener('mouseleave', handleMouseLeave);
};

//portfolio page
let moon = document.getElementById('moon');
let mountain = document.getElementById('mountain');
let road = document.getElementById('road');
let text = document.getElementById('text');

window.addEventListener('scroll', function () {
  let value = window.scrollY;

  moon.style.top = value * 0.7 + 'px';
  moon.style.scale = 1 - value / 1500; // Adjust '600' to control fade speed
  moon.style.opacity = 1 - value / 600; // Adjust '600' to control fade speed
  mountain.style.top = -value * 0.3 + 'px';
  road.style.top = value * 0.15 + 'px'
  text.style.top = value * 1 + 'px';
  moon.style.top = value * 0.7 + 'px';

});

let mountain2 = document.getElementById('mountain2');
let road2 = document.getElementById('road2');
let text2 = document.getElementById('text2');

window.addEventListener('scroll', function () {
  let value = window.scrollY;

  mountain2.style.top = -value * 0.3 + 'px';
  road2.style.top = value * 0.15 + 'px'
  text2.style.top = value * 1 + 'px';
  moon2.style.top = value * 0.7 + 'px';

});

//game page

function openModal(img) {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImage");
    modal.style.display = "block";
    modalImg.src = img.src;
  }

  function closeModal() {
    document.getElementById("imgModal").style.display = "none";
  }