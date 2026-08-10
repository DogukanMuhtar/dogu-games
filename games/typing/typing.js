// ============================================================
// DOĞU GAMES
// TYPING SPEED
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const textDisplay =
    document.getElementById("text-display");

const typingInput =
    document.getElementById("typing-input");

const startScreen =
    document.getElementById("start-screen");

const startDescription =
    document.getElementById("start-description");

const startButton =
    document.getElementById("start-btn");

const wpmElement =
    document.getElementById("wpm");

const accuracyElement =
    document.getElementById("accuracy");

const timeElement =
    document.getElementById("time");

const errorsElement =
    document.getElementById("errors");

const comboElement =
    document.getElementById("combo");

const scoreElement =
    document.getElementById("score");

const bestScoreElement =
    document.getElementById("best-score");

const comboPop =
    document.getElementById("combo-pop");

const timeButtons =
    document.querySelectorAll(".time-btn");


// ============================================================
// SETTINGS
// ============================================================

let selectedDuration = 30;


// ============================================================
// GAME VARIABLES
// ============================================================

let currentText = "";

let currentIndex = 0;

let startTime = null;

let timeLeft = 30;

let timer = null;

let gameRunning = false;

let errors = 0;

let totalTyped = 0;

let correctCharacters = 0;

// Oyun boyunca toplam doğru karakter
let totalCorrectCharacters = 0;

let score = 0;

let combo = 0;

let maxCombo = 0;

let completedTexts = 0;

let lastInputLength = 0;


// ============================================================
// ANTI-EXPLOIT
// ============================================================

// Mevcut cümlede daha önce puan verilen
// karakter pozisyonları
let scoredPositions = new Set();

// Mevcut cümlede hata olarak kaydedilen
// karakter pozisyonları
let errorPositions = new Set();


// ============================================================
// TEXT BANK
// ============================================================

