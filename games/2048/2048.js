// ============================================================
// DOĞU GAMES
// 2048
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const startScreen =
    document.getElementById("startScreen");

const startButton =
    document.getElementById("startButton");

const gameArea =
    document.getElementById("gameArea");

const board =
    document.getElementById("board");

const scoreElement =
    document.getElementById("score");

const bestElement =
    document.getElementById("best");

const movesElement =
    document.getElementById("moves");

const mergesElement =
    document.getElementById("merges");

const newGameButton =
    document.getElementById("newGameButton");

const gameOver =
    document.getElementById("gameOver");

const gameOverText =
    document.getElementById("gameOverText");

const retryButton =
    document.getElementById("retryButton");

const winMessage =
    document.getElementById("winMessage");

const continueButton =
    document.getElementById("continueButton");


// ============================================================
// SETTINGS
// ============================================================

const SIZE = 4;

const WIN_VALUE = 2048;


// ============================================================
// GAME STATE
// ============================================================

let grid = [];

let score = 0;

let moves = 0;

let merges = 0;

let gameStarted = false;

let gameFinished = false;

let hasWon = false;


// ============================================================
// BEST SCORE
// ============================================================

let bestScore =
    Number(
        localStorage.getItem(
            "dogu2048Best"
        )
    ) || 0;


bestElement.textContent =
    bestScore;


// ============================================================
// CREATE GRID
// ============================================================

function createEmptyGrid() {

    return [

        [0, 0, 0, 0],

        [0, 0, 0, 0],

        [0, 0, 0, 0],

        [0, 0, 0, 0]

    ];

}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    grid =
        createEmptyGrid();


    score = 0;

    moves = 0;

    merges = 0;

    gameFinished = false;

    hasWon = false;

    gameStarted = true;


    gameOver.classList.remove(
        "active"
    );


    winMessage.classList.remove(
        "active"
    );


    startScreen.classList.add(
        "hidden"
    );


    gameArea.classList.add(
        "active"
    );


    addRandomTile();

    addRandomTile();


    updateStats();

    renderBoard();

}


// ============================================================
// NEW GAME
// ============================================================

function newGame() {

    startGame();

}


// ============================================================
// ADD RANDOM TILE
// ============================================================

function addRandomTile() {

    const emptyCells = [];


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                grid[row][col] === 0
            ) {

                emptyCells.push({
                    row,
                    col
                });

            }

        }

    }


    if (
        emptyCells.length === 0
    ) {

        return;

    }


    const cell =
        emptyCells[
            Math.floor(
                Math.random() *
                emptyCells.length
            )
        ];


    grid[cell.row][cell.col] =
        Math.random() < 0.9
            ? 2
            : 4;

}


// ============================================================
// RENDER BOARD
// ============================================================

function renderBoard() {

    board.innerHTML = "";


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const tile =
                document.createElement(
                    "div"
                );


            tile.className =
                "tile";


            const value =
                grid[row][col];


            if (
                value !== 0
            ) {

                tile.textContent =
                    value;

                tile.dataset.value =
                    value;

            }


            board.appendChild(
                tile
            );

        }

    }

}


// ============================================================
// MOVE
// ============================================================

function move(direction) {

    if (
        !gameStarted ||
        gameFinished
    ) {

        return;

    }


    const before =
        JSON.stringify(
            grid
        );


    if (
        direction === "left"
    ) {

        moveLeft();

    }

    else if (
        direction === "right"
    ) {

        moveRight();

    }

    else if (
        direction === "up"
    ) {

        moveUp();

    }

    else if (
        direction === "down"
    ) {

        moveDown();

    }


    const after =
        JSON.stringify(
            grid
        );


    // Hareket olmadıysa
    // hamle sayısını artırma.

    if (
        before === after
    ) {

        return;

    }


    moves++;


    addRandomTile();


    updateStats();

    renderBoard();


    checkWin();

    checkGameOver();

}


// ============================================================
// LEFT
// ============================================================

function moveLeft() {

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        let line =
            grid[row].filter(
                value =>
                    value !== 0
            );


        line =
            mergeLine(
                line
            );


        while (
            line.length < SIZE
        ) {

            line.push(0);

        }


        grid[row] =
            line;

    }

}


// ============================================================
// RIGHT
// ============================================================

function moveRight() {

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        let line =
            grid[row]
                .filter(
                    value =>
                        value !== 0
                )
                .reverse();


        line =
            mergeLine(
                line
            );


        while (
            line.length < SIZE
        ) {

            line.push(0);

        }


        grid[row] =
            line.reverse();

    }

}


// ============================================================
// UP
// ============================================================

function moveUp() {

    for (
        let col = 0;
        col < SIZE;
        col++
    ) {

        let line = [];


        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            if (
                grid[row][col] !== 0
            ) {

                line.push(
                    grid[row][col]
                );

            }

        }


        line =
            mergeLine(
                line
            );


        while (
            line.length < SIZE
        ) {

            line.push(0);

        }


        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            grid[row][col] =
                line[row];

        }

    }

}


// ============================================================
// DOWN
// ============================================================

function moveDown() {

    for (
        let col = 0;
        col < SIZE;
        col++
    ) {

        let line = [];


        for (
            let row = SIZE - 1;
            row >= 0;
            row--
        ) {

            if (
                grid[row][col] !== 0
            ) {

                line.push(
                    grid[row][col]
                );

            }

        }


        line =
            mergeLine(
                line
            );


        while (
            line.length < SIZE
        ) {

            line.push(0);

        }


        for (
            let row = SIZE - 1;
            row >= 0;
            row--
        ) {

            grid[row][col] =
                line[
                    SIZE - 1 - row
                ];

        }

    }

}


