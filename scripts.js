// Canvas setup for game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Progress bar
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = scrollPercentage + '%';
    console.log(`Scroll Progress: ${scrollPercentage}%`);
});

// Game state
let score = 0;
let lastScrollY = window.scrollY;
let mouseX = window.innerWidth / 2;
let enemies = [];
let lasers = [];
let gameActive = true;
let spaceShip = document.getElementById('spaceship');
let scoreDisplay = document.getElementById('score-display');

function updateEnemies() {
    console.log(`Active enemies: ${enemies.length}`);
    enemies.forEach((enemy, index) => {
        if (enemy.hit) return;
        
        enemy.y += enemy.speed;
        enemy.rotation += 2;
        enemy.element.style.top = `${enemy.y}px`;
        enemy.element.style.transform = `rotate(${enemy.rotation}deg)`;
        
        if (enemy.y > enemy.maxY) {
            enemy.element.remove();
            enemies.splice(index, 1);
            console.log(`Enemy escaped at position: ${enemy.y}`);
        }
    });
}

document.addEventListener('click', (e) => {
    if (!gameActive) return;
    
    const header = document.querySelector('header');
    const headerRect = header.getBoundingClientRect();
    
    // Only shoot if click is within header bounds
    if (e.clientY >= headerRect.top && e.clientY <= headerRect.bottom) {
        console.log(`Laser fired at position: ${mouseX}, ${e.clientY}`);
        shootLaser();
    }
});

document.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    
    const header = document.querySelector('header');
    const headerRect = header.getBoundingClientRect();
    
    // Only update if mouse is within header bounds
    if (e.clientY >= headerRect.top && e.clientY <= headerRect.bottom) {
        mouseX = e.clientX;
        const newX = Math.max(30, Math.min(window.innerWidth - 30, mouseX));
        spaceShip.style.left = `${newX}px`;
        spaceShip.style.transform = `translateX(-50%) rotate(${(mouseX - window.innerWidth / 2) * 0.05}deg)`;
        console.log(`Spaceship position updated: ${newX}`);
    }
});

// Add game loop function
function gameLoop() {
    if (gameActive) {
        updateEnemies();

        lasers.forEach((laser, laserIndex) => {
            if (!laser.active) return;
            
            laser.y -= 10;
            laser.element.style.top = `${laser.y}px`;
            
            enemies.forEach((enemy, enemyIndex) => {
                if (enemy.hit) return;
                
                const laserRect = laser.element.getBoundingClientRect();
                const enemyRect = enemy.element.getBoundingClientRect();
                
                if (
                    laserRect.left < enemyRect.right &&
                    laserRect.right > enemyRect.left &&
                    laserRect.top < enemyRect.bottom &&
                    laserRect.bottom > enemyRect.top
                ) {
                    enemy.hit = true;
                    enemy.element.classList.add('exploding');
                    setTimeout(() => {
                        enemy.element.remove();
                        enemies.splice(enemyIndex, 1);
                    }, 500);
                    
                    laser.element.remove();
                    laser.active = false;
                    lasers.splice(laserIndex, 1);
                    
                    score += 10;
                    scoreDisplay.innerText = `SCORE: ${score}`;
                    console.log(`Hit! New score: ${score}`);
                }
            });
            
            if (laser.y < laser.minY) {
                laser.element.remove();
                laser.active = false;
                lasers.splice(laserIndex, 1);
                console.log('Laser expired');
            }
        });
        
        const targetX = Math.max(30, Math.min(window.innerWidth - 30, mouseX));
        const currentTransform = spaceShip.style.transform;
        const currentX = currentTransform ? parseFloat(currentTransform.split('translate(')[1]) : 0;
        const dx = (targetX - window.innerWidth / 2 - currentX) * 0.1;
        
        spaceShip.style.transform = `translate(${currentX + dx}px, -50%) rotate(${(mouseX - window.innerWidth / 2) * 0.05}deg)`;
    }
    requestAnimationFrame(gameLoop);
}

