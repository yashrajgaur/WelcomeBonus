// --- 1. COIN ANIMATION (ZERO GRAVITY) ---
function initCoins() {
    console.log("Initializing Zero Gravity Coins...");
    const container = document.getElementById('coinContainer');
    
    if (!container) {
        console.error("Coin container not found!");
        return;
    }

    const coinCount = 15; 
    
    const coinImages = [
        'coin1.png', 
        'coin2.png', 
        'coin3.png', 
        'coin4.png', 
        'coin5.png', 
        'coin6.png'
    ];

    for (let i = 0; i < coinCount; i++) {
        const coin = document.createElement('img');
        coin.classList.add('coin-floating');
        
        const imgName = coinImages[Math.floor(Math.random() * coinImages.length)];
        coin.src = encodeURIComponent(imgName); // Ensure proper encoding
        coin.alt = "Bonus Coin";
        
        const size = Math.random() * 100 + 80; 
        const left = Math.random() * 100; 
        const top = Math.random() * 100; 
        const duration = Math.random() * 15 + 15; 
        const delay = Math.random() * 5; 
        
        coin.style.width = `${size}px`;
        coin.style.left = `${left}%`;
        coin.style.top = `${top}%`;
        
        coin.style.animation = `zeroGravity ${duration}s ease-in-out -${delay}s infinite alternate`;
        coin.style.opacity = Math.random() * 0.3 + 0.7;

        container.appendChild(coin);
    }
}

// --- 2. INITIALIZATION ---
window.onload = function() {
    initCoins();
    initScratchCard();
};

// --- 3. SCRATCH CARD LOGIC ---
function initScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    let isDrawing = false;
    let revealed = false;

    // Check if already revealed in previous session
    if (localStorage.getItem('bonusRevealed') === 'true') {
        canvas.style.display = 'none';
        triggerSuccessEffects(false); // Trigger toast but no fireworks if returning
        return;
    }

    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Create the "Scratch" Cover
    ctx.fillStyle = "#C0C0C0"; // Fallback silver
    
    // Create a Gradient for the scratch surface
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#9E9E9E');
    gradient.addColorStop(0.5, '#E0E0E0');
    gradient.addColorStop(1, '#9E9E9E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add Text "SCRATCH HERE"
    ctx.font = "bold 20px Montserrat";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH ME", canvas.width/2, canvas.height/2);

    // Scratch Settings
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Helper to get coordinates
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const scratch = (e) => {
        if (!isDrawing || revealed) return;
        e.preventDefault(); // Prevent scrolling on mobile

        const pos = getPos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2, false);
        ctx.fill();

        checkRevealProgress();
    };

    // Events for Mouse
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    // Events for Touch
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('touchmove', scratch);
    canvas.addEventListener('touchend', () => { isDrawing = false; });

    // Calculate how much has been scratched
    const checkRevealProgress = () => {
        if (revealed) return;
        
        // Sample every 10th pixel for performance
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 0; i < data.length; i += 4 * 10) {
            if (data[i + 3] === 0) {
                transparentPixels++;
            }
        }

        const totalPixels = data.length / (4 * 10);
        const percentage = (transparentPixels / totalPixels) * 100;

        if (percentage > 40) { // If 40% revealed, clear the rest
            finishScratch();
        }
    };

    const finishScratch = () => {
        revealed = true;
        // Fade out canvas
        canvas.style.transition = 'opacity 0.5s';
        canvas.style.opacity = '0';
        setTimeout(() => { canvas.style.display = 'none'; }, 500);

        localStorage.setItem('bonusRevealed', 'true');
        triggerSuccessEffects(true);
    };
}

// --- 4. SUCCESS HANDLER ---
function triggerSuccessEffects(withFireworks) {
    const container = document.querySelector('.scratch-wrapper');
    
    if (withFireworks) {
        launchFireworksSequence(container, 5000);
    }
    showBottomToast();
}

// --- 5. BOTTOM TOAST ---
function showBottomToast() {
    const toast = document.getElementById('bottomToast');
    if(toast) {
        toast.classList.add('show');
        startTimer(3600); 
    }
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('countdown');
    if(!display) return;

    if(window.timerInterval) clearInterval(window.timerInterval);

    window.timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(window.timerInterval);
            display.textContent = "EXPIRED";
        }
    }, 1000);
}

// --- 6. FIREWORKS ENGINE ---
function launchFireworksSequence(element, duration) {
    createFirework(element);
    const intervalId = setInterval(() => {
        createFirework(element);
    }, 300);

    setTimeout(() => {
        clearInterval(intervalId);
    }, duration);
}

function createFirework(element) {
    if(!element) return;
    
    const rect = element.getBoundingClientRect();
    // Center of the scratch area
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const colors = ['#ffcc00', '#ffffff', '#ffd700', '#ff4500', '#00ff00'];
    
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const size = Math.random() * 6 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 60; 
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}