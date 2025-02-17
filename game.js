const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 修改蛇头图片（紫色）
const snakeHead = new Image();
snakeHead.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjOWM2MGZmIiBkPSJNNDk2IDI1NmMwIDEzMy04MTAuNSAyNDAtMjQwIDI0MFMxNiAzODkgMTYgMjU2IDk4LjUgMTYgMjU2IDE2czI0MCAxMDcgMjQwIDI0MHoiLz48Y2lyY2xlIGN4PSIxNjQiIGN5PSIxOTYiIHI9IjIwIiBmaWxsPSIjMjIyIi8+PGNpcmNsZSBjeD0iMzQ4IiBjeT0iMTk2IiByPSIyMCIgZmlsbD0iIzIyMiIvPjwvc3ZnPg==';

// 修改蛇身图片（紫色）
const snakeBody = new Image();
snakeBody.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjOWM2MGZmIiBkPSJNNDk2IDI1NmMwIDEzMy04MS41IDI0MC0yNDAgMjQwUzE2IDM4OSAxNiAyNTYgOTguNSAxNiAyNTYgMTZzMjQwIDEwNyAyNDAgMjQweiIvPjwvc3ZnPg==';

// 添加苹果图片
const appleImg = new Image();
appleImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZmZkNzAwIiBkPSJNMjU2IDQ4MGMtMTEwLjUgMC0yMDAtODkuNS0yMDAtMjAwczg5LjUtMjAwIDIwMC0yMDBzMjAwIDg5LjUgMjAwIDIwMFMzNjYuNSA0ODAgMjU2IDQ4MHoiLz48cGF0aCBmaWxsPSIjOTk2NjAwIiBkPSJNMjU2IDEyMGMtMjAgMC00MCA1LTU3LjcgMTQuM0MyMjEuMyA5MCAyNTYgNjAgMjU2IDYwczM0LjcgMzAgNTcuNyA3NC4zQzI5NiAxMjUgMjc2IDEyMCAyNTYgMTIweiIvPjwvc3ZnPg==';

let snake = [
    { x: 10, y: 10 }
];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval = null;
let isGameRunning = false;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

document.addEventListener('keydown', changeDirection);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function drawGame() {
    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    if (isGameRunning) {
        // 移动蛇
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } else {
            snake.pop();
        }

        // 检查游戏结束条件
        if (gameOver()) {
            handleGameOver();
            return;
        }
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        const img = index === 0 ? snakeHead : snakeBody;
        ctx.save();
        
        if (index === 0) {
            ctx.translate(segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2);
            let rotation = 0;
            if (dx === 1) rotation = 0;
            if (dx === -1) rotation = Math.PI;
            if (dy === -1) rotation = -Math.PI/2;
            if (dy === 1) rotation = Math.PI/2;
            ctx.rotate(rotation);
            ctx.translate(-gridSize/2, -gridSize/2);
            ctx.drawImage(img, 0, 0, gridSize, gridSize);
        } else {
            ctx.drawImage(img, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
        ctx.restore();
    });

    // 绘制食物
    ctx.save();
    ctx.translate(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);
    ctx.drawImage(appleImg, -gridSize/2, -gridSize/2, gridSize, gridSize);
    ctx.restore();
}

function gameOver() {
    // 撞墙
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= tileCount;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= tileCount;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        return true;
    }

    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    return false;
}

function handleGameOver() {
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    alert('游戏结束！\n当前得分：' + score + '\n最高分：' + highScore);
    clearInterval(gameInterval);
    isGameRunning = false;
    startBtn.textContent = '开始';
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
}

function startGame() {
    if (!isGameRunning) {
        // 重置游戏状态
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 开始游戏循环
        isGameRunning = true;
        gameInterval = setInterval(drawGame, 200);
        
        // 更新按钮状态
        startBtn.textContent = '重新开始';
        pauseBtn.disabled = false;
    } else {
        clearInterval(gameInterval);
        startGame();
    }
}

function togglePause() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
        pauseBtn.textContent = '继续';
    } else {
        gameInterval = setInterval(drawGame, 200);
        pauseBtn.textContent = '暂停';
    }
}

// 初始绘制
drawGame(); 