const texts = [

    "The quick brown fox jumps over the lazy dog.",

    "Practice makes progress and consistency creates skill.",

    "Every great developer started by writing simple code.",

    "Speed is useful but accuracy is always more important.",

    "Small improvements every day create impressive results.",

    "Good software is built with patience testing and practice.",

    "Focus on the task and let your fingers follow your mind.",

    "Learning to type faster can make coding much more enjoyable.",

    "Technology changes quickly so developers must keep learning.",

    "Clean code is easier to understand maintain and improve.",

    "A good programmer solves problems one step at a time.",

    "Great results come from patience practice and consistency.",

    "The best way to improve is to practice every single day.",

    "Fast typing allows developers to focus more on solving problems.",

    "Writing clean code is just as important as writing code quickly.",

    "Programming requires logical thinking patience and attention to detail.",

    "A computer only does what the programmer tells it to do.",

    "Debugging is sometimes difficult but every error teaches something new.",

    "Good developers spend time understanding problems before writing code.",

    "Learning a new programming language takes time and consistent practice.",

    "The internet has changed the way people communicate and work.",

    "Modern applications need to be fast secure and easy to use.",

    "User experience is one of the most important parts of good software.",

    "A simple solution is often better than a complicated solution.",

    "Never stop learning because technology is always changing.",

    "Success usually comes from many small improvements over time.",

    "The ability to solve problems is one of the most valuable skills.",

    "Good habits make difficult tasks easier to complete.",

    "Strong fundamentals make learning advanced concepts much easier.",

    "A developer should always test their code before releasing it.",

    "Errors are not failures they are opportunities to learn and improve.",

    "The fastest way to learn is to build something and solve real problems.",

    "Writing code every day can dramatically improve your programming skills.",

    "Software development requires creativity logic and attention.",

    "A well designed interface makes an application easier to understand.",

    "Good communication is essential when working on a software project.",

    "Teamwork can turn a difficult project into a manageable one.",

    "The goal of programming is to solve problems efficiently.",

    "Every project teaches you something that the previous project could not.",

    "The more you practice the more natural typing becomes.",

    "Accuracy should always come before speed when learning to type.",

    "Fast fingers are useful but a focused mind is even more important.",

    "Typing without looking at the keyboard takes regular practice.",

    "A calm mind can help you type faster and make fewer mistakes.",

    "Try to maintain a steady rhythm instead of typing randomly.",

    "Good typing technique can save a lot of time during programming.",

    "Developers spend many hours writing and reading code.",

    "Keyboard shortcuts can make everyday computer tasks much faster.",

    "Learning shortcuts is a simple way to improve productivity.",

    "The keyboard is one of the most important tools for a programmer.",

    "Sometimes the smallest bug can cause a very large problem.",

    "Finding the cause of a bug is often harder than fixing it.",

    "Patience is one of the most important qualities of a developer.",

    "Programming becomes easier when you understand the problem clearly.",

    "A clear plan can save hours of unnecessary work.",

    "Before starting a project always think about what you want to build.",

    "Breaking a large problem into smaller pieces makes it easier to solve.",

    "Good code should be readable even months after it was written.",

    "Version control makes it easier to manage changes in a project.",

    "Git allows developers to track changes and work together.",

    "A good commit message should clearly describe the changes.",

    "Building projects is one of the best ways to improve programming skills.",

    "Do not be afraid of making mistakes while learning something new.",

    "The most important thing is to understand why something works.",

    "Reading documentation is an important part of professional development.",

    "A developer should know how to search for solutions effectively.",

    "There is always something new to discover in the world of technology.",

    "Web development combines design programming and user experience.",

    "HTML provides structure while CSS controls the visual appearance.",

    "JavaScript makes web pages interactive and dynamic.",

    "A responsive website should work well on different screen sizes.",

    "Good websites should be simple fast accessible and easy to navigate.",

    "Frontend development focuses on what users see and interact with.",

    "Backend development handles data logic authentication and servers.",

    "Databases allow applications to store and retrieve information.",

    "APIs allow different software systems to communicate with each other.",

    "Security should be considered from the beginning of every project.",

    "A fast application provides a much better experience for users.",

    "Performance becomes more important as an application grows.",

    "Testing helps developers find problems before users discover them.",

    "Automation can save time by handling repetitive tasks.",

    "Artificial intelligence is changing the way people use technology.",

    "Learning to solve problems is more valuable than memorizing code.",

    "Experience comes from building projects not just watching tutorials.",

    "The best projects are usually created by solving real problems.",

    "Consistency is more important than motivation when learning a skill.",

    "Keep your goals clear and work toward them one step at a time.",

    "Progress may feel slow but small improvements eventually become significant.",

    "Technology gives people powerful tools but creativity gives those tools purpose.",

    "A great application should solve a problem without creating unnecessary complexity.",

    "Good programmers spend time learning how systems work internally.",

    "Creative thinking can lead to simple solutions for difficult problems.",

    "Every line of code should have a clear purpose.",

    "A reliable application should handle unexpected situations gracefully.",

    "Developers should write code that other people can understand.",

    "Learning from mistakes is one of the fastest ways to improve.",

    "Professional developers continuously improve their tools and workflows.",

    "A focused developer can accomplish more in less time.",

    "Building a project from scratch teaches lessons that tutorials cannot.",

    "Good software starts with a clear problem and a clear solution.",

    "The best way to understand programming is to practice it.",

    "Never underestimate the value of simple and readable code."

];


// ============================================================
// TEXT DECK
// ============================================================

let textDeck = [];


// ============================================================
// SHUFFLE
// ============================================================

function shuffleTexts() {

    textDeck = [...texts];

    for (
        let i = textDeck.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            textDeck[i],
            textDeck[j]
        ] =
        [
            textDeck[j],
            textDeck[i]
        ];
    }
}


// ============================================================
// NEXT TEXT
// ============================================================

function getNextText() {

    if (
        textDeck.length === 0
    ) {

        shuffleTexts();

    }

    return textDeck.pop();
}


// ============================================================
// BEST SCORE
// ============================================================

let bestScore =
    Number(
        localStorage.getItem(
            "typingBestScore"
        )
    ) || 0;

bestScoreElement.textContent =
    bestScore;


// ============================================================
// TYPEWRITER SOUND
// ============================================================

const typewriterSound =
    new Audio(
        "../sounds/typewriter.wav"
    );

typewriterSound.volume =
    0.55;


// ============================================================
// AUDIO CONTEXT
// ============================================================

let audioContext = null;


function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }
}


// ============================================================
// TYPEWRITER SOUND
// ============================================================

function playTypewriterSound() {

    const sound =
        typewriterSound.cloneNode();

    sound.volume =
        0.55;

    sound.currentTime =
        0;

    sound.play().catch(
        () => {}
    );
}


// ============================================================
// ERROR SOUND
// ============================================================

function playErrorSound() {

    initAudio();

    const now =
        audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type =
        "sawtooth";

    oscillator.frequency.setValueAtTime(
        180,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        80,
        now + 0.12
    );

    gain.gain.setValueAtTime(
        0.06,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.12
    );

    oscillator.connect(
        gain
    );

    gain.connect(
        audioContext.destination
    );

    oscillator.start(
        now
    );

    oscillator.stop(
        now + 0.12
    );
}


