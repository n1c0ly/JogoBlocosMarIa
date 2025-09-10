const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const livesContainer = document.querySelector('.lives');
const endGameModal = document.getElementById('endGameModal');
const endGameMessage = document.getElementById('endGameMessage');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Variáveis do jogo
let gamePaused = false;
let score = 0;
let lives = 3;

// Propriedades da raquete
const paddle = {
    x: 0,
    y: 0,
    width: 100,
    height: 15,
    dx: 0,
    speed: 7
};
const defaultPaddleWidth = 100;

let balls = [];

// Propriedades dos blocos
const blockInfo = {
    rows: 4,
    cols: 8,
    width: 0, // Será calculado dinamicamente
    height: 25,
    padding: 10,
    offsetTop: 50,
    offsetLeft: 0 // Será calculado dinamicamente
};

// Tipos de blocos (cores e bônus)
const blockTypes = {
    green: { color: '#00cc66', bonus: null },
    pink: { color: '#ff3366', bonus: 'extraLife' },
    blue: { color: '#00ace6', bonus: 'multiBall' },
    white: { color: '#ffffff', bonus: 'slowPaddle' },
    purple: { color: '#9900ff', bonus: 'enlargePaddle' }, // Novo bônus
    orange: { color: '#ff6600', bonus: 'shrinkPaddle' }   // Novo bônus
};

let blocks = [];

function init() {
    const gameArea = document.querySelector('.game-area');
    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;

    // Calcular as propriedades dos blocos para preencher o canvas
    blockInfo.width = (canvas.width - blockInfo.padding * (blockInfo.cols - 1)) / blockInfo.cols;
    blockInfo.offsetLeft = 0;

    paddle.width = defaultPaddleWidth;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.y = canvas.height - 50;

    createBlocks();
    createBall();
    updateLivesDisplay();
    update();
}

function createBlocks() {
    blocks = [];
    // Ordem dos blocos para embaralhar
    const blockOrder = [
        'green', 'pink', 'blue', 'white', 'purple', 'orange', 'green', 'pink',
        'blue', 'white', 'purple', 'orange', 'green', 'pink', 'blue', 'white',
        'green', 'pink', 'blue', 'white', 'purple', 'orange', 'green', 'pink',
        'blue', 'white', 'purple', 'orange', 'green', 'pink', 'blue', 'white'
    ];
    const shuffledOrder = shuffleArray(blockOrder);

    for (let r = 0; r < blockInfo.rows; r++) {
        for (let c = 0; c < blockInfo.cols; c++) {
            const index = r * blockInfo.cols + c;
            const type = shuffledOrder[index];
            const x = c * (blockInfo.width + blockInfo.padding) + blockInfo.offsetLeft;
            const y = r * (blockInfo.height + blockInfo.padding) + blockInfo.offsetTop;
            blocks.push({
                x,
                y,
                status: 1,
                type: type,
                lives: type === 'white' ? 2 : 1
            });
        }
    }
}

function createBall() {
    balls.push({
        x: paddle.x + paddle.width / 2,
        y: paddle.y - 10,
        size: 10,
        speed: 5,
        dx: 5,
        dy: -5
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fillStyle = '#6666ff';
    ctx.fill();
    ctx.closePath();
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawBlocks() {
    for (const block of blocks) {
        if (block.status === 1) {
            ctx.beginPath();
            ctx.rect(block.x, block.y, blockInfo.width, blockInfo.height);
            ctx.fillStyle = blockTypes[block.type].color;
            ctx.fill();
            ctx.closePath();
        }
    }
}

function update() {
    if (gamePaused) {
        requestAnimationFrame(update);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBlocks();
    drawPaddle();

    paddle.x += paddle.dx;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
    if (paddle.x < 0) {
        paddle.x = 0;
    }

    balls.forEach((ball, index) => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
            ball.dx *= -1;
        }
        if (ball.y - ball.size < 0) {
            ball.dy *= -1;
        }

        if (ball.y + ball.size > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy *= -1;
        }

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.status === 1) {
                const isColliding = ball.x + ball.size > block.x &&
                                    ball.x - ball.size < block.x + blockInfo.width &&
                                    ball.y + ball.size > block.y &&
                                    ball.y - ball.size < block.y + blockInfo.height;

                if (isColliding) {
                    ball.dy *= -1;
                    
                    if (block.type === 'white' && block.lives > 1) {
                        block.lives--;
                    } else {
                        block.status = 0;
                        score += 10;
                        
                        if (block.type === 'extraLife') {
                            lives++;
                            updateLivesDisplay();
                        } else if (block.type === 'multiBall') {
                            createBall();
                        } else if (block.type === 'slowPaddle') {
                            paddle.speed = 3;
                            setTimeout(() => { paddle.speed = 7; }, 5000);
                        } else if (block.type === 'enlargePaddle') { // Novo bônus
                            paddle.width = 150;
                            setTimeout(() => { paddle.width = defaultPaddleWidth; }, 5000);
                        } else if (block.type === 'shrinkPaddle') { // Novo bônus
                            paddle.width = 50;
                            setTimeout(() => { paddle.width = defaultPaddleWidth; }, 5000);
                        }
                    }
                }
            }
        }
        drawBall(ball);
    });

    balls = balls.filter(ball => ball.y < canvas.height);

    if (balls.length === 0) {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            endGame(false);
        } else {
            createBall();
        }
    }

    const allBlocksDestroyed = blocks.every(b => b.status === 0);
    if (allBlocksDestroyed) {
        endGame(true);
    }
    
    requestAnimationFrame(update);
}

function updateLivesDisplay() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart-icon';
        heart.innerHTML = '❤️';
        livesContainer.appendChild(heart);
    }
}

function togglePause() {
    gamePaused = !gamePaused;
}

// Controles
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        paddle.dx = -paddle.speed;
    }
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
        paddle.dx = 0;
    }
});

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    paddle.dx = -paddle.speed;
});
leftBtn.addEventListener('touchend', () => { paddle.dx = 0; });
rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    paddle.dx = paddle.speed;
});
rightBtn.addEventListener('touchend', () => { paddle.dx = 0; });

pauseBtn.addEventListener('click', togglePause);

function endGame(win) {
    gamePaused = true;
    endGameModal.style.display = 'flex';
    if (win) {
        endGameMessage.textContent = 'Parabéns! Você venceu!';
    } else {
        endGameMessage.textContent = 'Game Over. Você perdeu!';
    }
}

function restartGame() {
    score = 0;
    lives = 3;
    balls = [];
    endGameModal.style.display = 'none';
    gamePaused = false;
    init();
}

restartBtn.addEventListener('click', restartGame);

window.onload = init;
window.addEventListener('resize', init);
