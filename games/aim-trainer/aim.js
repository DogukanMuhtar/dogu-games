// ============================================================
// DOĞU GAMES - AIM TRAINER
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const game =
    document.getElementById("aim-game");

const target =
    document.getElementById("target");

const startScreen =
    document.getElementById("start-screen");

const startButton =
    document.getElementById("start-btn");

const hitsElement =
    document.getElementById("hits");

const missesElement =
    document.getElementById("misses");

const timeElement =
    document.getElementById("time");

const scoreElement =
    document.getElementById("score");


// ============================================================
// SOUNDS
// ============================================================

const pistolSound =
    new Audio("sounds/pistol.wav");

pistolSound.preload =
    "auto";

pistolSound.volume =
    0.45;


// Miss sesi
// Eğer senin dosyanın adı farklıysa sadece
// aşağıdaki dosya adını değiştir.

const missSound =
    new Audio("sounds/miss.wav");

missSound.preload =
    "auto";

missSound.volume =
    0.40;


// ============================================================
// GAME SETTINGS
// ============================================================

const GAME_DURATION =
    30;

const START_TARGET_SIZE =
    70;

const MIN_TARGET_SIZE =
    30;


// ============================================================
// GAME VARIABLES
// ============================================================

let timeLeft =
    GAME_DURATION;

let hits =
    0;

let misses =
    0;

let score =
    0;

let combo =
    0;

let maxCombo =
    0;

let gameRunning =
    false;

let gameTimer =
    null;

let targetSpawnTime =
    0;

let reactionTimes =
    [];


// ============================================================
// BEST SCORE
// ============================================================

let bestScore =
    Number(
        localStorage.getItem(
            "aimBestScore"
        )
    ) || 0;


// ============================================================
// COMBO DISPLAY
// ============================================================

const comboDisplay =
    document.createElement(
        "div"
    );


comboDisplay.style.position =
    "absolute";

comboDisplay.style.left =
    "50%";

comboDisplay.style.top =
    "25px";

comboDisplay.style.transform =
    "translateX(-50%)";

comboDisplay.style.color =
    "#39ff14";

comboDisplay.style.fontFamily =
    "'Courier New', monospace";

comboDisplay.style.fontSize =
    "18px";

comboDisplay.style.fontWeight =
    "bold";

comboDisplay.style.letterSpacing =
    "3px";

comboDisplay.style.textShadow =
    "0 0 8px #39ff14";

comboDisplay.style.pointerEvents =
    "none";

comboDisplay.style.zIndex =
    "40";

comboDisplay.style.display =
    "none";


game.appendChild(
    comboDisplay
);


// ============================================================
// START GAME
// ============================================================

function startGame() {

    clearInterval(
        gameTimer
    );


    timeLeft =
        GAME_DURATION;

    hits =
        0;

    misses =
        0;

    score =
        0;

    combo =
        0;

    maxCombo =
        0;

    reactionTimes =
        [];


    gameRunning =
        true;


    // ============================
    // RESET UI
    // ============================

    hitsElement.textContent =
        hits;

    missesElement.textContent =
        misses;

    scoreElement.textContent =
        score;

    timeElement.textContent =
        timeLeft;


    // ============================
    // SHOW GAME
    // ============================

    startScreen.style.display =
        "none";

    comboDisplay.style.display =
        "block";


    updateComboDisplay();


    // ============================
    // RESET TARGET
    // ============================

    target.style.display =
        "block";

    target.style.width =
        START_TARGET_SIZE + "px";

    target.style.height =
        START_TARGET_SIZE + "px";


    // ============================
    // FIRST TARGET
    // ============================

    moveTarget();


    // ============================
    // TIMER
    // ============================

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


    if (
        timeLeft <= 0
    ) {

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
        gameWidth - padding;


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
        )
        +
        minX;


    const y =
        Math.random() *
        (
            maxY -
            minY
        )
        +
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
        START_TARGET_SIZE
        -
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
// COMBO DISPLAY
// ============================================================

function updateComboDisplay() {

    if (
        combo < 2
    ) {

        comboDisplay.textContent =
            "";

        return;

    }


    comboDisplay.textContent =
        `COMBO x${combo}`;

}


// ============================================================
// HIT SOUND
// ============================================================

function playHitSound() {

    pistolSound.pause();

    pistolSound.currentTime =
        0;

    pistolSound.volume =
        0.45;


    pistolSound.play()
        .catch(
            error => {

                console.log(
                    "Silah sesi oynatılamadı:",
                    error
                );

            }
        );

}


// ============================================================
// MISS SOUND
// ============================================================

function playMissSound() {

    missSound.pause();

    missSound.currentTime =
        0;

    missSound.volume =
        0.40;


    missSound.play()
        .catch(
            error => {

                console.log(
                    "Miss sesi oynatılamadı:",
                    error
                );

            }
        );

}


// ============================================================
// HIT TARGET
// ============================================================

target.addEventListener(
    "pointerdown",
    function(event) {

        event.stopPropagation();


        if (
            !gameRunning
        ) {

            return;

        }


        // ============================
        // REACTION TIME
        // ============================

        const reactionTime =
            performance.now()
            -
            targetSpawnTime;


        reactionTimes.push(
            reactionTime
        );


        // ============================
        // HIT
        // ============================

        hits++;

        combo++;


        if (
            combo >
            maxCombo
        ) {

            maxCombo =
                combo;

        }


        // ============================
        // SCORE
        // ============================

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
                    )
                    /
                    50
                )
            );


        const sizeBonus =
            Math.max(
                0,
                Math.floor(
                    (
                        START_TARGET_SIZE -
                        target.offsetWidth
                    )
                    *
                    2
                )
            );


        const points =
            (
                10 *
                comboMultiplier
            )
            +
            speedBonus
            +
            sizeBonus;


        score +=
            points;


        // ============================
        // UI
        // ============================

        hitsElement.textContent =
            hits;

        scoreElement.textContent =
            score;


        updateComboDisplay();


        // ============================
        // TARGET HIT ANIMATION
        // ============================

        target.classList.remove(
            "hit"
        );


        void target.offsetWidth;


        target.classList.add(
            "hit"
        );


        // ============================
        // EXPLOSION
        // ============================

        createExplosion(
            target.offsetLeft,
            target.offsetTop,
            target.offsetWidth
        );


        // ============================
        // SCORE POPUP
        // ============================

        createScorePopup(
            target.offsetLeft,
            target.offsetTop,
            points
        );


        // ============================
        // GUN SOUND
        // ============================

        playHitSound();


        // ============================
        // NEXT TARGET
        // ============================

        updateTargetSize();

        moveTarget();

    }
);