// ============================================================
// WORD SOUND
// ============================================================

function playWordSound() {

    initAudio();

    const now =
        audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type =
        "square";

    oscillator.frequency.setValueAtTime(
        700,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        1000,
        now + 0.08
    );

    gain.gain.setValueAtTime(
        0.05,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.1
    );

    oscillator.connect(
        gain
    );

    gain.connect(
        audioContext.destination
    );

    oscillator.start(
        now
    );

    oscillator.stop(
        now + 0.1
    );
}


// ============================================================
// SENTENCE COMPLETE SOUND
// ============================================================

function playCompleteSound() {

    initAudio();

    const notes = [
        520,
        660,
        820
    ];

    notes.forEach(
        (
            frequency,
            index
        ) => {

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();

            const start =
                audioContext.currentTime +
                index * 0.08;

            oscillator.type =
                "square";

            oscillator.frequency.value =
                frequency;

            gain.gain.setValueAtTime(
                0.001,
                start
            );

            gain.gain.linearRampToValueAtTime(
                0.06,
                start + 0.015
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                start + 0.09
            );

            oscillator.connect(
                gain
            );

            gain.connect(
                audioContext.destination
            );

            oscillator.start(
                start
            );

            oscillator.stop(
                start + 0.1
            );
        }
    );
}


// ============================================================
// TIME BUTTONS
// ============================================================

timeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                if (
                    gameRunning
                ) {

                    return;

                }

                selectedDuration =
                    Number(
                        this.dataset.time
                    );

                timeButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );

                this.classList.add(
                    "active"
                );

                timeLeft =
                    selectedDuration;

                timeElement.textContent =
                    selectedDuration;

            }
        );

    }
);


// ============================================================
// LOAD NEXT TEXT
// ============================================================

function loadNextText() {

    currentText =
        getNextText();

    currentIndex =
        0;

    lastInputLength =
        0;

    scoredPositions.clear();

    errorPositions.clear();

    typingInput.value =
        "";

    renderText();
}


// ============================================================
// RENDER TEXT
// ============================================================

function renderText() {

    textDisplay.innerHTML =
        "";

    currentText
        .split("")
        .forEach(
            (
                character,
                index
            ) => {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    character;

                if (
                    index ===
                    currentIndex
                ) {

                    span.className =
                        "current";

                }

                else {

                    span.className =
                        "pending";

                }

                textDisplay.appendChild(
                    span
                );

            }
        );
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    clearInterval(
        timer
    );

    initAudio();

    shuffleTexts();

    gameRunning =
        true;

    startTime =
        null;

    timeLeft =
        selectedDuration;

    currentIndex =
        0;

    errors =
        0;

    totalTyped =
        0;

    correctCharacters =
        0;

    totalCorrectCharacters =
        0;

    score =
        0;

    combo =
        0;

    maxCombo =
        0;

    completedTexts =
        0;

    lastInputLength =
        0;

    scoredPositions.clear();

    errorPositions.clear();

    loadNextText();

    timeElement.textContent =
        timeLeft;

    wpmElement.textContent =
        "0";

    accuracyElement.textContent =
        "100%";

    errorsElement.textContent =
        "0";

    comboElement.textContent =
        "x0";

    scoreElement.textContent =
        "0";

    startScreen.style.display =
        "none";

    typingInput.disabled =
        false;

    typingInput.focus();
}


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
// INPUT HANDLER
// ============================================================

