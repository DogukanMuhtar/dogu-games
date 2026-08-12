/* ============================================================
   DOĞU GAMES
   PONG - 1 VS 1
   PLAYER 1 : W / S
   PLAYER 2 : ARROW UP / ARROW DOWN
   FIRST TO 7 WINS
   ============================================================ */


/* ============================================================
   HTML ELEMENTS
   ============================================================ */

const canvas =
    document.getElementById("pongCanvas");

const ctx =
    canvas.getContext("2d");

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const gameArea =
    document.getElementById("gameArea");

const newGameButton =
    document.getElementById("newGameButton");

const gameOver =
    document.getElementById("gameOver");

const gameOverTitle =
    document.getElementById("gameOverTitle");

const gameOverText =
    document.getElementById("gameOverText");

const retryButton =
    document.getElementById("retryButton");

const playerScoreElement =
    document.getElementById("playerScore");

const cpuScoreElement =
    document.getElementById("cpuScore");

const bestScoreElement =
    document.getElementById("bestScore");

const upButton =
    document.getElementById("upButton");

const downButton =
    document.getElementById("downButton");


/* ============================================================
   CANVAS
   ============================================================ */

const CANVAS_WIDTH = 850;
const CANVAS_HEIGHT = 480;

canvas.width =
    CANVAS_WIDTH;

canvas.height =
    CANVAS_HEIGHT;


/* ============================================================
   GAME SETTINGS
   ============================================================ */

const WIN_SCORE = 7;


/*
   RAKET HIZI

   Önce: 7
   Şimdi: 5

   Daha kontrollü ve hassas
   hareket için düşürüldü.
*/

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_SPEED = 3;


/*
   TOP
*/

const BALL_SIZE = 10;

const BALL_INITIAL_SPEED = 2.5;

const BALL_SPEED_INCREMENT = 0.12;

const BALL_MAX_SPEED = 7;


/* ============================================================
   GAME STATE
   ============================================================ */

let gameRunning = false;

let animationFrame = null;

let player1Score = 0;

let player2Score = 0;

let bestScore =
    Number(
        localStorage.getItem(
            "pongBestScore"
        )
    ) || 0;


/*
   Geri sayım
*/

let countdownActive = false;

let countdownValue = 0;

let countdownTimer = null;


/*
   Sayı sonrası topun
   gideceği yön.

   -1 = Player 1
   +1 = Player 2
*/

let nextBallDirection = 1;


/* ============================================================
   COUNTDOWN ELEMENT
   ============================================================ */

/*
   HTML'de countdown elementi
   olmasa bile JS kendisi oluşturur.
*/

let countdownElement =
    document.getElementById(
        "pongCountdown"
    );


if (!countdownElement) {

    countdownElement =
        document.createElement(
            "div"
        );

    countdownElement.id =
        "pongCountdown";

    document.body.appendChild(
        countdownElement
    );

}


/*
   Countdown CSS
*/

countdownElement.style.position =
    "fixed";

countdownElement.style.left =
    "50%";

countdownElement.style.top =
    "50%";

countdownElement.style.transform =
    "translate(-50%, -50%)";

countdownElement.style.zIndex =
    "9999";

countdownElement.style.color =
    "#39ff14";

countdownElement.style.fontFamily =
    '"Courier New", monospace';

countdownElement.style.fontSize =
    "64px";

countdownElement.style.fontWeight =
    "bold";

countdownElement.style.textAlign =
    "center";

countdownElement.style.lineHeight =
    "1";

countdownElement.style.textShadow =
    "0 0 20px rgba(57,255,20,.7)";

countdownElement.style.pointerEvents =
    "none";

countdownElement.style.display =
    "none";


/* ============================================================
   KEY STATE
   ============================================================ */

const keys = {

    w: false,

    s: false,

    ArrowUp: false,

    ArrowDown: false

};


/* ============================================================
   PLAYER 1
   ============================================================ */

const player1 = {

    x: 25,

    y:
        CANVAS_HEIGHT / 2 -
        PADDLE_HEIGHT / 2,

    width:
        PADDLE_WIDTH,

    height:
        PADDLE_HEIGHT,

    speed:
        PADDLE_SPEED

};


/* ============================================================
   PLAYER 2
   ============================================================ */

