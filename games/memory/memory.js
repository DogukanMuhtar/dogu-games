// ============================================================
// DOĞU GAMES - MEMORY
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const board =
    document.getElementById(
        "memory-board"
    );

const movesElement =
    document.getElementById(
        "moves"
    );

const timerElement =
    document.getElementById(
        "timer"
    );

const bestScoreElement =
    document.getElementById(
        "best-score"
    );

const restartButton =
    document.getElementById(
        "restart-btn"
    );

const winScreen =
    document.getElementById(
        "win-screen"
    );

const finalMoves =
    document.getElementById(
        "final-moves"
    );

const finalTime =
    document.getElementById(
        "final-time"
    );

const finalBest =
    document.getElementById(
        "final-best"
    );

const winRestart =
    document.getElementById(
        "win-restart"
    );


// ============================================================
// GAME SETTINGS
// ============================================================

const symbols = [

    "alien",

    "rocket",

    "bomb",

    "ufo",

    "star",

    "lightning"

];


let cards = [];

let firstCard = null;

let secondCard = null;

let lockBoard = false;

let moves = 0;

let matchedPairs = 0;

let seconds = 0;

let timer = null;

let gameStarted = false;


// ============================================================
// BEST SCORE
// ============================================================

let bestScore =
    Number(
        localStorage.getItem(
            "memoryBestScore"
        )
    ) || null;


function updateBestScoreDisplay() {

    if (
        bestScore === null
    ) {

        bestScoreElement.textContent =
            "--";

        return;

    }


    bestScoreElement.textContent =
        bestScore;

}


updateBestScoreDisplay();


// ============================================================
// START GAME
// ============================================================

function startGame() {

    clearInterval(timer);


    cards = [];

    firstCard = null;

    secondCard = null;

    lockBoard = false;

    moves = 0;

    matchedPairs = 0;

    seconds = 0;

    gameStarted = false;


    movesElement.textContent =
        "0";

    timerElement.textContent =
        "00:00";


    winScreen.style.display =
        "none";


    board.innerHTML =
        "";


    cards = [
        ...symbols,
        ...symbols
    ];


    shuffleCards();

    createCards();

}


// ============================================================
// SHUFFLE
// ============================================================

function shuffleCards() {

    for (
        let i = cards.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            cards[i],
            cards[randomIndex]
        ] = [
            cards[randomIndex],
            cards[i]
        ];

    }

}


// ============================================================
// CREATE CARDS
// ============================================================

function createCards() {

    cards.forEach(
        (symbol, index) => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "memory-card";


            card.dataset.symbol =
                symbol;


            card.dataset.index =
                index;


            card.innerHTML = `

                <span
                    class="card-front"
                ></span>

                <span
                    class="card-back"
                >

                    <canvas
                        class="pixel-icon"
                        width="16"
                        height="16"
                    ></canvas>

                </span>

            `;


            board.appendChild(
                card
            );


            const canvas =
                card.querySelector(
                    ".pixel-icon"
                );


            drawPixelIcon(
                canvas,
                symbol
            );


            card.addEventListener(
                "click",
                () => {

                    flipCard(card);

                }
            );

        }
    );

}


// ============================================================
// FLIP CARD
// ============================================================

function flipCard(card) {

    if (lockBoard) {
        return;
    }


    if (
        card === firstCard
    ) {

        return;

    }


    if (
        card.classList.contains(
            "matched"
        )
    ) {

        return;

    }


    if (!gameStarted) {

        gameStarted = true;

        startTimer();

    }


    card.classList.add(
        "flipped"
    );


    if (!firstCard) {

        firstCard = card;

        return;

    }


    secondCard = card;


    moves++;


    movesElement.textContent =
        moves;


    checkMatch();

}


// ============================================================
// CHECK MATCH
// ============================================================

function checkMatch() {

    const isMatch =

        firstCard.dataset.symbol ===
        secondCard.dataset.symbol;


    if (isMatch) {

        disableCards();

    }
    else {

        unflipCards();

    }

}


// ============================================================
// MATCH
// ============================================================

function disableCards() {

    firstCard.classList.add(
        "matched"
    );

    secondCard.classList.add(
        "matched"
    );


    // ============================
    // MATCH SOUND
    // ============================

    playMatchSound();


    matchedPairs++;


    resetTurn();


    if (
        matchedPairs ===
        symbols.length
    ) {

        gameWon();

    }

}


// ============================================================
// WRONG MATCH
// ============================================================

function unflipCards() {

    lockBoard = true;


    setTimeout(
        () => {

            firstCard.classList.remove(
                "flipped"
            );

            secondCard.classList.remove(
                "flipped"
            );


            resetTurn();

        },
        700
    );

}


// ============================================================
// RESET TURN
// ============================================================

function resetTurn() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

}


// ============================================================
// TIMER
// ============================================================

function startTimer() {

    clearInterval(timer);


    timer =
        setInterval(
            () => {

                seconds++;

                updateTimer();

            },
            1000
        );

}


// ============================================================
// UPDATE TIMER
// ============================================================

function updateTimer() {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    timerElement.textContent =

        String(
            minutes
        ).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        );

}


// ============================================================
// GAME WON
// ============================================================

function gameWon() {

    clearInterval(timer);

    gameStarted = false;


    // ============================
    // BEST SCORE
    // ============================

    if (
        bestScore === null ||
        moves < bestScore
    ) {

        bestScore =
            moves;


        localStorage.setItem(
            "memoryBestScore",
            bestScore
        );

    }


    updateBestScoreDisplay();


    finalMoves.textContent =
        moves;


    finalTime.textContent =
        timerElement.textContent;


    finalBest.textContent =
        bestScore;


    setTimeout(
        () => {

            winScreen.style.display =
                "flex";

        },
        400
    );

}


