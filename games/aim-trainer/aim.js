// ============================================================
// DOĞU GAMES - AIM TRAINER
// ============================================================

// ============================================================
// ELEMENTS
// ============================================================

const game = document.getElementById("aim-game");
const target = document.getElementById("target");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-btn");

const hitsElement = document.getElementById("hits");
const missesElement = document.getElementById("misses");
const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");


// ============================================================
// SES DOSYALARI
// ============================================================

// pistol.wav ve miss.wav:
// games/
// ├── sounds/
// │   ├── pistol.wav
// │   └── miss.wav
// │
// └── aim-trainer/
//     ├── aim.html
//     └── aim.js
//
// aim-trainer ve sounds, games klasörünün altında KARDEŞ klasörler.
// Yani aim.js'ten sadece BİR üst dizine (games/) çıkıp oradan
// sounds/ klasörüne girmek yeterli.
//
// aim.js -> ../sounds/pistol.wav
// aim.js -> ../sounds/miss.wav
// ============================================================

const pistolSoundURL =
    new URL(
        "../sounds/pistol.wav",
        document.currentScript.src
    ).href;

const missSoundURL =
    new URL(
        "../sounds/miss.wav",
        document.currentScript.src
    ).href;


// ============================================================
// PISTOL SESİNİ ÇAL
// ============================================================

function playPistolSound() {

    const sound =
        new Audio(pistolSoundURL);

    sound.volume = 0.8;

    sound.currentTime = 0;

    sound.play().catch(function (error) {

        console.error(
            "pistol.wav oynatılamadı:",
            error
        );

    });

}


// ============================================================
// MISS SESİNİ ÇAL
// ============================================================

function playMissSound() {

    const sound =
        new Audio(missSoundURL);

    sound.volume = 0.8;

    sound.currentTime = 0;

    sound.play().catch(function (error) {

        console.error(
            "miss.wav oynatılamadı:",
            error
        );

    });

}


// ============================================================
// GAME SETTINGS
// ============================================================

const GAME_DURATION = 30;

const START_TARGET_SIZE = 70;

const MIN_TARGET_SIZE = 30;


// ============================================================
// GAME VARIABLES
// ============================================================

let timeLeft = GAME_DURATION;

let hits = 0;

let misses = 0;

let score = 0;

let combo = 0;

let maxCombo = 0;

let gameRunning = false;

let gameTimer = null;

let targetSpawnTime = 0;

let reactionTimes = [];


// ============================================================
// BEST SCORE
// ============================================================

let bestScore =
    Number(
        localStorage.getItem("aimBestScore")
    ) || 0;


// ============================================================
// COMBO DISPLAY
// ============================================================

const comboDisplay =
    document.createElement("div");

comboDisplay.style.position = "absolute";

comboDisplay.style.left = "50%";

comboDisplay.style.top = "25px";

comboDisplay.style.transform =
    "translateX(-50%)";

comboDisplay.style.color = "#39ff14";

comboDisplay.style.fontFamily =
    "'Courier New', monospace";

comboDisplay.style.fontSize = "18px";

comboDisplay.style.fontWeight = "bold";

comboDisplay.style.letterSpacing = "3px";

comboDisplay.style.textShadow =
    "0 0 8px #39ff14";

comboDisplay.style.pointerEvents = "none";

comboDisplay.style.zIndex = "40";

comboDisplay.style.display = "none";

game.appendChild(comboDisplay);


// ============================================================
// START GAME
// ============================================================

function startGame() {

    clearInterval(gameTimer);

    timeLeft = GAME_DURATION;

    hits = 0;

    misses = 0;

    score = 0;

    combo = 0;

    maxCombo = 0;

    reactionTimes = [];

    gameRunning = true;


    // --------------------------------------------------------
    // SESLERİ ÖN YÜKLE
    // --------------------------------------------------------

    const preloadPistol =
        new Audio(pistolSoundURL);

    preloadPistol.preload = "auto";

    preloadPistol.load();

    const preloadMiss =
        new Audio(missSoundURL);

    preloadMiss.preload = "auto";

    preloadMiss.load();


    // --------------------------------------------------------
    // UI
    // --------------------------------------------------------

    hitsElement.textContent = hits;

    missesElement.textContent = misses;

    scoreElement.textContent = score;

    timeElement.textContent = timeLeft;


    // --------------------------------------------------------
    // START SCREEN
    // --------------------------------------------------------

    startScreen.style.display = "none";

    comboDisplay.style.display = "block";

    updateComboDisplay();


    // --------------------------------------------------------
    // TARGET
    // --------------------------------------------------------

    target.style.display = "block";

    target.style.width =
        START_TARGET_SIZE + "px";

    target.style.height =
        START_TARGET_SIZE + "px";


    moveTarget();


    // --------------------------------------------------------
    // TIMER
    // --------------------------------------------------------

    gameTimer =
        setInterval(
            updateTimer,
            1000
        );

}


// ============================================================
// TIMER
// ============================================================