const player2 = {

    x:
        CANVAS_WIDTH -
        25 -
        PADDLE_WIDTH,

    y:
        CANVAS_HEIGHT / 2 -
        PADDLE_HEIGHT / 2,

    width:
        PADDLE_WIDTH,

    height:
        PADDLE_HEIGHT,

    speed:
        PADDLE_SPEED

};


/* ============================================================
   BALL
   ============================================================ */

const ball = {

    x:
        CANVAS_WIDTH / 2 -
        BALL_SIZE / 2,

    y:
        CANVAS_HEIGHT / 2 -
        BALL_SIZE / 2,

    size:
        BALL_SIZE,

    dx: 0,

    dy: 0,

    speed:
        BALL_INITIAL_SPEED

};


/* ============================================================
   SCORE
   ============================================================ */

function updateScore() {

    playerScoreElement.textContent =
        player1Score;

    cpuScoreElement.textContent =
        player2Score;

    bestScoreElement.textContent =
        bestScore;

}


/* ============================================================
   RESET PADDLES
   ============================================================ */

function resetPaddles() {

    player1.y =
        CANVAS_HEIGHT / 2 -
        PADDLE_HEIGHT / 2;

    player2.y =
        CANVAS_HEIGHT / 2 -
        PADDLE_HEIGHT / 2;

}


/* ============================================================
   CENTER BALL
   ============================================================ */

function centerBall() {

    ball.x =
        CANVAS_WIDTH / 2 -
        BALL_SIZE / 2;

    ball.y =
        CANVAS_HEIGHT / 2 -
        BALL_SIZE / 2;

    ball.dx = 0;

    ball.dy = 0;

    ball.speed =
        BALL_INITIAL_SPEED;

}


/* ============================================================
   SHOW COUNTDOWN
   ============================================================ */

function showCountdownNumber(
    number
) {

    countdownElement.textContent =
        number;

    countdownElement.style.display =
        "block";

}


/* ============================================================
   HIDE COUNTDOWN
   ============================================================ */

function hideCountdown() {

    countdownElement.textContent =
        "";

    countdownElement.style.display =
        "none";

}


/* ============================================================
   START COUNTDOWN
   ============================================================ */

function startCountdown(
    direction
) {

    /*
       Eski countdown varsa temizle.
    */

    clearInterval(
        countdownTimer
    );


    countdownTimer =
        null;


    countdownActive =
        true;


    countdownValue =
        3;


    nextBallDirection =
        direction;


    /*
       Top kesinlikle
       tam merkezde.
    */

    centerBall();


    /*
       İlk olarak 3 göster.
    */

    showCountdownNumber(
        3
    );


    /*
       Her saniye bir sayı azalt.
    */

    countdownTimer =
        setInterval(
            function() {

                countdownValue--;


                /*
                   2
                */

                if (
                    countdownValue === 2
                ) {

                    showCountdownNumber(
                        2
                    );

                    return;

                }


                /*
                   1
                */

                if (
                    countdownValue === 1
                ) {

                    showCountdownNumber(
                        1
                    );

                    return;

                }


                /*
                   0 oldu.
                   Countdown bitti.
                */

                clearInterval(
                    countdownTimer
                );


                countdownTimer =
                    null;


                countdownActive =
                    false;


                hideCountdown();


                /*
                   Topu başlat.
                */

                launchBall(
                    direction
                );

            },
            1000
        );

}


/* ============================================================
   RESET BALL
   ============================================================ */

function resetBall(
    direction
) {

    nextBallDirection =
        direction;

    // Her sayıdan sonra
    // iki raketi de ortaya al
    resetPaddles();

    // Topu tam ortaya al
    centerBall();

    // 3 - 2 - 1 geri sayımı başlat
    startCountdown(
        direction
    );

}


/* ============================================================
   LAUNCH BALL
   ============================================================ */

function launchBall(
    direction
) {

    /*
       Top tekrar merkezde.
    */

    centerBall();


    /*
       Başlangıç hızı
       her serviste tekrar 2.5.
    */

    ball.speed =
        BALL_INITIAL_SPEED;


    /*
       Rastgele dikey açı.
    */

    const angle =
        (
            Math.random() * 0.8
        ) - 0.4;


    ball.dx =
        direction *
        ball.speed *
        Math.cos(angle);


    ball.dy =
        ball.speed *
        Math.sin(angle);


    /*
       Çok yatay gitmesini engelle.
    */

    if (
        Math.abs(ball.dy) < 0.7
    ) {

        ball.dy =
            direction > 0
                ? 1
                : -1;

    }

}


