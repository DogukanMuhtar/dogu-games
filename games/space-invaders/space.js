/* =========================================================
   DOĞU GAMES - SPACE INVADERS
   VERSION 2
   - Sound Effects
   - Wave System
   - Supabase Leaderboard
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://zvxzfwftwvkjvqvdqabo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GF0KjdrmsluAuSDW9SmkLg_svFg1SrL";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   CANVAS
========================================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   UI
========================================================= */

const scoreElement =
    document.getElementById("score");

const bestElement =
    document.getElementById("best");

const livesElement =
    document.getElementById("lives");

const startOverlay =
    document.getElementById("startOverlay");

const gameOverOverlay =
    document.getElementById("gameOverOverlay");

const gameOverText =
    document.getElementById("gameOverText");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const fireBtn =
    document.getElementById("fireBtn");


/* =========================================================
   GAME SETTINGS
========================================================= */

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

let gameRunning = false;

let animationId = null;

let score = 0;

let lives = 3;

let wave = 1;

let bestScore = 0;

let player;

let bullets = [];

let enemyBullets = [];

let enemies = [];

let particles = [];

let stars = [];

let enemyDirection = 1;

let enemyMoveTimer = 0;

let enemyShootTimer = 0;

let lastTime = 0;


/* =========================================================
   WAVE SYSTEM
========================================================= */

let waveTransition = false;

let waveMessage = "";

let waveMessageTimer = 0;

let waveMessageMaxTime = 1.5;


/* =========================================================
   AUDIO SYSTEM
========================================================= */

let audioContext = null;


/*
    Tarayıcı sesleri otomatik başlatmayı engelleyebilir.
    AudioContext sadece kullanıcı START GAME / SPACE
    gibi bir işlem yaptığında aktifleşir.
*/

function initAudio() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        audioContext =
            new AudioContext();
    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }

}


/* =========================================================
   GENERIC SOUND
========================================================= */

function playTone(
    frequency,
    duration,
    type = "square",
    volume = 0.04,
    slideTo = null
) {

    if (!audioContext) {
        return;
    }

    if (
        audioContext.state ===
        "suspended"
    ) {
        audioContext.resume();
    }


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        type;

    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );


    if (slideTo !== null) {

        oscillator.frequency.linearRampToValueAtTime(
            slideTo,
            audioContext.currentTime +
            duration
        );

    }


    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        duration
    );


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration
    );

}


/* =========================================================
   SOUND EFFECTS
========================================================= */


/* PLAYER SHOOT */

function soundPlayerShoot() {

    playTone(
        780,
        0.07,
        "square",
        0.045,
        280
    );

}


/* ENEMY SHOOT */

function soundEnemyShoot() {

    playTone(
        180,
        0.12,
        "sawtooth",
        0.035,
        90
    );

}


/* ENEMY HIT */

function soundEnemyHit() {

    playTone(
        260,
        0.08,
        "square",
        0.05,
        70
    );

}


/* PLAYER HIT */

function soundPlayerHit() {

    playTone(
        110,
        0.25,
        "sawtooth",
        0.07,
        40
    );

}


/* WAVE COMPLETE */

function soundWaveComplete() {

    if (!audioContext) {
        return;
    }

    playTone(
        440,
        0.12,
        "square",
        0.05
    );

    setTimeout(
        function () {

            playTone(
                660,
                0.12,
                "square",
                0.05
            );

        },
        110
    );

    setTimeout(
        function () {

            playTone(
                880,
                0.18,
                "square",
                0.055
            );

        },
        220
    );

}


/* GAME OVER */

function soundGameOver() {

    if (!audioContext) {
        return;
    }

    playTone(
        300,
        0.18,
        "square",
        0.05,
        180
    );

    setTimeout(
        function () {

            playTone(
                180,
                0.25,
                "square",
                0.05,
                80
            );

        },
        180
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

const keys = {

    left: false,

    right: false,

    fire: false

};


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code === "ArrowLeft" ||
            event.code === "KeyA"
        ) {

            keys.left = true;

            event.preventDefault();

        }


        if (
            event.code === "ArrowRight" ||
            event.code === "KeyD"
        ) {

            keys.right = true;

            event.preventDefault();

        }


        if (
            event.code === "Space"
        ) {

            initAudio();

            keys.fire = true;

            event.preventDefault();

        }


        if (
            event.code === "Enter" &&
            !gameRunning
        ) {

            initAudio();


            if (
                !startOverlay.classList.contains(
                    "hidden"
                )
            ) {

                startGame();

            }

            else {

                restartGame();

            }

        }

    }
);