// Initialize game elements
function initGame() {
    console.log('Initializing game...');
    const header = document.querySelector('header');
    
    createStars();
    console.log('Stars created');
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    scrollIndicator.addEventListener('click', () => {
        document.getElementById('experience').scrollIntoView({ behavior: 'smooth' });
        console.log('Scrolling to experience section');
    });
    
    setInterval(() => {
        if (isElementInViewport(header)) {
            createEnemy();
        }
    }, 1000);
    
    gameLoop();
    console.log('Game initialized successfully');
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
    console.log(`Viewport check: ${isVisible}`);
    return isVisible;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Modify createEnemy function
function createEnemy() {
    if (!gameActive || enemies.length > 10) return;
    
    const header = document.querySelector('header');
    const headerRect = header.getBoundingClientRect();
    
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    
    const x = Math.random() * (window.innerWidth - 30);
    const y = headerRect.top;
    
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;
    
    header.appendChild(enemy);
    
    enemies.push({
        element: enemy,
        x: x,
        y: y,
        speed: 1 + Math.random() * 2,
        rotation: 0,
        hit: false,
        maxY: headerRect.bottom - 30
    });
    console.log(`Enemy created at: ${x}, ${y}`);
}

// Modify gameLoop enemy update
enemies.forEach((enemy, index) => {
    if (enemy.hit) return;
    
    enemy.y += enemy.speed;
    enemy.rotation += 2;
    enemy.element.style.top = `${enemy.y}px`;
    enemy.element.style.transform = `rotate(${enemy.rotation}deg)`;
    
    // Remove enemy if it goes beyond header
    if (enemy.y > enemy.maxY) {
        enemy.element.remove();
        enemies.splice(index, 1);
    }
    
    // Rest of the collision detection code...
});

// Modify shootLaser function
function shootLaser() {
    if (!gameActive) return;
    
    const header = document.querySelector('header');
    const shipRect = spaceShip.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    
    const laser = document.createElement('div');
    laser.classList.add('laser');
    
    const offset = window.pageXOffset || document.documentElement.scrollLeft;
    laser.style.left = `${mouseX - offset}px`;
    laser.style.top = `${shipRect.top + shipRect.height/2}px`;
    
    header.appendChild(laser);
    
    lasers.push({
        element: laser,
        x: mouseX,
        y: shipRect.top,
        active: true,
        minY: headerRect.top
    });
    console.log(`Laser shot from: ${mouseX}, ${shipRect.top}`);
}

// Modify laser update in gameLoop
lasers.forEach((laser, laserIndex) => {
    if (!laser.active) return;
    
    laser.y -= 10;
    laser.element.style.top = `${laser.y}px`;
    
    // Remove laser if it goes beyond header top
    if (laser.y < laser.minY) {
        laser.element.remove();
        laser.active = false;
        lasers.splice(laserIndex, 1);
    }
    
    // Rest of the collision detection code...
});

// Reset game function
function resetGame() {
    // Remove game over message
    const gameOver = document.querySelector('div[style*="GAME OVER"]');
    if (gameOver) gameOver.remove();
    
    // Reset game state
    score = 0;
    scoreDisplay.innerText = 'SCORE: 0';
    gameActive = true;
    spaceShip.style.opacity = '1';
    
    // Remove all enemies and lasers
    enemies.forEach(enemy => enemy.element.remove());
    lasers.forEach(laser => laser.element.remove());
    enemies = [];
    lasers = [];
    console.log('Game reset complete');
}

// Window resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log(`Canvas resized to: ${window.innerWidth}x${window.innerHeight}`);
});

// Create stars function
function createStars() {
    const header = document.querySelector('header');
    const numberOfStars = 50;
    
    // Clear existing stars
    const existingStars = document.querySelectorAll('.star');
    existingStars.forEach(star => star.remove());
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        
        header.appendChild(star);
    }
    console.log(`${numberOfStars} stars created`);
}