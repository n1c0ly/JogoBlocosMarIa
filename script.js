const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const scoreDisplay = document.querySelector('.score');
const livesText = document.querySelector('.lives-text');
const endGameModal = document.getElementById('endGameModal');
const endGameMessage = document.getElementById('endGameMessage');
const restartBtn = document.getElementById('restartBtn');

// Variáveis do jogo
let gamePaused = false;
let score = 0;
let lives = 3;

// Propriedades da raquete
const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    width: 100,
    height: 15,
    dx: 0,
    speed: 7
};

// Propriedades da bola
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    speed: 5,
    dx: 5,
    dy: -5
};

// Propriedades dos blocos
const blockInfo = {
    rows: 4,
    cols: 8,
    width: 60,
    height: 25,
    padding: 10,
    offsetTop: 50,
    offsetLeft: 30
};

// Tipos de blocos (cores e bônus)
const blockTypes = {
    default: { color: '#00cc66', bonus: null }, // Verde
    strong: { color: '#ffffff', bonus: 'strong' }, // Branco (resistente)
    extraLife: { color: '#ff3366', bonus: 'extraLife' }, // Rosa (vida extra)
    fastBall: { color: '#00cc66', bonus: 'fastBall' }, // Verde (bola rápida)
    slowBall: { color: '#00cc66', bonus: 'slowBall' } // Verde (bola lenta)
};

// Armazenamento dos blocos
let blocks = [];

function createBlocks() {
    blocks = []; // Limpa os blocos antigos
    const blockOrder = ['default', 'default', 'extraLife', 'default', 'fastBall', 'default', 'default', 'default',
                        'default', 'strong', 'default', 'default', 'default', 'slowBall', 'default', 'default',
                        'default', 'default', 'default', 'default', 'default', 'default', 'default', 'default',
                        'default', 'strong', 'default', 'default', 'default', 'default', 'default', 'default'];

    const shuffledBlocks = shuffleArray(blockOrder);

    for (let c = 0; c < blockInfo.cols; c++) {
        blocks[c] = [];
        for (let r = 0; r < blockInfo.rows; r++) {
            const index = r * blockInfo.cols + c;
            const type = shuffledBlocks[index];
            const x = c * (blockInfo.width + blockInfo.padding) + blockInfo.offsetLeft;
            const y = r * (blockInfo.height + blockInfo.padding) + blockInfo.offsetTop;
            blocks[c][r] = {
                x,
                y,
                status: 1,
                type: type,
                lives: type === 'strong' ? 2 : 1 // Blocos brancos precisam de 2 hits
            };
        }
    }
}

// Embaralha o array para randomizar a posição dos bônus
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Funções de desenho
function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fillStyle = '#6666ff'; // Roxo claro
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawBlocks() {
    for (let c = 0; c < blockInfo.cols; c++) {
        for (let r = 0; r < blockInfo.rows; r++) {
            const block = blocks[c][r];
            if (block.status === 1) {
                let color = blockTypes[block.type].color;
                if (block.type === 'strong' && block.lives === 1) {
                    // Mudar a cor do bloco branco após o primeiro hit
                    color = '#b0b0b0'; 
                }
                ctx.beginPath();
                ctx.rect(block.x, block.y, blockInfo.width, blockInfo.height);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
                // Adicionar ícones aos blocos especiais
                if (block.type === 'extraLife') {
                    ctx.fillStyle = 'red';
                    ctx.font = '20px Arial';
                    ctx.fillText('❤', block.x + blockInfo.width / 2 - 8, block.y + blockInfo.height / 2 + 8);
                } else if (block.type === 'strong') {
                    // Desenho da parede de tijolos
                    ctx.fillStyle = '#666666';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(block.x, block.y, blockInfo.width, blockInfo.height);
                } else if (block.type === 'fastBall') {
                    ctx.fillStyle = 'white';
                    ctx.font = '20px Arial';
                    ctx.fillText('•', block.x + blockInfo.width / 2 - 4, block.y + blockInfo.height / 2 + 6);
                } else if (block.type === 'slowBall') {
                    ctx.fillStyle = 'white';
                    ctx.font = '20px Arial';
                    ctx.fillText('•', block.x + blockInfo.width / 2 - 4, block.y + blockInfo.height / 2 + 6);
                }
            }
        }
    }
}