document.addEventListener(
    "keyup",
    function (event) {

        if (
            event.code === "ArrowLeft" ||
            event.code === "KeyA"
        ) {

            keys.left = false;

        }


        if (
            event.code === "ArrowRight" ||
            event.code === "KeyD"
        ) {

            keys.right = false;

        }


        if (
            event.code === "Space"
        ) {

            keys.fire = false;

        }

    }
);


/* =========================================================
   MOBILE CONTROLS
========================================================= */

function buttonHold(
    button,
    key
) {

    if (!button) {
        return;
    }


    button.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            initAudio();

            keys[key] = true;

        }
    );


    button.addEventListener(
        "pointerup",
        function (event) {

            event.preventDefault();

            keys[key] = false;

        }
    );


    button.addEventListener(
        "pointercancel",
        function () {

            keys[key] = false;

        }
    );


    button.addEventListener(
        "pointerleave",
        function () {

            keys[key] = false;

        }
    );

}


buttonHold(
    leftBtn,
    "left"
);

buttonHold(
    rightBtn,
    "right"
);

buttonHold(
    fireBtn,
    "fire"
);


/* =========================================================
   BEST SCORE
========================================================= */

function loadBestScore() {

    const saved =
        localStorage.getItem(
            "doguGamesSpaceBest"
        );


    if (saved) {

        bestScore =
            Number(saved);

    }


    updateUI();

}


function updateBestScore() {

    if (
        score >
        bestScore
    ) {

        bestScore =
            score;

        localStorage.setItem(
            "doguGamesSpaceBest",
            bestScore
        );

    }


    updateUI();

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    scoreElement.textContent =
        score.toLocaleString(
            "tr-TR"
        );


    bestElement.textContent =
        bestScore.toLocaleString(
            "tr-TR"
        );


    livesElement.textContent =
        lives;

}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

    return {

        x:
            GAME_WIDTH / 2 - 25,

        y:
            GAME_HEIGHT - 65,

        width:
            50,

        height:
            28,

        speed:
            360,

        cooldown:
            0

    };

}


/* =========================================================
   ENEMIES
========================================================= */

function createEnemies() {

    enemies = [];


    /*
        Wave arttıkça satır sayısı artıyor.
        İlk wave 4 satır.
        Maksimum 6 satır.
    */

    const rows =
        Math.min(
            6,
            4 +
            Math.floor(
                (wave - 1) / 2
            )
        );


    const columns =
        Math.min(
            11,
            10 +
            Math.floor(
                (wave - 1) / 4
            )
        );


    const enemyWidth = 42;

    const enemyHeight = 30;

    const gapX = 24;

    const gapY = 22;


    const totalWidth =
        columns *
        enemyWidth +
        (columns - 1) *
        gapX;


    const startX =
        (
            GAME_WIDTH -
            totalWidth
        ) / 2;


    const startY =
        65;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let col = 0;
            col < columns;
            col++
        ) {

            enemies.push({

                x:
                    startX +
                    col *
                    (
                        enemyWidth +
                        gapX
                    ),

                y:
                    startY +
                    row *
                    (
                        enemyHeight +
                        gapY
                    ),

                width:
                    enemyWidth,

                height:
                    enemyHeight,

                row:
                    row,

                alive:
                    true

            });

        }

    }

}


/* =========================================================
   STARS
========================================================= */

