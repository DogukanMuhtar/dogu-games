const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");


// ============================
// GAME SETTINGS
// ============================

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let food;

let direction;
let nextDirection;

let score = 0;

let gameRunning = false;

let gameLoop;

let gameSpeed = 150;

const MIN_GAME_SPEED = 60;
const SPEED_INCREASE = 5;

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

highScoreElement.textContent = highScore;


// ============================
// START GAME
// ============================

function startGame() {

    // Snake başlangıçta 3 parçalı
    snake = [
        {
            x: 10,
            y: 10
        },
        {
            x: 9,
            y: 10
        },
        {
            x: 8,
            y: 10
        }
    ];


    // Başlangıç yönü sağ
    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    // Skoru sıfırla
    score = 0;

    scoreElement.textContent = score;


    // Her oyun yavaş başlar
    gameSpeed = 150;


    // Yeni yem oluştur
    createFood();


    gameRunning = true;


    // Eski interval varsa temizle
    clearInterval(gameLoop);


    // Oyunu hemen çiz
    drawGame();


    // Oyunu başlat
    gameLoop = setInterval(
        updateGame,
        gameSpeed
    );

}


// ============================
// UPDATE GAME
// ============================

function updateGame() {

    direction = nextDirection;


    // Yeni kafa pozisyonu
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };


    // ============================
    // DUVARA ÇARPMA
    // ============================

    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {

        gameOver();

        return;
    }


    // ============================
    // KENDİNE ÇARPMA
    // ============================

    for (let i = 0; i < snake.length; i++) {

        if (
            head.x === snake[i].x &&
            head.y === snake[i].y
        ) {

            gameOver();

            return;
        }

    }


    // Yeni kafayı ekle
    snake.unshift(head);


    // ============================
    // YEM KONTROLÜ
    // ============================

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        // Skoru artır
        score += 10;

        scoreElement.textContent = score;


        // ============================
        // KADEMELİ HIZLANMA
        // ============================

        gameSpeed = Math.max(
            MIN_GAME_SPEED,
            gameSpeed - SPEED_INCREASE
        );


        // Yeni hızı uygula
        clearInterval(gameLoop);

        gameLoop = setInterval(
            updateGame,
            gameSpeed
        );


        // Yeni yem oluştur
        createFood();

    } else {

        // Yem yenmediyse kuyruğu sil
        snake.pop();

    }


    // Ekranı güncelle
    drawGame();

}


// ============================
// DRAW GAME
// ============================

function drawGame() {

    // ============================
    // ARKA PLAN
    // ============================

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ============================
    // GRID
    // ============================

    drawGrid();


    // ============================
    // ELMA
    // ============================

    if (food) {

        drawApple(
            food.x * gridSize,
            food.y * gridSize
        );

    }


    // ============================
    // SNAKE
    // ============================

    if (snake) {

        snake.forEach((part, index) => {

            const x = part.x * gridSize;
            const y = part.y * gridSize;


            // ========================
            // KAFA
            // ========================

            if (index === 0) {

                drawSnakeHead(x, y);

            }


            // ========================
            // GÖVDE
            // ========================

            else {

                drawSnakeBody(x, y);

            }

        });

    }

}


// ============================
// DRAW SNAKE HEAD
// ============================

function drawSnakeHead(x, y) {

    // Kafa
    ctx.fillStyle = "#39ff14";

    ctx.fillRect(
        x + 1,
        y + 1,
        gridSize - 2,
        gridSize - 2
    );


    // Kafa için hafif koyu alt bölüm
    ctx.fillStyle = "#22c55e";

    ctx.fillRect(
        x + 2,
        y + 14,
        gridSize - 4,
        4
    );


    // Gözler
    ctx.fillStyle = "#050505";


    const eyeSize = 4;


    // ============================
    // SAĞA GİDİYOR
    // ============================

    if (direction.x === 1) {

        ctx.fillRect(
            x + 13,
            y + 4,
            eyeSize,
            eyeSize
        );

        ctx.fillRect(
            x + 13,
            y + 12,
            eyeSize,
            eyeSize
        );

    }


    // ============================
    // SOLA GİDİYOR
    // ============================

    else if (direction.x === -1) {

        ctx.fillRect(
            x + 3,
            y + 4,
            eyeSize,
            eyeSize
        );

        ctx.fillRect(
            x + 3,
            y + 12,
            eyeSize,
            eyeSize
        );

    }


    // ============================
    // AŞAĞI GİDİYOR
    // ============================

    else if (direction.y === 1) {

        ctx.fillRect(
            x + 4,
            y + 13,
            eyeSize,
            eyeSize
        );

        ctx.fillRect(
            x + 12,
            y + 13,
            eyeSize,
            eyeSize
        );

    }


    // ============================
    // YUKARI GİDİYOR
    // ============================

    else {

        ctx.fillRect(
            x + 4,
            y + 3,
            eyeSize,
            eyeSize
        );

        ctx.fillRect(
            x + 12,
            y + 3,
            eyeSize,
            eyeSize
        );

    }

}


// ============================
// DRAW SNAKE BODY
// ============================

function drawSnakeBody(x, y) {

    // Ana gövde
    ctx.fillStyle = "#22c55e";

    ctx.fillRect(
        x + 1,
        y + 1,
        gridSize - 2,
        gridSize - 2
    );


    // Parlak pixel
    ctx.fillStyle = "#39ff14";

    ctx.fillRect(
        x + 3,
        y + 3,
        4,
        4
    );


    // Koyu pixel
    ctx.fillStyle = "#16803c";

    ctx.fillRect(
        x + 13,
        y + 13,
        4,
        4
    );

}