// ============================================================
// MERGE
// ============================================================

function mergeLine(line) {

    const result = [];


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        if (
            line[i] ===
            line[i + 1]
        ) {

            const mergedValue =
                line[i] * 2;


            result.push(
                mergedValue
            );


            score +=
                mergedValue;


            merges++;


            showFloatingScore(
                "+" + mergedValue
            );


            i++;

        }

        else {

            result.push(
                line[i]
            );

        }

    }


    return result;

}


// ============================================================
// UPDATE STATS
// ============================================================

function updateStats() {

    scoreElement.textContent =
        score;


    movesElement.textContent =
        moves;


    mergesElement.textContent =
        merges;


    if (
        score > bestScore
    ) {

        bestScore =
            score;


        localStorage.setItem(
            "dogu2048Best",
            bestScore
        );

    }


    bestElement.textContent =
        bestScore;

}


// ============================================================
// CHECK WIN
// ============================================================

function checkWin() {

    if (
        hasWon
    ) {

        return;

    }


    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                grid[row][col] ===
                WIN_VALUE
            ) {

                hasWon = true;


                gameFinished =
                    true;


                winMessage.classList.add(
                    "active"
                );


                return;

            }

        }

    }

}


// ============================================================
// CONTINUE AFTER WIN
// ============================================================

function continueAfterWin() {

    hasWon = false;

    gameFinished = false;


    winMessage.classList.remove(
        "active"
    );

}


// ============================================================
// CHECK GAME OVER
// ============================================================

function checkGameOver() {

    // Boş hücre varsa oyun devam eder.

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            if (
                grid[row][col] === 0
            ) {

                return false;

            }

        }

    }


    // Yatay kontrol.

    for (
        let row = 0;
        row < SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < SIZE - 1;
            col++
        ) {

            if (
                grid[row][col] ===
                grid[row][col + 1]
            ) {

                return false;

            }

        }

    }


    // Dikey kontrol.

    for (
        let col = 0;
        col < SIZE;
        col++
    ) {

        for (
            let row = 0;
            row < SIZE - 1;
            row++
        ) {

            if (
                grid[row][col] ===
                grid[row + 1][col]
            ) {

                return false;

            }

        }

    }


    gameFinished = true;


    gameOverText.textContent =
        "FINAL SCORE: " + score;


    gameOver.classList.add(
        "active"
    );


    return true;

}


// ============================================================
// FLOATING SCORE
// ============================================================

function showFloatingScore(text) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "floating-score";


    element.textContent =
        text;


    const rect =
        board.getBoundingClientRect();


    element.style.left =
        (
            rect.left +
            rect.width / 2
        ) + "px";


    element.style.top =
        (
            rect.top +
            rect.height / 2
        ) + "px";


    document.body.appendChild(
        element
    );


    setTimeout(
        () => {

            element.remove();

        },
        700
    );

}


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        let direction = null;


        if (
            event.key ===
            "ArrowLeft"
        ) {

            direction =
                "left";

        }

        else if (
            event.key ===
            "ArrowRight"
        ) {

            direction =
                "right";

        }

        else if (
            event.key ===
            "ArrowUp"
        ) {

            direction =
                "up";

        }

        else if (
            event.key ===
            "ArrowDown"
        ) {

            direction =
                "down";

        }


        if (
            direction
        ) {

            event.preventDefault();

            move(
                direction
            );

        }

    }
);


// ============================================================
// START BUTTON
// ============================================================

startButton.addEventListener(
    "click",
    function() {

        startGame();

    }
);


// ============================================================
// NEW GAME
// ============================================================

newGameButton.addEventListener(
    "click",
    function() {

        newGame();

    }
);


// ============================================================
// RETRY
// ============================================================

retryButton.addEventListener(
    "click",
    function() {

        newGame();

    }
);


// ============================================================
// CONTINUE AFTER 2048
// ============================================================

continueButton.addEventListener(
    "click",
    function() {

        continueAfterWin();

    }
);


// ============================================================
// SWIPE SUPPORT
// ============================================================

board.addEventListener(
    "touchstart",
    function(event) {

        const touch =
            event.changedTouches[0];


        board.dataset.startX =
            touch.screenX;


        board.dataset.startY =
            touch.screenY;

    },
    {
        passive: true
    }
);


board.addEventListener(
    "touchend",
    function(event) {

        const touch =
            event.changedTouches[0];


        const startX =
            Number(
                board.dataset.startX
            );


        const startY =
            Number(
                board.dataset.startY
            );


        const deltaX =
            touch.screenX -
            startX;


        const deltaY =
            touch.screenY -
            startY;


        const absX =
            Math.abs(
                deltaX
            );


        const absY =
            Math.abs(
                deltaY
            );


        if (
            Math.max(
                absX,
                absY
            ) < 30
        ) {

            return;

        }


        if (
            absX > absY
        ) {

            if (
                deltaX > 0
            ) {

                move("right");

            }

            else {

                move("left");

            }

        }

        else {

            if (
                deltaY > 0
            ) {

                move("down");

            }

            else {

                move("up");

            }

        }

    },
    {
        passive: true
    }
);