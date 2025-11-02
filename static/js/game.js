const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameInfo = document.getElementById('gameInfo');
const gameOver = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');

let gameState = 'menu';
let score = 0;
let highScore = localStorage.getItem('whaleHighScore') || 0;
highScoreElement.textContent = highScore;

const whale = {
    x: 150,
    y: canvas.height / 2,
    width: 60,
    height: 40,
    velocity: 0,
    gravity: 0.5,
    jumpStrength: -10,
    rotation: 0
};

const obstacles = [];
const particles = [];
let frameCount = 0;
let obstacleFrequency = 120;

class Obstacle {
    constructor() {
        this.width = 50;
        this.gap = 180;
        this.x = canvas.width;
        this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
        this.bottomY = this.topHeight + this.gap;
        this.bottomHeight = canvas.height - this.bottomY;
        this.passed = false;
        this.speed = 3;
    }

    draw() {
        ctx.fillStyle = '#2d5016';
        ctx.strokeStyle = '#1a3009';
        ctx.lineWidth = 3;
        
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, 0, this.width, this.topHeight);
        
        ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
        ctx.strokeRect(this.x, this.bottomY, this.width, this.bottomHeight);
        
        ctx.fillStyle = '#3d6b1f';
        for (let i = 0; i < this.topHeight; i += 20) {
            ctx.fillRect(this.x + 5, i, 10, 15);
            ctx.fillRect(this.x + 35, i + 10, 10, 15);
        }
        for (let i = this.bottomY; i < canvas.height; i += 20) {
            ctx.fillRect(this.x + 5, i, 10, 15);
            ctx.fillRect(this.x + 35, i + 10, 10, 15);
        }
    }

    update() {
        this.x -= this.speed;
        
        if (!this.passed && this.x + this.width < whale.x) {
            this.passed = true;
            score++;
            scoreElement.textContent = score;
            createParticles(whale.x, whale.y);
        }
    }

    collidesWith(whale) {
        if (whale.x + whale.width > this.x && whale.x < this.x + this.width) {
            if (whale.y < this.topHeight || whale.y + whale.height > this.bottomY) {
                return true;
            }
        }
        return false;
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 - 2;
        this.life = 30;
        this.maxLife = 30;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw() {
        ctx.fillStyle = `rgba(79, 195, 247, ${this.life / this.maxLife})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y));
    }
}

function drawWhale() {
    ctx.save();
    ctx.translate(whale.x + whale.width / 2, whale.y + whale.height / 2);
    
    whale.rotation = whale.velocity * 0.05;
    whale.rotation = Math.max(-0.5, Math.min(0.5, whale.rotation));
    ctx.rotate(whale.rotation);
    
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath();
    ctx.ellipse(0, 0, whale.width / 2, whale.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.ellipse(-10, 0, whale.width / 3, whale.height / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#0d47a1';
    ctx.beginPath();
    ctx.moveTo(whale.width / 2 - 10, 0);
    ctx.lineTo(whale.width / 2 + 15, -8);
    ctx.lineTo(whale.width / 2 + 15, 8);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(15, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(16, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-whale.width / 2 + 5, 0);
    ctx.lineTo(-whale.width / 2 - 10, -10);
    ctx.moveTo(-whale.width / 2 + 5, 0);
    ctx.lineTo(-whale.width / 2 - 10, 10);
    ctx.stroke();
    
    ctx.restore();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 100, 200, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 50, 150, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 30, 100, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i - (frameCount % 50), 0);
        ctx.lineTo(i - (frameCount % 50), canvas.height);
        ctx.stroke();
    }
}

function jump() {
    if (gameState === 'playing') {
        whale.velocity = whale.jumpStrength;
    }
}

function resetGame() {
    whale.y = canvas.height / 2;
    whale.velocity = 0;
    whale.rotation = 0;
    obstacles.length = 0;
    particles.length = 0;
    score = 0;
    scoreElement.textContent = score;
    frameCount = 0;
}

function startGame() {
    resetGame();
    gameState = 'playing';
    gameInfo.style.display = 'none';
    gameOver.style.display = 'none';
    gameLoop();
}

function endGame() {
    gameState = 'gameOver';
    gameOver.style.display = 'block';
    finalScoreElement.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('whaleHighScore', highScore);
    }
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    whale.velocity += whale.gravity;
    whale.y += whale.velocity;
    
    if (whale.y + whale.height > canvas.height) {
        whale.y = canvas.height - whale.height;
        endGame();
        return;
    }
    
    if (whale.y < 0) {
        whale.y = 0;
        whale.velocity = 0;
    }
    
    if (frameCount % obstacleFrequency === 0) {
        obstacles.push(new Obstacle());
    }
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();
        
        if (obstacles[i].collidesWith(whale)) {
            endGame();
            return;
        }
        
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    drawWhale();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

canvas.addEventListener('click', jump);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'menu') {
            startGame();
        } else {
            jump();
        }
    }
});

drawBackground();
drawWhale();