// ============================================================
// MATCH SOUND
// ============================================================

function playMatchSound() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {
        return;
    }


    const audio =
        new AudioContext();


    const oscillator =
        audio.createOscillator();


    const gain =
        audio.createGain();


    oscillator.type =
        "square";


    oscillator.frequency.setValueAtTime(
        520,
        audio.currentTime
    );


    oscillator.frequency.exponentialRampToValueAtTime(
        760,
        audio.currentTime + 0.08
    );


    gain.gain.setValueAtTime(
        0.06,
        audio.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.12
    );


    oscillator.connect(
        gain
    );


    gain.connect(
        audio.destination
    );


    oscillator.start();


    oscillator.stop(
        audio.currentTime + 0.12
    );

}


// ============================================================
// RESTART
// ============================================================

restartButton.addEventListener(
    "click",
    () => {

        startGame();

    }
);


// ============================================================
// WIN RESTART
// ============================================================

winRestart.addEventListener(
    "click",
    () => {

        startGame();

    }
);


// ============================================================
// PIXEL ART
// ============================================================

function drawPixelIcon(
    canvas,
    type
) {

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return;
    }


    ctx.imageSmoothingEnabled =
        false;


    ctx.clearRect(
        0,
        0,
        16,
        16
    );


    const patterns = {


        // ========================
        // ALIEN
        // ========================

        alien: [

            "....GGGGGG....",
            "...GGGGGGGG...",
            "..GG.GGGG.GG..",
            "..GG.GGGG.GG..",
            "..GGGGGGGGGG..",
            "...GGGGGGGG...",
            "...GG.GGGG.GG.",
            "..GGG.GGGG.GGG",
            "..GGGGGGGGGGGG",
            "...GGGGGGGGGG.",
            "....GGGGGGGG..",
            ".....GGGGGG...",
            "......GGGG....",
            ".....G....G...",
            "....G......G..",
            "................"

        ],


        // ========================
        // ROCKET
        // ========================

        rocket: [

            ".......Y.......",
            "......YYY......",
            ".....YYYYY.....",
            "....YYYYYYY....",
            "...YYYYYYYYY...",
            "...YY..Y..YY...",
            "...YYYYYYYYY...",
            "....YYYYYYY....",
            ".....YYYYY.....",
            ".....YYYYY.....",
            "....RRRRRRR....",
            "...RRRRRRRRR...",
            "...RRRRRRRRR...",
            "....RRRRRRR....",
            ".....RRRRR.....",
            "................"

        ],


        // ========================
        // BOMB
        // ========================

        bomb: [

            "......OO........",
            ".....OOOO.......",
            "......OO........",
            "......GG........",
            "....GGGGGG......",
            "...GGGGGGGG.....",
            "..GGGGGGGGGG....",
            "..GGGGGGGGGG....",
            ".GGGGGGGGGGGG...",
            ".GGGGGGGGGGGG...",
            ".GGGGGGGGGGGG...",
            "..GGGGGGGGGG....",
            "..GGGGGGGGGG....",
            "...GGGGGGGG.....",
            "....GGGGGG......",
            "................"

        ],


        // ========================
        // UFO
        // ========================

        ufo: [

            "......BBBB......",
            "....BBBBBBBB....",
            "...BBBBBBBBBB...",
            "..BBBBBBBBBBBB..",
            ".BBBBBBBBBBBBBB.",
            "BBBBBBBBBBBBBBBB",
            "..BBBBBBBBBBBB..",
            "...BB..BB..BB...",
            "....BB..BB..BB..",
            ".....BBBBBBBB...",
            "......BBBBBB....",
            ".......BBBB.....",
            "................",
            "................",
            "................",
            "................"

        ],


        // ========================
        // STAR
        // ========================

        star: [

            ".......Y........",
            ".......Y........",
            "......YYY.......",
            "YYYYYYYYYYYYYYY.",
            ".YYYYYYYYYYYYY..",
            "..YYYYYYYYYYY...",
            "...YYYYYYYYY....",
            "....YYYYYYY.....",
            "....YYYYYYY.....",
            "...YYYYYYYYY....",
            "..YYY.....YYY...",
            ".YYY.......YYY..",
            "YYY.........YYY.",
            "Y.............Y.",
            "................",
            "................"

        ],


        // ========================
        // LIGHTNING
        // ========================

        lightning: [

            "........YY......",
            ".......YYY......",
            "......YYYY......",
            ".....YYYYY......",
            "....YYYYY.......",
            "...YYYYYY.......",
            "..YYYYYYYY......",
            ".....YYYYYY.....",
            "....YYYYYY......",
            "...YYYYY........",
            "..YYYYY.........",
            ".YYYYY..........",
            "YYYY............",
            "................",
            "................",
            "................"

        ]

    };


    const pattern =
        patterns[type];


    if (!pattern) {
        return;
    }


    const colors = {

        G: "#39ff14",

        R: "#ff1744",

        Y: "#ffe600",

        O: "#ff8c00",

        B: "#00bfff"

    };


    pattern.forEach(
        (row, y) => {

            for (
                let x = 0;
                x < row.length;
                x++
            ) {

                const pixel =
                    row[x];


                if (
                    colors[pixel]
                ) {

                    ctx.fillStyle =
                        colors[pixel];


                    ctx.fillRect(
                        x,
                        y,
                        1,
                        1
                    );

                }

            }

        }
    );

}


// ============================================================
// START
// ============================================================

startGame();