function updateTimer() {

    timeLeft--;

    timeElement.textContent =
        timeLeft;


    if (timeLeft <= 0) {

        endGame();

    }

}


// ============================================================
// MOVE TARGET
// ============================================================

function moveTarget() {

    const gameWidth =
        game.clientWidth;

    const gameHeight =
        game.clientHeight;

    const size =
        target.offsetWidth;

    const padding =
        size / 2 + 10;


    const minX =
        padding;

    const maxX =
        gameWidth -
        padding;


    const minY =
        size / 2 + 10;

    const maxY =
        gameHeight -
        size / 2 -
        10;


    const x =
        Math.random() *
        (
            maxX -
            minX
        ) +
        minX;


    const y =
        Math.random() *
        (
            maxY -
            minY
        ) +
        minY;


    target.style.left =
        x + "px";

    target.style.top =
        y + "px";


    targetSpawnTime =
        performance.now();

}


// ============================================================
// TARGET SIZE
// ============================================================

function updateTargetSize() {

    const progress =
        Math.min(
            hits / 20,
            1
        );


    const size =
        START_TARGET_SIZE -
        (
            (
                START_TARGET_SIZE -
                MIN_TARGET_SIZE
            )
            *
            progress
        );


    target.style.width =
        size + "px";

    target.style.height =
        size + "px";

}


// ============================================================
// COMBO
// ============================================================

function updateComboDisplay() {

    if (combo < 2) {

        comboDisplay.textContent = "";

        return;

    }


    comboDisplay.textContent =
        `COMBO x${combo}`;

}


// ============================================================
// TARGET HIT
// ============================================================

target.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        event.stopPropagation();


        if (!gameRunning) {

            return;

        }


        // ====================================================
        // GERÇEK PISTOL.WAV
        // ====================================================

        playPistolSound();


        // ====================================================
        // REACTION TIME
        // ====================================================

        const reactionTime =
            performance.now() -
            targetSpawnTime;


        reactionTimes.push(
            reactionTime
        );


        // ====================================================
        // HIT
        // ====================================================

        hits++;

        combo++;


        if (combo > maxCombo) {

            maxCombo = combo;

        }


        // ====================================================
        // SCORE
        // ====================================================

        const comboMultiplier =
            Math.min(
                combo,
                10
            );


        const speedBonus =
            Math.max(
                0,
                Math.floor(
                    (
                        600 -
                        reactionTime
                    ) / 50
                )
            );


        const sizeBonus =
            Math.max(
                0,
                Math.floor(
                    (
                        START_TARGET_SIZE -
                        target.offsetWidth
                    ) * 2
                )
            );


        const points =
            (
                10 *
                comboMultiplier
            ) +
            speedBonus +
            sizeBonus;


        score += points;


        // ====================================================
        // UI
        // ====================================================

        hitsElement.textContent =
            hits;

        scoreElement.textContent =
            score;


        updateComboDisplay();


        // ====================================================
        // TARGET ANIMATION
        // ====================================================

        target.classList.remove("hit");

        void target.offsetWidth;

        target.classList.add("hit");


        // ====================================================
        // EXPLOSION
        // ====================================================

        createExplosion(
            target.offsetLeft,
            target.offsetTop,
            target.offsetWidth
        );


        // ====================================================
        // SCORE POPUP
        // ====================================================

        createScorePopup(
            target.offsetLeft,
            target.offsetTop,
            points
        );


        // ====================================================
        // NEXT TARGET
        // ====================================================

        updateTargetSize();

        moveTarget();

    }
);


// ============================================================
// MISS
// ============================================================

game.addEventListener(
    "pointerdown",
    function (event) {

        if (!gameRunning) {

            return;

        }


        if (
            target.contains(event.target)
        ) {

            return;

        }


        // ====================================================
        // GERÇEK MISS.WAV
        // ====================================================

        playMissSound();


        misses++;

        combo = 0;


        score =
            Math.max(
                0,
                score - 50
            );


        missesElement.textContent =
            misses;

        scoreElement.textContent =
            score;


        updateComboDisplay();


        createMissPopup(
            event.offsetX,
            event.offsetY
        );

    }
);


// ============================================================
// MISS POPUP
// ============================================================

function createMissPopup(x, y) {

    const popup =
        document.createElement("div");

    popup.textContent = "-50";

    popup.style.position = "absolute";

    popup.style.left =
        x + "px";

    popup.style.top =
        y + "px";

    popup.style.transform =
        "translate(-50%, -50%)";

    popup.style.color =
        "#ff1744";

    popup.style.fontFamily =
        "'Courier New', monospace";

    popup.style.fontSize =
        "22px";

    popup.style.fontWeight =
        "bold";

    popup.style.letterSpacing =
        "2px";

    popup.style.textShadow =
        "0 0 8px rgba(255, 23, 68, 0.8)";

    popup.style.pointerEvents =
        "none";

    popup.style.zIndex =
        "45";

    game.appendChild(popup);


    popup.animate(
        [
            {
                transform:
                    "translate(-50%, -50%) scale(1)",
                opacity: 1
            },

            {
                transform:
                    "translate(-50%, -100%) scale(1.15)",
                opacity: 0
            }
        ],
        {
            duration: 600,
            easing: "ease-out"
        }
    );


    setTimeout(
        function () {

            popup.remove();

        },
        650
    );

}