typingInput.addEventListener(
    "input",
    function() {

        if (
            !gameRunning
        ) {

            return;

        }

        const typed =
            typingInput.value;


        // ========================================
        // BACKSPACE
        // ========================================

        if (
            typed.length <
            lastInputLength
        ) {

            currentIndex =
                typed.length;

            lastInputLength =
                typed.length;

            // Backspace'e basıldığında
            // daktilo sesi çıkar.

            playTypewriterSound();

            renderTypedInput();

            updateStats();

            return;
        }


        // ========================================
        // START TIMER
        // ========================================

        if (
            startTime === null &&
            typed.length > 0
        ) {

            startTime =
                Date.now();

            timer =
                setInterval(
                    updateTimer,
                    1000
                );
        }


        // ========================================
        // PROCESS NEW CHARACTERS
        // ========================================

        for (
            let i =
                lastInputLength;

            i <
                typed.length;

            i++
        ) {

            const typedCharacter =
                typed[i];

            const expectedCharacter =
                currentText[i];


            // ====================================
            // CORRECT
            // ====================================

            if (
                typedCharacter ===
                expectedCharacter
            ) {

                if (
                    !scoredPositions.has(i)
                ) {

                    scoredPositions.add(i);

                    correctCharacters++;

                    totalCorrectCharacters++;


                    // Eğer daha önce aynı
                    // pozisyonda hata yaptıysa
                    // hata hesabından çıkar.

                    if (
                        errorPositions.has(i)
                    ) {

                        errorPositions.delete(i);

                        totalTyped =
                            Math.max(
                                0,
                                totalTyped - 1
                            );

                        errors =
                            Math.max(
                                0,
                                errors - 1
                            );
                    }


                    totalTyped++;


                    // Combo

                    combo++;

                    if (
                        combo >
                        maxCombo
                    ) {

                        maxCombo =
                            combo;

                    }


                    // Score

                    const comboBonus =
                        Math.min(
                            20,
                            Math.floor(
                                combo / 5
                            )
                        );

                    score +=
                        10 +
                        comboBonus;


                    // Typewriter

                    playTypewriterSound();


                    // Combo popup

                    if (
                        combo >= 5 &&
                        combo % 5 === 0
                    ) {

                        showCombo(
                            combo
                        );

                    }

                }

            }


            // ====================================
            // WRONG
            // ====================================

            else {

                if (
                    !errorPositions.has(i) &&
                    !scoredPositions.has(i)
                ) {

                    errorPositions.add(i);

                    totalTyped++;

                    errors++;

                    combo =
                        0;

                    score =
                        Math.max(
                            0,
                            score - 5
                        );

                    playErrorSound();

                    showFloatingScore(
                        "-5",
                        true
                    );

                }

            }

        }


        currentIndex =
            typed.length;

        lastInputLength =
            typed.length;


        renderTypedInput();

        updateStats();


        // ========================================
        // WORD COMPLETE
        // ========================================

        if (
            typed.length > 0
        ) {

            const lastCharacter =
                typed[
                    typed.length - 1
                ];

            if (
                lastCharacter ===
                " "
            ) {

                playWordSound();

                triggerWordEffect();

                showFloatingScore(
                    "+WORD",
                    false
                );

            }

        }


        // ========================================
        // SENTENCE COMPLETE
        // ========================================
        //
        // ARTIK TÜM KARAKTERLERİN DOĞRU OLMASI
        // GEREKMİYOR.
        //
        // Oyuncu cümlenin uzunluğu kadar
        // karakter yazdıysa sonraki cümleye geç.

        if (
            typed.length >=
            currentText.length
        ) {

            completeSentence();

        }

    }
);


// ============================================================
// COMPLETE SENTENCE
// ============================================================

function completeSentence() {

    if (
        !gameRunning
    ) {

        return;

    }

    completedTexts++;


    // Cümleyi doğru bitirme bonusu
    // yalnızca hata yoksa verilir.

    const hasError =
        errorPositions.size > 0;


    let sentenceBonus =
        0;


    if (
        !hasError
    ) {

        sentenceBonus =
            100 +
            (
                combo * 2
            );

    }


    if (
        sentenceBonus > 0
    ) {

        score +=
            sentenceBonus;

        showFloatingScore(
            "+" +
            sentenceBonus,
            false
        );

        playCompleteSound();

        triggerSentenceEffect();

    }


    // Hatalı cümlede de geçiş yapılır.
    // Sadece perfect bonus verilmez.

    loadNextText();

    updateStats();

}


// ============================================================
// RENDER TYPED INPUT
// ============================================================

function renderTypedInput() {

    textDisplay.innerHTML =
        "";

    const typed =
        typingInput.value;

    currentText
        .split("")
        .forEach(
            (
                character,
                index
            ) => {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    character;


                // ====================================
                // TYPED
                // ====================================

                if (
                    index <
                    typed.length
                ) {

                    if (
                        typed[index] ===
                        character
                    ) {

                        span.className =
                            "correct";

                    }

                    else {

                        span.className =
                            "incorrect";

                    }

                }


                // ====================================
                // CURRENT
                // ====================================

                else if (
                    index ===
                    typed.length
                ) {

                    span.className =
                        "current";

                }


                // ====================================
                // PENDING
                // ====================================

                else {

                    span.className =
                        "pending";

                }

                textDisplay.appendChild(
                    span
                );

            }
        );
}


// ============================================================
// TIMER
// ============================================================

function updateTimer() {

    if (
        !gameRunning
    ) {

        return;

    }

    timeLeft--;

    timeElement.textContent =
        timeLeft;

    updateStats();


    if (
        timeLeft <= 0
    ) {

        endGame();

    }

}