function createStars() {

    stars = [];


    for (
        let i = 0;
        i < 90;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                GAME_WIDTH,

            y:
                Math.random() *
                GAME_HEIGHT,

            size:
                Math.random() *
                2 + 1,

            speed:
                Math.random() *
                20 + 5

        });

    }

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    initAudio();


    cancelAnimationFrame(
        animationId
    );


    score = 0;

    lives = 3;

    wave = 1;


    bullets = [];

    enemyBullets = [];

    particles = [];


    enemyDirection = 1;

    enemyMoveTimer = 0;

    enemyShootTimer = 0;


    waveTransition = false;

    waveMessage = "";

    waveMessageTimer = 0;


    player =
        createPlayer();


    createEnemies();

    createStars();

    updateUI();


    startOverlay.classList.add(
        "hidden"
    );


    gameOverOverlay.classList.add(
        "hidden"
    );


    gameRunning = true;


    lastTime =
        performance.now();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

    initAudio();

    startGame();

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(
    timestamp
) {

    if (!gameRunning) {
        return;
    }


    let delta =
        (
            timestamp -
            lastTime
        ) / 1000;


    if (
        delta >
        0.05
    ) {

        delta = 0.05;

    }


    lastTime =
        timestamp;


    update(delta);

    draw();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   UPDATE
========================================================= */

function update(delta) {

    updateStars(delta);

    updatePlayer(delta);

    updateBullets(delta);

    updateEnemyBullets(delta);

    updateEnemies(delta);

    updateParticles(delta);

    updateWaveMessage(delta);


    checkCollisions();

    checkEnemyReachedPlayer();

    checkLevelComplete();

}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(delta) {

    if (!player) {
        return;
    }


    if (keys.left) {

        player.x -=
            player.speed *
            delta;

    }


    if (keys.right) {

        player.x +=
            player.speed *
            delta;

    }


    if (
        player.x < 10
    ) {

        player.x = 10;

    }


    if (
        player.x +
        player.width >
        GAME_WIDTH - 10
    ) {

        player.x =
            GAME_WIDTH -
            player.width -
            10;

    }


    if (
        player.cooldown > 0
    ) {

        player.cooldown -=
            delta;

    }


    if (
        keys.fire &&
        player.cooldown <= 0
    ) {

        shoot();

        player.cooldown =
            0.25;

    }

}


/* =========================================================
   PLAYER SHOOT
========================================================= */

function shoot() {

    bullets.push({

        x:
            player.x +
            player.width / 2 -
            2,

        y:
            player.y - 8,

        width:
            4,

        height:
            14,

        speed:
            550

    });


    soundPlayerShoot();

}


/* =========================================================
   BULLETS UPDATE
========================================================= */

function updateBullets(
    delta
) {

    for (
        let i =
            bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        bullet.y -=
            bullet.speed *
            delta;


        if (
            bullet.y +
            bullet.height <
            0
        ) {

            bullets.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   ENEMY SHOOT
========================================================= */

function enemyShoot() {

    const aliveEnemies =
        enemies.filter(
            enemy =>
                enemy.alive
        );


    if (
        aliveEnemies.length === 0
    ) {

        return;

    }


    const shooter =
        aliveEnemies[
            Math.floor(
                Math.random() *
                aliveEnemies.length
            )
        ];


    enemyBullets.push({

        x:
            shooter.x +
            shooter.width / 2 -
            2,

        y:
            shooter.y +
            shooter.height,

        width:
            4,

        height:
            13,

        speed:
            180 +
            wave * 15

    });


    soundEnemyShoot();

}


/* =========================================================
   ENEMY BULLETS UPDATE
========================================================= */

function updateEnemyBullets(
    delta
) {

    enemyShootTimer +=
        delta;


    /*
        Wave arttıkça düşmanlar daha
        sık ateş ediyor.
    */

    const shootInterval =
        Math.max(
            0.38,
            1.3 -
            wave * 0.08
        );


    if (
        enemyShootTimer >=
        shootInterval
    ) {

        enemyShoot();

        enemyShootTimer = 0;

    }


    for (
        let i =
            enemyBullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            enemyBullets[i];


        bullet.y +=
            bullet.speed *
            delta;


        if (
            bullet.y >
            GAME_HEIGHT
        ) {

            enemyBullets.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   ENEMY UPDATE
========================================================= */

function updateEnemies(
    delta
) {

    enemyMoveTimer +=
        delta;


    /*
        Wave arttıkça düşman hareketi hızlanır.
    */

    const moveInterval =
        Math.max(
            0.10,
            0.65 -
            wave * 0.045
        );


    if (
        enemyMoveTimer <
        moveInterval
    ) {

        return;

    }


    enemyMoveTimer = 0;


    const aliveEnemies =
        enemies.filter(
            enemy =>
                enemy.alive
        );


    if (
        aliveEnemies.length === 0
    ) {

        return;

    }


    const minX =
        Math.min(
            ...aliveEnemies.map(
                enemy =>
                    enemy.x
            )
        );


    const maxX =
        Math.max(
            ...aliveEnemies.map(
                enemy =>
                    enemy.x +
                    enemy.width
            )
        );


    const moveAmount =
        12 +
        wave * 1.5;


    if (
        maxX >=
            GAME_WIDTH - 20 &&
        enemyDirection === 1
    ) {

        enemyDirection = -1;


        enemies.forEach(
            enemy => {

                enemy.y +=
                    18 +
                    Math.min(
                        wave,
                        8
                    );

            }
        );

    }


    else if (
        minX <= 20 &&
        enemyDirection === -1
    ) {

        enemyDirection = 1;


        enemies.forEach(
            enemy => {

                enemy.y +=
                    18 +
                    Math.min(
                        wave,
                        8
                    );

            }
        );

    }


    enemies.forEach(
        enemy => {

            if (
                enemy.alive
            ) {

                enemy.x +=
                    moveAmount *
                    enemyDirection;

            }

        }
    );

}


/* =========================================================
   COLLISIONS
========================================================= */

function checkCollisions() {


    /* PLAYER BULLETS → ENEMIES */

    for (
        let i =
            bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        for (
            let j = 0;
            j < enemies.length;
            j++
        ) {

            const enemy =
                enemies[j];


            if (
                !enemy.alive
            ) {

                continue;

            }


            if (
                rectanglesOverlap(
                    bullet,
                    enemy
                )
            ) {

                enemy.alive =
                    false;


                bullets.splice(
                    i,
                    1
                );


                const points =
                    Math.max(
                        10,
                        40 -
                        enemy.row * 5
                    );


                score +=
                    points *
                    wave;


                updateBestScore();


                createExplosion(
                    enemy.x +
                    enemy.width / 2,
                    enemy.y +
                    enemy.height / 2
                );


                soundEnemyHit();


                break;

            }

        }

    }


    /* ENEMY BULLETS → PLAYER */

    for (
        let i =
            enemyBullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            enemyBullets[i];


        if (
            rectanglesOverlap(
                bullet,
                player
            )
        ) {

            enemyBullets.splice(
                i,
                1
            );


            loseLife();

        }

    }

}


/* =========================================================
   RECTANGLE COLLISION
========================================================= */

function rectanglesOverlap(
    a,
    b
) {

    return (

        a.x <
            b.x +
            b.width &&

        a.x +
        a.width >
            b.x &&

        a.y <
            b.y +
            b.height &&

        a.y +
        a.height >
            b.y

    );

}


/* =========================================================
   ENEMY REACH PLAYER
========================================================= */

function checkEnemyReachedPlayer() {

    const aliveEnemies =
        enemies.filter(
            enemy =>
                enemy.alive
        );


    for (
        const enemy of aliveEnemies
    ) {

        if (
            enemy.y +
            enemy.height >=
            player.y
        ) {

            gameOver();

            return;

        }

    }

}


/* =========================================================
   LIFE
========================================================= */

function loseLife() {

    lives--;


    updateUI();


    createExplosion(
        player.x +
        player.width / 2,
        player.y +
        player.height / 2
    );


    soundPlayerHit();


    if (
        lives <= 0
    ) {

        gameOver();

    }

}


/* =========================================================
   WAVE COMPLETE
========================================================= */

function checkLevelComplete() {

    if (
        waveTransition
    ) {

        return;

    }


    const remaining =
        enemies.some(
            enemy =>
                enemy.alive
        );


    if (
        remaining
    ) {

        return;

    }


    /*
        Mevcut wave tamamlandı.
    */

    waveTransition =
        true;


    soundWaveComplete();


    score +=
        500 *
        wave;


    updateBestScore();


    waveMessage =
        `WAVE ${wave} CLEAR`;


    waveMessageTimer =
        waveMessageMaxTime;


    /*
        Biraz bekleyip yeni wave başlat.
    */

    setTimeout(
        function () {

            if (!gameRunning) {
                return;
            }


            wave++;


            bullets = [];

            enemyBullets = [];

            enemyDirection = 1;

            enemyMoveTimer = 0;

            enemyShootTimer = 0;


            createEnemies();


            waveMessage =
                `WAVE ${wave}`;


            waveMessageTimer =
                waveMessageMaxTime;


            waveTransition =
                false;


            updateUI();

        },
        1200
    );

}


/* =========================================================
   WAVE MESSAGE
========================================================= */

function updateWaveMessage(
    delta
) {

    if (
        waveMessageTimer > 0
    ) {

        waveMessageTimer -=
            delta;


        if (
            waveMessageTimer <= 0
        ) {

            waveMessageTimer = 0;

        }

    }

}


/* =========================================================
   PARTICLES
========================================================= */

function createExplosion(
    x,
    y
) {

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            Math.random() *
            120 +
            40;


        particles.push({

            x:
                x,

            y:
                y,

            vx:
                Math.cos(
                    angle
                ) *
                speed,

            vy:
                Math.sin(
                    angle
                ) *
                speed,

            life:
                0.5,

            maxLife:
                0.5,

            size:
                Math.random() *
                3 +
                1

        });

    }

}


/* =========================================================
   PARTICLES UPDATE
========================================================= */

function updateParticles(
    delta
) {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx *
            delta;


        particle.y +=
            particle.vy *
            delta;


        particle.life -=
            delta;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   STARS UPDATE
========================================================= */

function updateStars(
    delta
) {

    stars.forEach(
        star => {

            star.y +=
                star.speed *
                delta;


            if (
                star.y >
                GAME_HEIGHT
            ) {

                star.y = 0;


                star.x =
                    Math.random() *
                    GAME_WIDTH;

            }

        }
    );

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );


    drawBackground();

    drawStars();

    drawEnemies();

    drawPlayer();

    drawBullets();

    drawEnemyBullets();

    drawParticles();

    drawWaveMessage();

}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    ctx.fillStyle =
        "#020402";


    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );


    const gradient =
        ctx.createRadialGradient(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            50,
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            500
        );


    gradient.addColorStop(
        0,
        "rgba(30,70,20,0.12)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );

}


/* =========================================================
   STARS
========================================================= */

function drawStars() {

    stars.forEach(
        star => {

            ctx.fillStyle =
                "rgba(156,255,87,0.35)";


            ctx.fillRect(
                Math.floor(
                    star.x
                ),
                Math.floor(
                    star.y
                ),
                star.size,
                star.size
            );

        }
    );

}


/* =========================================================
   PLAYER
========================================================= */

function drawPlayer() {

    if (!player) {
        return;
    }


    ctx.fillStyle =
        "#9cff57";


    ctx.fillRect(
        player.x + 10,
        player.y + 12,
        30,
        10
    );


    ctx.fillRect(
        player.x + 4,
        player.y + 18,
        42,
        7
    );


    ctx.fillRect(
        player.x + 20,
        player.y + 4,
        10,
        20
    );


    ctx.shadowColor =
        "#9cff57";

    ctx.shadowBlur = 12;


    ctx.fillRect(
        player.x + 20,
        player.y + 4,
        10,
        5
    );


    ctx.shadowBlur = 0;

}


/* =========================================================
   ENEMIES
========================================================= */

function drawEnemies() {

    enemies.forEach(
        enemy => {

            if (
                !enemy.alive
            ) {

                return;

            }


            ctx.fillStyle =
                enemy.row === 0
                    ? "#ffffff"
                    : "#9cff57";


            ctx.shadowColor =
                "#9cff57";

            ctx.shadowBlur = 5;


            const x =
                Math.floor(
                    enemy.x
                );


            const y =
                Math.floor(
                    enemy.y
                );


            ctx.fillRect(
                x + 10,
                y,
                22,
                5
            );


            ctx.fillRect(
                x + 5,
                y + 5,
                32,
                13
            );


            ctx.fillRect(
                x,
                y + 18,
                42,
                5
            );


            ctx.fillRect(
                x + 5,
                y + 23,
                7,
                7
            );


            ctx.fillRect(
                x + 30,
                y + 23,
                7,
                7
            );


            ctx.fillStyle =
                "#020402";


            ctx.fillRect(
                x + 11,
                y + 8,
                5,
                5
            );


            ctx.fillRect(
                x + 26,
                y + 8,
                5,
                5
            );


            ctx.shadowBlur = 0;

        }
    );

}


/* =========================================================
   PLAYER BULLETS
========================================================= */

function drawBullets() {

    bullets.forEach(
        bullet => {

            ctx.fillStyle =
                "#ffffff";


            ctx.shadowColor =
                "#ffffff";

            ctx.shadowBlur = 10;


            ctx.fillRect(
                bullet.x,
                bullet.y,
                bullet.width,
                bullet.height
            );


            ctx.shadowBlur = 0;

        }
    );

}


/* =========================================================
   ENEMY BULLETS
========================================================= */

function drawEnemyBullets() {

    enemyBullets.forEach(
        bullet => {

            ctx.fillStyle =
                "#ff4d4d";


            ctx.shadowColor =
                "#ff4d4d";

            ctx.shadowBlur = 8;


            ctx.fillRect(
                bullet.x,
                bullet.y,
                bullet.width,
                bullet.height
            );


            ctx.shadowBlur = 0;

        }
    );

}


/* =========================================================
   PARTICLES DRAW
========================================================= */

function drawParticles() {

    particles.forEach(
        particle => {

            const alpha =
                particle.life /
                particle.maxLife;


            ctx.fillStyle =
                `rgba(156,255,87,${alpha})`;


            ctx.fillRect(
                particle.x,
                particle.y,
                particle.size,
                particle.size
            );

        }
    );

}


/* =========================================================
   WAVE MESSAGE DRAW
========================================================= */

function drawWaveMessage() {

    if (
        waveMessageTimer <= 0
    ) {

        return;

    }


    const progress =
        waveMessageTimer /
        waveMessageMaxTime;


    let alpha =
        Math.min(
            1,
            progress * 2
        );


    if (
        progress < 0.25
    ) {

        alpha =
            progress * 4;

    }


    ctx.save();


    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.font =
        "bold 34px Courier New";


    ctx.fillStyle =
        `rgba(156,255,87,${alpha})`;


    ctx.shadowColor =
        "#9cff57";

    ctx.shadowBlur =
        20;


    ctx.fillText(
        waveMessage,
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2
    );


    ctx.restore();

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    if (
        !gameRunning
    ) {

        return;

    }


    gameRunning =
        false;


    cancelAnimationFrame(
        animationId
    );


    keys.left = false;

    keys.right = false;

    keys.fire = false;


    updateBestScore();


    soundGameOver();


    gameOverText.textContent =
        `FINAL SCORE: ${score.toLocaleString("tr-TR")}`;


    gameOverOverlay.classList.remove(
        "hidden"
    );


    saveScore();

}


/* =========================================================
   SUPABASE LEADERBOARD
========================================================= */

async function saveScore() {

    try {

        const {

            data: {
                user
            },

            error: userError

        } =
            await supabaseClient.auth.getUser();


        /*
            Kullanıcı giriş yapmamışsa
            skor leaderboard'a gönderilmiyor.
        */

        if (
            userError ||
            !user
        ) {

            console.log(
                "Kullanıcı giriş yapmamış. Skor kaydedilmedi."
            );

            return;

        }


        if (
            score <= 0
        ) {

            return;

        }


        const {
            error
        } =
            await supabaseClient
                .from("scores")
                .insert({

                    user_id:
                        user.id,

                    score:
                        score,

                    game:
                        "space-invaders"

                });


        if (error) {

            console.error(
                "Space Invaders skor kayıt hatası:",
                error
            );

            return;

        }


        console.log(
            "Space Invaders skoru leaderboard'a kaydedildi:",
            score
        );

    }

    catch (error) {

        console.error(
            "Supabase skor kayıt hatası:",
            error
        );

    }

}


/* =========================================================
   BUTTONS
========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        function () {

            initAudio();

            startGame();

        }
    );

}


if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        function () {

            initAudio();

            restartGame();

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

loadBestScore();

createStars();

player =
    createPlayer();

createEnemies();

draw();


/* =========================================================
   READY
========================================================= */

console.log(
    "Doğu Games - Space Invaders V2 hazır! 👾"
);

console.log(
    "Features: Sound Effects + Waves + Supabase Leaderboard"
);