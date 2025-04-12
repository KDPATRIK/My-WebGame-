// Получаем canvas и его контекст
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Основные настройки игры
const GAME_CONFIG = {
    gravity: 0.5,
    jumpForce: -8,
    pipeSpeed: 3,
    pipeGap: 150,
    pipeInterval: 1500,
    birdSize: 40,
    pipeWidth: 60
};

// Состояние игры
let isGameActive = false;
let score = 0;
let highScore = 0;

// Объект птицы
const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0
};

// Массивы для труб и изображений
let pipes = [];
let selectedCharacter = null;
let selectedBackground = null;
let backgroundX = 0;

// Загрузка изображений
function loadImages() {
    // Загружаем персонажей
    const character1 = new Image();
    const character2 = new Image();
    const character3 = new Image();
    
    character1.src = '123.jpg';
    character2.src = '1234.jpg';
    character3.src = '12345.gif';

    // Загружаем фоны
    const background1 = new Image();
    const background2 = new Image();
    const background3 = new Image();
    
    background1.src = 'cosmos.jpg';
    background2.src = 'fon1.gif';
    background3.src = 'fon2.jpg';

    return {
        characters: {
            '123.jpg': character1,
            '1234.jpg': character2,
            '12345.gif': character3
        },
        backgrounds: {
            'cosmos.jpg': background1,
            'fon1.gif': background2,
            'fon2.jpg': background3
        }
    };
}

const images = loadImages();

// Выбор персонажа
document.querySelectorAll('.character-option').forEach(option => {
    option.onclick = function() {
        const characterId = this.dataset.character;
        selectedCharacter = images.characters[characterId];
        
        // Визуальное выделение выбранного персонажа
        document.querySelectorAll('.character-option').forEach(opt => 
            opt.classList.remove('selected')
        );
        this.classList.add('selected');
        
        checkStart();
    };
});

// Выбор фона
document.querySelectorAll('.background-option').forEach(option => {
    option.onclick = function() {
        const backgroundId = this.dataset.background;
        selectedBackground = images.backgrounds[backgroundId];
        
        // Визуальное выделение выбранного фона
        document.querySelectorAll('.background-option').forEach(opt => 
            opt.classList.remove('selected')
        );
        this.classList.add('selected');
        
        checkStart();
    };
});

// Проверка возможности начать игру
function checkStart() {
    const startButton = document.getElementById('startButton');
    if (selectedCharacter && selectedBackground) {
        startButton.disabled = false;
    }
}

// Старт игры
function startGame() {
    if (!selectedCharacter || !selectedBackground) {
        alert('Выберите персонажа и фон!');
        return;
    }
    
    document.getElementById('startMenu').style.display = 'none';
    canvas.style.display = 'block';
    
    resetGame();
    isGameActive = true;
    gameLoop();
}

// Сброс игры
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    backgroundX = 0;
}

// Обновление состояния птицы
function updateBird() {
    bird.velocity += GAME_CONFIG.gravity;
    bird.y += bird.velocity;
}

// Создание новой трубы
function createPipe() {
    const gap = GAME_CONFIG.pipeGap;
    const minHeight = 50;
    const maxHeight = canvas.height - gap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

    pipes.push({
        x: canvas.width,
        height: height,
        passed: false
    });
}

// Обновление труб
function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - GAME_CONFIG.pipeInterval) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= GAME_CONFIG.pipeSpeed;

        // Проверка прохождения трубы
        if (!pipes[i].passed && pipes[i].x < bird.x) {
            pipes[i].passed = true;
            score++;
        }

        // Удаление труб, вышедших за пределы экрана
        if (pipes[i].x + GAME_CONFIG.pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Отрисовка фона
function drawBackground() {
    ctx.drawImage(selectedBackground, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(selectedBackground, backgroundX + canvas.width, 0, canvas.width, canvas.height);
    
    backgroundX -= 2;
    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }
}

// Отрисовка птицы
function drawBird() {
    ctx.drawImage(selectedCharacter, 
        bird.x, bird.y, 
        GAME_CONFIG.birdSize, GAME_CONFIG.birdSize
    );
}

// Отрисовка труб
function drawPipes() {
    ctx.fillStyle = '#2ecc71';
    pipes.forEach(pipe => {
        // Верхняя труба
        ctx.fillRect(pipe.x, 0, GAME_CONFIG.pipeWidth, pipe.height);
        // Нижняя труба
        ctx.fillRect(
            pipe.x, 
            pipe.height + GAME_CONFIG.pipeGap, 
            GAME_CONFIG.pipeWidth, 
            canvas.height - pipe.height - GAME_CONFIG.pipeGap
        );
    });
}

// Отрисовка счета
function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Счет: ${score}`, 10, 30);
}

// Проверка столкновений
function checkCollisions() {
    // Проверка столкновения с границами экрана
    if (bird.y < 0 || bird.y + GAME_CONFIG.birdSize > canvas.height) {
        gameOver();
        return;
    }

    // Проверка столкновения с трубами
    for (const pipe of pipes) {
        if (bird.x + GAME_CONFIG.birdSize > pipe.x && 
            bird.x < pipe.x + GAME_CONFIG.pipeWidth) {
            if (bird.y < pipe.height || 
                bird.y + GAME_CONFIG.birdSize > pipe.height + GAME_CONFIG.pipeGap) {
                gameOver();
                return;
            }
        }
    }
}

// Конец игры
function gameOver() {
    isGameActive = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('startMenu').style.display = 'block';
}

// Игровой цикл
function gameLoop() {
    if (!isGameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    updateBird();
    updatePipes();
    drawPipes();
    drawBird();
    drawScore();
    checkCollisions();
    
    requestAnimationFrame(gameLoop);
}

// Обработчики событий
canvas.addEventListener('click', () => {
    if (isGameActive) {
        bird.velocity = GAME_CONFIG.jumpForce;
    }
});

document.getElementById('startButton').onclick = startGame;

// Обработчик нажатия клавиш
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    if (event.code === 'Space') {
        jumpCharacter();
    }
}

function jumpCharacter() {
    if (isGameActive) {
        bird.velocity = GAME_CONFIG.jumpForce; // Устанавливаем скорость прыжка
    }
}