// ============================================================
// UPDATE STATS
// ============================================================

function updateStats() {

    if (
        startTime === null
    ) {

        return;

    }

    const elapsed =
        Math.max(
            1,
            (
                Date.now() -
                startTime
            ) / 1000
        );

    const minutes =
        elapsed / 60;


    // ========================================
    // WPM
    // ========================================

    const wpm =
        Math.round(
            (
                totalCorrectCharacters /
                5
            ) /
            minutes
        );


    // ========================================
    // ACCURACY
    // ========================================

    const accuracy =
        totalTyped > 0
            ? Math.round(
                (
                    correctCharacters /
                    totalTyped
                ) * 100
            )
            : 100;


    // ========================================
    // UI
    // ========================================

    wpmElement.textContent =
        Math.max(
            0,
            wpm
        );

    accuracyElement.textContent =
        accuracy +
        "%";

    errorsElement.textContent =
        errors;

    comboElement.textContent =
        "x" +
        combo;

    scoreElement.textContent =
        score;

}


// ============================================================
// FLOATING SCORE
// ============================================================

function showFloatingScore(
    text,
    penalty
) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "floating-score";


    if (
        penalty
    ) {

        element.classList.add(
            "penalty"
        );

    }

    element.textContent =
        text;


    const rect =
        typingInput.getBoundingClientRect();


    element.style.left =
        (
            rect.left +
            rect.width / 2
        ) +
        "px";


    element.style.top =
        (
            rect.top -
            10
        ) +
        "px";


    document.body.appendChild(
        element
    );


    setTimeout(
        () => {

            element.remove();

        },
        800
    );

}


// ============================================================
// COMBO POPUP
// ============================================================

function showCombo(
    value
) {

    comboPop.textContent =
        "COMBO x" +
        value;


    comboPop.classList.remove(
        "show"
    );


    void comboPop.offsetWidth;


    comboPop.classList.add(
        "show"
    );

}


// ============================================================
// WORD EFFECT
// ============================================================

function triggerWordEffect() {

    textDisplay.classList.remove(
        "word-complete"
    );


    void textDisplay.offsetWidth;


    textDisplay.classList.add(
        "word-complete"
    );

}


// ============================================================
// SENTENCE EFFECT
// ============================================================

function triggerSentenceEffect() {

    textDisplay.style.borderColor =
        "#39ff14";


    textDisplay.style.boxShadow =
        "0 0 45px rgba(57,255,20,.35)";


    setTimeout(
        () => {

            textDisplay.style.borderColor =
                "";

            textDisplay.style.boxShadow =
                "";

        },
        400
    );

}


// ============================================================
// END GAME
// ============================================================

function endGame() {

    gameRunning =
        false;


    clearInterval(
        timer
    );


    timer =
        null;


    typingInput.disabled =
        true;


    updateStats();


    const finalWPM =
        Number(
            wpmElement.textContent
        ) || 0;


    const finalAccuracy =
        accuracyElement.textContent;


    const newBest =
        score >
        bestScore;


    if (
        newBest
    ) {

        bestScore =
            score;


        localStorage.setItem(
            "typingBestScore",
            bestScore
        );

    }


    bestScoreElement.textContent =
        bestScore;


    startScreen.style.display =
        "flex";


    startScreen.querySelector(
        "h2"
    ).textContent =
        newBest
            ? "NEW BEST!"
            : "TIME UP";


    startDescription.innerHTML = `

        SCORE:
        <strong>
            ${score}
        </strong>

        <br>

        BEST SCORE:
        <strong>
            ${bestScore}
        </strong>

        <br>

        WPM:
        <strong>
            ${finalWPM}
        </strong>

        <br>

        ACCURACY:
        <strong>
            ${finalAccuracy}
        </strong>

        <br>

        ERRORS:
        <strong>
            ${errors}
        </strong>

        <br>

        MAX COMBO:
        <strong>
            x${maxCombo}
        </strong>

        <br>

        COMPLETED:
        <strong>
            ${completedTexts}
        </strong>

    `;


    startButton.textContent =
        "PLAY AGAIN";

}


// ============================================================
// INITIAL STATE
// ============================================================

timeElement.textContent =
    selectedDuration;


wpmElement.textContent =
    "0";


accuracyElement.textContent =
    "100%";


errorsElement.textContent =
    "0";


comboElement.textContent =
    "x0";


scoreElement.textContent =
    "0";


bestScoreElement.textContent =
    bestScore;