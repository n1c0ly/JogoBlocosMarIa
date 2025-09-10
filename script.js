const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Acompanha a pontuação
let score = 0;
// Posição e velocidade da bolinha
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Raio da bolinha
const ballRadius = 10;

// Posição e dimensões da raquete
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Variáveis para controlar o movimento da raquete
let rightPressed = false;
let leftPressed = false;

// Configuração dos blocos
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Cria um array 2D para os blocos
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1: visível
  }
}

// Desenha a bolinha
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Desenha a raquete
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Desenha todos os blocos
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) { // Só desenha se o bloco estiver visível
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// Desenha a pontuação na tela
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Pontuação: " + score, 8, 20);
}

// Detecção de colisões entre a bolinha e os blocos
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy; // Inverte a direção vertical da bolinha
          b.status = 0; // "Quebra" o bloco
          score++;
          // Se todos os blocos foram quebrados
          if (score === brickRowCount * brickColumnCount) {
              alert("PARABÉNS, VOCÊ VENCEU!");
              document.location.reload();
          }
        }
      }
    }
  }
}

// Lida com os eventos de teclado para mover a raquete
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// A função principal que desenha e atualiza o jogo
function draw() {
  // Limpa a tela a cada quadro
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  // Detecção de colisão com as paredes
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    // Se a bolinha colidir com a parte de baixo
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy; // Inverte a direção se colidir com a raquete
    } else {
      // Se não colidir com a raquete, o jogo acaba
      alert("FIM DE JOGO");
      document.location.reload();
    }
  }

  // Movimento da raquete
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  // Atualiza a posição da bolinha
  x += dx;
  y += dy;
}

// Inicia o loop do jogo
setInterval(draw, 10);