// ============================
// DRAW APPLE
// ============================

function drawApple(x, y) {

    // ============================
    // ELMA GÖVDESİ
    // ============================

    ctx.fillStyle = "#ff1744";

    ctx.fillRect(
        x + 4,
        y + 5,
        12,
        11
    );

    ctx.fillRect(
        x + 2,
        y + 8,
        16,
        7
    );


    // ============================
    // ELMA GÖLGESİ
    // ============================

    ctx.fillStyle = "#c4002f";

    ctx.fillRect(
        x + 4,
        y + 13,
        12,
        3
    );


    // ============================
    // PARLAK PIXEL
    // ============================

    ctx.fillStyle = "#ff6b81";

    ctx.fillRect(
        x + 5,
        y + 6,
        4,
        4
    );


    // ============================
    // SAP
    // ============================

    ctx.fillStyle = "#8b4513";

    ctx.fillRect(
        x + 10,
        y + 1,
        3,
        5
    );


    // ============================
    // YAPRAK
    // ============================

    ctx.fillStyle = "#39ff14";

    ctx.fillRect(
        x + 13,
        y + 2,
        4,
        3
    );

}


// ============================
// DRAW GRID
// ============================

function drawGrid() {

    ctx.strokeStyle = "#151515";

    ctx.lineWidth = 1;


    // Dikey çizgiler

    for (
        let x = 0;
        x <= canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    // Yatay çizgiler

    for (
        let y = 0;
        y <= canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


// ============================
// CREATE FOOD
// ============================

function createFood() {

    let validPosition = false;


    while (!validPosition) {

        food = {

            x: Math.floor(
                Math.random() * tileCount
            ),

            y: Math.floor(
                Math.random() * tileCount
            )

        };


        validPosition = true;


        // Yemin Snake'in üzerinde
        // oluşmasını engelle

        for (const part of snake) {

            if (
                part.x === food.x &&
                part.y === food.y
            ) {

                validPosition = false;

                break;
            }

        }

    }

}


// ============================
// GAME OVER
// ============================

function gameOver() {

    gameRunning = false;

    clearInterval(gameLoop);


    // ============================
    // HIGH SCORE
    // ============================

    if (score > highScore) {

        highScore = score;


        localStorage.setItem(
            "snakeHighScore",
            highScore
        );


        highScoreElement.textContent =
            highScore;

    }


    // ============================
    // GAME OVER SCREEN
    // ============================

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.75)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.textAlign = "center";


    // GAME OVER

    ctx.fillStyle = "#ff1744";

    ctx.font =
        "24px 'Courier New'";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2 - 15
    );


    // SCORE

    ctx.fillStyle = "#f5f5dc";

    ctx.font =
        "14px 'Courier New'";

    ctx.fillText(
        "SCORE: " + score,
        canvas.width / 2,
        canvas.height / 2 + 15
    );


    // RESTART

    ctx.fillStyle = "#39ff14";

    ctx.font =
        "12px 'Courier New'";

    ctx.fillText(
        "PRESS SPACE TO RESTART",
        canvas.width / 2,
        canvas.height / 2 + 45
    );

}


// ============================
// KEYBOARD CONTROLS
// ============================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();


        // ============================
        // SAYFA SCROLL ENGELLE
        // ============================

        const gameKeys = [

            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",

            "w",
            "a",
            "s",
            "d",

            " "

        ];


        if (gameKeys.includes(key)) {

            event.preventDefault();

        }


        // ============================
        // SPACE
        // START / RESTART
        // ============================

        if (key === " ") {

            if (!gameRunning) {

                startGame();

            }

            return;

        }


        // Oyun başlamadıysa
        // yön tuşlarını işleme

        if (!gameRunning) {

            return;

        }


        // ============================
        // UP
        // ============================

        if (
            key === "arrowup" ||
            key === "w"
        ) {

            // Aşağı giderken direkt yukarı
            // dönmesini engelle

            if (direction.y !== 1) {

                nextDirection = {
                    x: 0,
                    y: -1
                };

            }

        }


        // ============================
        // DOWN
        // ============================

        if (
            key === "arrowdown" ||
            key === "s"
        ) {

            // Yukarı giderken direkt aşağı
            // dönmesini engelle

            if (direction.y !== -1) {

                nextDirection = {
                    x: 0,
                    y: 1
                };

            }

        }


        // ============================
        // LEFT
        // ============================

        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            // Sağa giderken direkt sola
            // dönmesini engelle

            if (direction.x !== 1) {

                nextDirection = {
                    x: -1,
                    y: 0
                };

            }

        }


        // ============================
        // RIGHT
        // ============================

        if (
            key === "arrowright" ||
            key === "d"
        ) {

            // Sola giderken direkt sağa
            // dönmesini engelle

            if (direction.x !== -1) {

                nextDirection = {
                    x: 1,
                    y: 0
                };

            }

        }

    }
);


// ============================
// INITIAL SCREEN
// ============================

ctx.fillStyle = "#050505";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);


drawGrid();


ctx.textAlign = "center";


ctx.fillStyle = "#39ff14";

ctx.font =
    "22px 'Courier New'";

ctx.fillText(
    "SNAKE",
    canvas.width / 2,
    canvas.height / 2 - 20
);


ctx.fillStyle = "#f5f5dc";

ctx.font =
    "13px 'Courier New'";

ctx.fillText(
    "PRESS SPACE TO START",
    canvas.width / 2,
    canvas.height / 2 + 20
);