// Funções de atualização
function update() {
    if (gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBlocks();
    drawPaddle();
    drawBall();

    // Mover a raquete
    paddle.x += paddle.dx;

    // Colisão da raquete com as bordas
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
    if (paddle.x < 0) {
        paddle.x = 0;
    }

    // Mover a bola
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisão da bola com as bordas
    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    }
    if (ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    // Colisão da bola com a raquete
    if (ball.y + ball.size > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy *= -1;
    }

    // Colisão da bola com os blocos
    for (let c = 0; c < blockInfo.cols; c++) {
        for (let r = 0; r < blockInfo.rows; r++) {
            const block = blocks[c][r];
            if (block.status === 1) {
                const isColliding = ball.x + ball.size > block.x &&
                                    ball.x - ball.size < block.x + blockInfo.width &&
                                    ball.y + ball.size > block.y &&
                                    ball.y - ball.size < block.y + blockInfo.height;

                if (isColliding) {
                    ball.dy *= -1;
                    
                    if (block.type === 'strong' && block.lives > 1) {
                        block.lives--;
                    } else {
                        block.status = 0;
                        score += 10;
                        scoreDisplay.textContent = `Pontos: ${score}`;

                        // Ativar bônus
                        if (block.type === 'extraLife') {
                            lives++;
                            livesText.textContent = `x ${lives}`;
                        } else if (block.type === 'fastBall') {
                            ball.speed = 8;
                        } else if (block.type === 'slowBall') {
                            ball.speed = 3;
                        }
                    }

                    // Checar se o jogo terminou
                    const allBlocksDestroyed = blocks.every(col => col.every(b => b.status === 0));
                    if (allBlocksDestroyed) {
                        endGame(true);
                    }
                }
            }
        }
    }

    // Perder uma vida
    if (ball.y + ball.size > canvas.height) {
        lives--;
        livesText.textContent = `x ${lives}`;
        if (lives === 0) {
            endGame(false);
        } else {
            // Resetar a posição da bola e da raquete
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.dx = ball.speed;
            ball.dy = -ball.speed;
            paddle.x = canvas.width / 2 - 50;
        }
    }

    requestAnimationFrame(update);
}

// Funções de controle
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

// Controles para mobile
leftBtn.addEventListener('touchstart', () => { paddle.dx = -paddle.speed; });
leftBtn.addEventListener('touchend', () => { paddle.dx = 0; });
rightBtn.addEventListener('touchstart', () => { paddle.dx = paddle.speed; });
rightBtn.addEventListener('touchend', () => { paddle.dx = 0; });

// Função para terminar o jogo
function endGame(win) {
    gamePaused = true;
    endGameModal.style.display = 'flex';
    if (win) {
        endGameMessage.textContent = 'Parabéns! Você venceu!';
    } else {
        endGameMessage.textContent = 'Game Over. Você perdeu!';
    }
}

// Função para reiniciar o jogo
function restartGame() {
    score = 0;
    lives = 3;
    scoreDisplay.textContent = `Pontos: ${score}`;
    livesText.textContent = `x ${lives}`;
    ball.speed = 5;
    createBlocks();
    endGameModal.style.display = 'none';
    gamePaused = false;
    // Resetar a posição da bola e da raquete
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ball.speed;
    ball.dy = -ball.speed;
    paddle.x = canvas.width / 2 - 50;
    requestAnimationFrame(update);
}

restartBtn.addEventListener('click', restartGame);

// Inicia o jogo
function init() {
    // Ajustar o tamanho do canvas para a tela do dispositivo
    const gameContainer = document.querySelector('.game-container');
    canvas.width = gameContainer.clientWidth - 40;
    canvas.height = gameContainer.clientHeight * 0.7;

    // Resetar as posições da raquete e da bola para o novo tamanho do canvas
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.y = canvas.height - 30;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    createBlocks();
    update();
}

// Inicializa o jogo quando a janela carregar
window.onload = init;
window.addEventListener('resize', init);