/* ============================================================
   RESET GAME
   ============================================================ */

function resetGame() {

    clearInterval(
        countdownTimer
    );


    countdownTimer =
        null;


    countdownActive =
        false;


    hideCountdown();


    player1Score = 0;

    player2Score = 0;


    resetPaddles();

    centerBall();


    gameOver.classList.remove(
        "active"
    );


    updateScore();

}


/* ============================================================
   START GAME
   ============================================================ */

function startGame() {

    resetGame();


    startScreen.classList.add(
        "hidden"
    );


    gameArea.classList.add(
        "active"
    );


    gameRunning =
        true;


    cancelAnimationFrame(
        animationFrame
    );


    /*
       İlk servis yönü
       rastgele.
    */

    const firstDirection =
        Math.random() < 0.5
            ? -1
            : 1;


    startCountdown(
        firstDirection
    );


    gameLoop();

}


/* ============================================================
   UPDATE PADDLES
   ============================================================ */

function updatePaddles() {

    /*
       PLAYER 1
       W = UP
       S = DOWN
    */

    if (keys.w) {

        player1.y -=
            player1.speed;

    }


    if (keys.s) {

        player1.y +=
            player1.speed;

    }


    /*
       PLAYER 2
       ↑ = UP
       ↓ = DOWN
    */

    if (keys.ArrowUp) {

        player2.y -=
            player2.speed;

    }


    if (keys.ArrowDown) {

        player2.y +=
            player2.speed;

    }


    /*
       PLAYER 1 sınır.
    */

    if (
        player1.y < 0
    ) {

        player1.y = 0;

    }


    if (
        player1.y +
        player1.height >
        CANVAS_HEIGHT
    ) {

        player1.y =
            CANVAS_HEIGHT -
            player1.height;

    }


    /*
       PLAYER 2 sınır.
    */

    if (
        player2.y < 0
    ) {

        player2.y = 0;

    }


    if (
        player2.y +
        player2.height >
        CANVAS_HEIGHT
    ) {

        player2.y =
            CANVAS_HEIGHT -
            player2.height;

    }

}


/* ============================================================
   COLLISION
   ============================================================ */

function checkPaddleCollision(
    paddle
) {

    return (

        ball.x <
            paddle.x +
            paddle.width

        &&

        ball.x +
            ball.size >
            paddle.x

        &&

        ball.y <
            paddle.y +
            paddle.height

        &&

        ball.y +
            ball.size >
            paddle.y

    );

}


/* ============================================================
   PADDLE BOUNCE
   ============================================================ */

function bounceFromPaddle(
    paddle,
    direction
) {

    const paddleCenter =
        paddle.y +
        paddle.height / 2;


    const ballCenter =
        ball.y +
        ball.size / 2;


    /*
       Topun paddle üzerindeki
       konumu.
    */

    const hitPosition =
        (
            ballCenter -
            paddleCenter
        ) /
        (
            paddle.height / 2
        );


    const maxAngle =
        Math.PI / 3;


    const angle =
        hitPosition *
        maxAngle;


    /*
       Her vuruşta çok
       küçük hızlanma.
    */

    ball.speed =
        Math.min(
            ball.speed +
            BALL_SPEED_INCREMENT,

            BALL_MAX_SPEED
        );


    ball.dx =
        direction *
        ball.speed *
        Math.cos(angle);


    ball.dy =
        ball.speed *
        Math.sin(angle);


    /*
       Paddle içine girmesin.
    */

    if (
        direction > 0
    ) {

        ball.x =
            paddle.x +
            paddle.width;

    } else {

        ball.x =
            paddle.x -
            ball.size;

    }

}


/* ============================================================
   UPDATE BALL
   ============================================================ */