// ============================================================
// MISS
// ============================================================

game.addEventListener(
    "pointerdown",
    function(event) {

        if (
            !gameRunning
        ) {

            return;

        }


        // Hedefin kendisine tıklandıysa
        // miss olarak sayma.

        if (
            target.contains(
                event.target
            )
        ) {

            return;

        }


        // ============================
        // MISS COUNT
        // ============================

        misses++;


        // ============================
        // RESET COMBO
        // ============================

        combo = 0;


        // ============================
        // SCORE PENALTY
        // ============================

        score =
            Math.max(
                0,
                score - 50
            );


        // ============================
        // UPDATE UI
        // ============================

        missesElement.textContent =
            misses;

        scoreElement.textContent =
            score;


        updateComboDisplay();


        // ============================
        // -50 POPUP
        // ============================

        createMissPopup(
        event.offsetX,
        event.offsetY
        );


        // ============================
        // MISS SOUND
        // ============================

        playMissSound();

    }
);


// ============================================================
// MISS POPUP
// ============================================================

function createMissPopup(x, y) {

    const popup =
        document.createElement("div");


    popup.textContent =
        "-50";


    popup.style.position =
        "absolute";


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


    game.appendChild(
        popup
    );


    popup.animate(
        [
            {
                transform:
                    "translate(-50%, -50%) scale(1)",

                opacity:
                    1
            },

            {
                transform:
                    "translate(-50%, -100%) scale(1.15)",

                opacity:
                    0
            }
        ],
        {
            duration:
                600,

            easing:
                "ease-out"
        }
    );


    setTimeout(
        () => {

            popup.remove();

        },
        650
    );

}


// ============================================================
// HIT EXPLOSION
// ============================================================

function createExplosion(
    x,
    y,
    size
) {

    const count =
        12;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );


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
            )
            + "px";


        particle.style.top =
            (
                y +
                size / 2
            )
            + "px";


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
            (
                i / count
            );


        const distance =
            25 +
            Math.random() *
            25;


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

                    opacity:
                        1
                },

                {
                    transform:
                        `translate(
                            ${endX}px,
                            ${endY}px
                        )`,

                    opacity:
                        0
                }
            ],
            {
                duration:
                    300,

                easing:
                    "ease-out"
            }
        );


        setTimeout(
            () => {

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
        document.createElement(
            "div"
        );


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

                opacity:
                    1
            },

            {
                transform:
                    "translate(-50%, -100px)",

                opacity:
                    0
            }
        ],
        {
            duration:
                650,

            easing:
                "ease-out"
        }
    );


    setTimeout(
        () => {

            popup.remove();

        },
        700
    );

}


// ============================================================
// END GAME
// ============================================================

function endGame() {

    gameRunning =
        false;


    clearInterval(
        gameTimer
    );


    target.style.display =
        "none";


    comboDisplay.style.display =
        "none";


    // ============================
    // ACCURACY
    // ============================

    const totalClicks =
        hits +
        misses;


    let accuracy =
        0;


    if (
        totalClicks > 0
    ) {

        accuracy =
            Math.round(
                (
                    hits /
                    totalClicks
                )
                *
                100
            );

    }


    // ============================
    // AVERAGE REACTION
    // ============================

    let averageReaction =
        0;


    if (
        reactionTimes.length > 0
    ) {

        const totalReaction =
            reactionTimes.reduce(
                (
                    total,
                    value
                ) => {

                    return total + value;

                },
                0
            );


        averageReaction =
            Math.round(
                totalReaction /
                reactionTimes.length
            );

    }


    // ============================
    // BEST SCORE
    // ============================

    const isNewBest =
        score >
        bestScore;


    if (
        isNewBest
    ) {

        bestScore =
            score;


        localStorage.setItem(
            "aimBestScore",
            bestScore
        );

    }


    // ============================
    // GAME OVER SCREEN
    // ============================

    startScreen.style.display =
        "flex";


    startScreen.querySelector(
        "h2"
    ).textContent =
        isNewBest
            ? "NEW BEST!"
            : "GAME OVER";


    startScreen.querySelector(
        "p"
    ).innerHTML = `

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
// START / PLAY AGAIN BUTTON
// ============================================================

startButton.addEventListener(
    "click",
    function() {

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