// ============================================================
// EXPLOSION EFFECT
// ============================================================

function createExplosion(
    x,
    y,
    size
) {

    const count = 12;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement("div");


        particle.style.position =
            "absolute";

        particle.style.width =
            "4px";

        particle.style.height =
            "4px";


        particle.style.background =
            i % 2 === 0
                ? "#39ff14"
                : "#ff1744";


        particle.style.left =
            (
                x +
                size / 2
            ) + "px";


        particle.style.top =
            (
                y +
                size / 2
            ) + "px";


        particle.style.pointerEvents =
            "none";

        particle.style.zIndex =
            "30";


        game.appendChild(
            particle
        );


        const angle =
            Math.PI *
            2 *
            (i / count);


        const distance =
            25 +
            Math.random() * 25;


        const endX =
            Math.cos(angle) *
            distance;


        const endY =
            Math.sin(angle) *
            distance;


        particle.animate(
            [
                {
                    transform:
                        "translate(0, 0)",
                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            ${endX}px,
                            ${endY}px
                        )`,
                    opacity: 0
                }
            ],
            {
                duration: 300,
                easing: "ease-out"
            }
        );


        setTimeout(
            function () {

                particle.remove();

            },
            320
        );

    }

}


// ============================================================
// SCORE POPUP
// ============================================================

function createScorePopup(
    x,
    y,
    points
) {

    const popup =
        document.createElement("div");


    popup.textContent =
        `+${points}`;


    popup.style.position =
        "absolute";


    popup.style.left =
        x + "px";


    popup.style.top =
        y + "px";


    popup.style.transform =
        "translate(-50%, -50%)";


    popup.style.color =
        "#f5f5dc";


    popup.style.fontFamily =
        "'Courier New', monospace";


    popup.style.fontWeight =
        "bold";


    popup.style.fontSize =
        "14px";


    popup.style.pointerEvents =
        "none";


    popup.style.zIndex =
        "40";


    game.appendChild(
        popup
    );


    popup.animate(
        [
            {
                transform:
                    "translate(-50%, -50%)",
                opacity: 1
            },

            {
                transform:
                    "translate(-50%, -100px)",
                opacity: 0
            }
        ],
        {
            duration: 650,
            easing: "ease-out"
        }
    );


    setTimeout(
        function () {

            popup.remove();

        },
        700
    );

}


// ============================================================
// END GAME
// ============================================================

function endGame() {

    gameRunning = false;


    clearInterval(
        gameTimer
    );


    target.style.display =
        "none";


    comboDisplay.style.display =
        "none";


    const totalClicks =
        hits +
        misses;


    let accuracy = 0;


    if (totalClicks > 0) {

        accuracy =
            Math.round(
                (
                    hits /
                    totalClicks
                ) * 100
            );

    }


    let averageReaction = 0;


    if (
        reactionTimes.length > 0
    ) {

        const totalReaction =
            reactionTimes.reduce(
                function (
                    total,
                    value
                ) {

                    return (
                        total +
                        value
                    );

                },
                0
            );


        averageReaction =
            Math.round(
                totalReaction /
                reactionTimes.length
            );

    }


    const isNewBest =
        score >
        bestScore;


    if (isNewBest) {

        bestScore =
            score;


        localStorage.setItem(
            "aimBestScore",
            bestScore
        );

    }


    startScreen.style.display =
        "flex";


    const title =
        startScreen.querySelector("h2");


    const description =
        startScreen.querySelector("p");


    title.textContent =
        isNewBest
            ? "NEW BEST!"
            : "GAME OVER";


    description.innerHTML = `

        SCORE:
        <strong>${score}</strong>

        <br>

        BEST:
        <strong>${bestScore}</strong>

        <br>

        HITS:
        <strong>${hits}</strong>

        <br>

        MISSES:
        <strong>${misses}</strong>

        <br>

        ACCURACY:
        <strong>${accuracy}%</strong>

        <br>

        REACTION:
        <strong>${averageReaction}ms</strong>

        <br>

        MAX COMBO:
        <strong>x${maxCombo}</strong>

    `;


    startButton.textContent =
        "PLAY AGAIN";

}


// ============================================================
// START BUTTON
// ============================================================

startButton.addEventListener(
    "click",
    function () {

        startScreen.querySelector(
            "h2"
        ).textContent =
            "AIM TRAINER";


        startScreen.querySelector(
            "p"
        ).textContent =
            "HIT AS MANY TARGETS AS POSSIBLE";


        startButton.textContent =
            "START GAME";


        startGame();

    }
);