function updateBall() {

    /*
       Countdown sırasında
       top hareket etmez.
    */

    if (
        countdownActive
    ) {

        return;

    }


    ball.x +=
        ball.dx;


    ball.y +=
        ball.dy;


    /*
       ÜST DUVAR
    */

    if (
        ball.y <= 0
    ) {

        ball.y = 0;

        ball.dy =
            Math.abs(
                ball.dy
            );

    }


    /*
       ALT DUVAR
    */

    if (
        ball.y +
        ball.size >=
        CANVAS_HEIGHT
    ) {

        ball.y =
            CANVAS_HEIGHT -
            ball.size;

        ball.dy =
            -Math.abs(
                ball.dy
            );

    }


    /*
       PLAYER 1 RAKETİ
    */

    if (
        ball.dx < 0 &&
        checkPaddleCollision(
            player1
        )
    ) {

        bounceFromPaddle(
            player1,
            1
        );

    }


    /*
       PLAYER 2 RAKETİ
    */

    if (
        ball.dx > 0 &&
        checkPaddleCollision(
            player2
        )
    ) {

        bounceFromPaddle(
            player2,
            -1
        );

    }


    /*
       PLAYER 1 SAYI YEDİ

       Player 2 sayı aldı.

       Top tekrar merkeze gelir
       ve Player 1 tarafına gider.
    */

    if (
        ball.x +
        ball.size <
        0
    ) {

        player2Score++;

        updateScore();


        if (
            player2Score >=
            WIN_SCORE
        ) {

            endGame(
                "PLAYER 2 WINS!"
            );

            return;

        }


        resetBall(
            -1
        );


        return;

    }


    /*
       PLAYER 2 SAYI YEDİ

       Player 1 sayı aldı.

       Top tekrar merkeze gelir
       ve Player 2 tarafına gider.
    */

    if (
        ball.x >
        CANVAS_WIDTH
    ) {

        player1Score++;

        updateScore();


        if (
            player1Score >=
            WIN_SCORE
        ) {

            endGame(
                "PLAYER 1 WINS!"
            );

            return;

        }


        resetBall(
            1
        );


        return;

    }

}


/* ============================================================
   END GAME
   ============================================================ */

function endGame(
    winner
) {

    gameRunning =
        false;


    countdownActive =
        false;


    clearInterval(
        countdownTimer
    );


    countdownTimer =
        null;


    hideCountdown();


    cancelAnimationFrame(
        animationFrame
    );


    const currentBest =
        Math.max(
            player1Score,
            player2Score
        );


    if (
        currentBest >
        bestScore
    ) {

        bestScore =
            currentBest;


        localStorage.setItem(
            "pongBestScore",
            bestScore
        );

    }


    updateScore();


    gameOverTitle.textContent =
        winner;


    gameOverText.innerHTML =

        "PLAYER 1: <strong>" +
        player1Score +
        "</strong><br>" +

        "PLAYER 2: <strong>" +
        player2Score +
        "</strong>";


    gameOver.classList.add(
        "active"
    );

}


/* ============================================================
   DRAW BACKGROUND
   ============================================================ */

function drawBackground() {

    ctx.fillStyle =
        "#020202";


    ctx.fillRect(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );


    /*
       Çerçeve.
    */

    ctx.strokeStyle =
        "#303030";

    ctx.lineWidth =
        2;


    ctx.strokeRect(
        1,
        1,
        CANVAS_WIDTH - 2,
        CANVAS_HEIGHT - 2
    );


    /*
       Orta çizgi.
    */

    ctx.strokeStyle =
        "#222222";


    ctx.setLineDash([
        8,
        12
    ]);


    ctx.beginPath();


    ctx.moveTo(
        CANVAS_WIDTH / 2,
        0
    );


    ctx.lineTo(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT
    );


    ctx.stroke();


    ctx.setLineDash([]);


    /*
       Orta daire.
    */

    ctx.strokeStyle =
        "#1d1d1d";


    ctx.lineWidth =
        2;


    ctx.beginPath();


    ctx.arc(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        65,
        0,
        Math.PI * 2
    );


    ctx.stroke();

}


/* ============================================================
   DRAW PADDLE
   ============================================================ */

function drawPaddle(
    paddle,
    player
) {

    /*
       PLAYER 1
       NEON MAVİ + BEYAZ
    */

    if (player === 1) {

        ctx.shadowColor =
            "#00eaff";

        ctx.shadowBlur =
            18;


        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            paddle.x,
            paddle.y,
            paddle.width,
            paddle.height
        );


        ctx.shadowColor =
            "#00eaff";

        ctx.shadowBlur =
            14;


        ctx.fillStyle =
            "#00eaff";

        ctx.fillRect(
            paddle.x,
            paddle.y,
            3,
            paddle.height
        );

    }


    /*
       PLAYER 2
       NEON KIRMIZI + BEYAZ
    */

    if (player === 2) {

        ctx.shadowColor =
            "#ff1744";

        ctx.shadowBlur =
            18;


        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            paddle.x,
            paddle.y,
            paddle.width,
            paddle.height
        );


        ctx.shadowColor =
            "#ff1744";

        ctx.shadowBlur =
            14;


        ctx.fillStyle =
            "#ff1744";

        ctx.fillRect(
            paddle.x,
            paddle.y,
            3,
            paddle.height
        );

    }


    /*
       Glow'u sıfırla
    */

    ctx.shadowBlur = 0;

}


/* ============================================================
   DRAW BALL
   ============================================================ */

function drawBall() {

    ctx.shadowColor =
        "#39ff14";


    ctx.shadowBlur =
        12;


    ctx.fillStyle =
        "#39ff14";


    ctx.fillRect(
        ball.x,
        ball.y,
        ball.size,
        ball.size
    );


    ctx.shadowBlur =
        0;

}


/* ============================================================
   DRAW GAME
   ============================================================ */

function drawGame() {

    drawBackground();

    drawPaddle(
        player1,
        1
    );

    drawPaddle(
        player2,
        2
    );

    drawBall();

}


/* ============================================================
   GAME LOOP
   ============================================================ */

function gameLoop() {

    if (
        !gameRunning
    ) {

        return;

    }


    updatePaddles();

    updateBall();

    drawGame();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* ============================================================
   KEY DOWN
   ============================================================ */

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key;


        /*
           Ok tuşları sayfayı
           kaydırmasın.
        */

        if (
            key === "ArrowUp" ||
            key === "ArrowDown"
        ) {

            event.preventDefault();

        }


        /*
           PLAYER 1 - W
        */

        if (
            key.toLowerCase() === "w"
        ) {

            keys.w = true;

        }


        /*
           PLAYER 1 - S
        */

        if (
            key.toLowerCase() === "s"
        ) {

            keys.s = true;

        }


        /*
           PLAYER 2 - UP
        */

        if (
            key === "ArrowUp"
        ) {

            keys.ArrowUp = true;

        }


        /*
           PLAYER 2 - DOWN
        */

        if (
            key === "ArrowDown"
        ) {

            keys.ArrowDown = true;

        }

    }
);


/* ============================================================
   KEY UP
   ============================================================ */

document.addEventListener(
    "keyup",
    function(event) {

        const key =
            event.key;


        if (
            key.toLowerCase() === "w"
        ) {

            keys.w = false;

        }


        if (
            key.toLowerCase() === "s"
        ) {

            keys.s = false;

        }


        if (
            key === "ArrowUp"
        ) {

            keys.ArrowUp = false;

        }


        if (
            key === "ArrowDown"
        ) {

            keys.ArrowDown = false;

        }

    }
);


/* ============================================================
   START
   ============================================================ */

startButton.addEventListener(
    "click",
    function() {

        startGame();

    }
);


/* ============================================================
   NEW GAME
   ============================================================ */

newGameButton.addEventListener(
    "click",
    function() {

        startGame();

    }
);


/* ============================================================
   RETRY
   ============================================================ */

retryButton.addEventListener(
    "click",
    function() {

        startGame();

    }
);


/* ============================================================
   MOBILE UP
   ============================================================ */

if (
    upButton
) {

    upButton.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            keys.ArrowUp =
                true;

        }
    );


    upButton.addEventListener(
        "pointerup",
        function(event) {

            event.preventDefault();

            keys.ArrowUp =
                false;

        }
    );


    upButton.addEventListener(
        "pointerleave",
        function() {

            keys.ArrowUp =
                false;

        }
    );

}


/* ============================================================
   MOBILE DOWN
   ============================================================ */

if (
    downButton
) {

    downButton.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            keys.ArrowDown =
                true;

        }
    );


    downButton.addEventListener(
        "pointerup",
        function(event) {

            event.preventDefault();

            keys.ArrowDown =
                false;

        }
    );


    downButton.addEventListener(
        "pointerleave",
        function() {

            keys.ArrowDown =
                false;

        }
    );

}


/* ============================================================
   INITIAL STATE
   ============================================================ */

updateScore();

centerBall();

drawBackground();

drawPaddle(
    player1,
    1
);

drawPaddle(
    player2,
    2
);

drawBall();