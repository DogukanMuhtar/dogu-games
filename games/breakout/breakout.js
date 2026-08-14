const SUPABASE_URL = "https://zvxzfwftwvkjvqvdqabo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GF0KjdrmsluAuSDW9SmkLg_svfG1SrL";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    }
);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level-display");
const message = document.getElementById("message");
const messageTitle = document.getElementById("message-title");
const messageSubtitle = document.getElementById("message-subtitle");

let width = 0;
let height = 0;
let score = 0;
let bestScore = Number(localStorage.getItem("dg_breakout_best")) || 0;
let lives = 5;
let wave = 1;
let gameRunning = false;
let gameOver = false;
let paused = false;
let gameWon = false;
let animationId = null;
let lastTime = 0;
let combo = 0;
let comboTimer = 0;
let totalBricksBroken = 0;
let runTime = 0;
let boss = null;
let screenShake = 0;
let popups = [];
let particles = [];
let powerUps = [];
let balls = [];
let bricks = [];
let audioContext = null;
let musicTimer = null;
let musicEnabled = true;

const BALL_ACCELERATION = 1.015;
const BALL_MAX_SPEED = 9.5;
const PADDLE_SPEED = 4;

const paddle = {
    width: 100,
    height: 9,
    x: 0,
    y: 0,
    speed: PADDLE_SPEED,
    targetX: 0
};

const ball = {
    radius: 5,
    x: 0,
    y: 0,
    dx: 3.5,
    dy: -4.5,
    speed: 5.7
};

let brickRows = 5;
let brickCols = 8;
let brickWidth = 0;
let brickHeight = 15;
let brickGap = 5;
let brickTop = 75;

let activePowerUps = {
    bigPaddle: 0,
    slowBall: 0,
    fireball: 0,
    laser: 0,
    smallBall: 0
};

function makeDynamicUI() {
    const wrapper = document.querySelector(".game-wrapper");
    if (!wrapper) return;

    if (levelElement && !wrapper.contains(levelElement)) {
        wrapper.appendChild(levelElement);
        levelElement.style.position = "absolute";
        levelElement.style.top = "8px";
        levelElement.style.left = "50%";
        levelElement.style.transform = "translateX(-50%)";
        levelElement.style.zIndex = "50";
        levelElement.style.pointerEvents = "none";
        levelElement.style.margin = "0";
        levelElement.style.width = "auto";
        levelElement.style.textAlign = "center";
    }

    if (!document.getElementById("breakout-extra-ui")) {
        const ui = document.createElement("div");
        ui.id = "breakout-extra-ui";
        ui.innerHTML = `
            <div id="combo-display"></div>
            <div id="pause-display">
                PAUSED
                <br>
                <small>PRESS P TO CONTINUE</small>
            </div>
            <div id="boss-bar">
                <span>BOSS</span>
                <div>
                    <i></i>
                </div>
            </div>
        `;
        wrapper.appendChild(ui);

        const style = document.createElement("style");
        style.textContent = `
            #breakout-extra-ui {
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 40;
                font-family: "Courier New", monospace;
            }
            #combo-display {
                position: absolute;
                top: 11%;
                left: 50%;
                transform: translateX(-50%);
                font-size: clamp(18px, 3vw, 32px);
                font-weight: bold;
                letter-spacing: 3px;
                color: #39ff14;
                text-shadow: 0 0 12px #39ff14;
                opacity: 0;
                transition: opacity .15s;
                white-space: nowrap;
            }
            #combo-display.show {
                opacity: 1;
            }
            #pause-display {
                display: none;
                position: absolute;
                inset: 0;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-size: clamp(25px, 4vw, 42px);
                font-weight: bold;
                letter-spacing: 5px;
                color: #f5f2dc;
                background: rgba(0,0,0,.55);
            }
            #pause-display small {
                font-size: 10px;
                letter-spacing: 3px;
                color: #39ff14;
            }
            #boss-bar {
                display: none;
                position: absolute;
                left: 8%;
                right: 8%;
                top: 7px;
                text-align: center;
                color: #f5f2dc;
                font-size: 9px;
                letter-spacing: 3px;
                font-weight: bold;
            }
            #boss-bar > div {
                height: 7px;
                border: 1px solid #39ff14;
                margin-top: 4px;
                background: #050805;
            }
            #boss-bar i {
                display: block;
                height: 100%;
                width: 100%;
                background: #39ff14;
                box-shadow: 0 0 8px #39ff14;
            }
        `;
        document.head.appendChild(style);
    }
}

function setComboUI() {
    const el = document.getElementById("combo-display");
    if (!el) return;

    if (combo >= 2) {
        el.textContent = `COMBO x${combo}`;
        el.classList.add("show");
    } else {
        el.classList.remove("show");
    }
}

function setPauseUI() {
    const el = document.getElementById("pause-display");
    if (el) {
        el.style.display = paused ? "flex" : "none";
    }
}

function updateBossUI() {
    const bar = document.getElementById("boss-bar");
    if (!bar) return;

    if (!boss || !boss.alive) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "block";

    const pct = Math.max(0, boss.hp / boss.maxHp) * 100;
    const fill = bar.querySelector("i");

    if (fill) {
        fill.style.width = `${pct}%`;
    }
}

function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth * 0.84, 800);
    const maxHeight = Math.min(window.innerHeight * 0.70, 640);
    const aspectRatio = 4 / 5;

    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }

    canvas.width = Math.floor(newWidth);
    canvas.height = Math.floor(newHeight);
    canvas.style.width = `${Math.floor(newWidth)}px`;
    canvas.style.height = `${Math.floor(newHeight)}px`;

    width = canvas.width;
    height = canvas.height;

    paddle.width = width * 0.18;
    paddle.height = Math.max(8, height * 0.018);

    paddle.x = width / 2 - paddle.width / 2;
    paddle.targetX = paddle.x;
    paddle.y = height - height * 0.08;

    ball.radius = Math.max(5, width * 0.012);

    if (!gameRunning) {
        resetBall();
    }

    createBricks();
    updateBossUI();
    draw();
}

window.addEventListener("resize", resizeCanvas);

function createBrickDimensions() {
    brickCols = width < 420 ? 6 : 8;
    brickWidth = (width - 30 - (brickCols - 1) * brickGap) / brickCols;
    brickTop = Math.max(55, height * 0.10);
}

function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch {
            return;
        }
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    startMusic();
}

function playSound(frequency = 440, duration = .06, type = "square", volume = .035) {
    if (!audioContext) return;

    try {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(volume, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + duration);
    } catch {}
}

function startMusic() {
    if (!musicEnabled || musicTimer) {
        return;
    }

    const notes = [110, 165, 220, 165, 130, 196, 247, 196];
    let index = 0;

    musicTimer = setInterval(() => {
        if (!gameRunning || paused || !audioContext) {
            return;
        }
        playSound(notes[index++ % notes.length], .07, "square", .008);
    }, 210);
}

function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
}

function playStartSound() {
    [220, 330, 440].forEach((n, i) => {
        setTimeout(() => {
            playSound(n, .08, "square", .04);
        }, i * 80);
    });
}

function playBrickSound() {
    playSound(260 + Math.min(combo * 20, 320), .045, "square", .03);
}

function playPowerUpSound() {
    playSound(500, .08, "square", .04);
    setTimeout(() => {
        playSound(700, .1, "square", .04);
    }, 80);
}

function playGameOverSound() {
    playSound(220, .15, "sawtooth", .04);
    setTimeout(() => {
        playSound(150, .25, "sawtooth", .04);
    }, 150);
}

function playBossSound() {
    [180, 140, 100, 180].forEach((n, i) => {
        setTimeout(() => {
            playSound(n, .12, "sawtooth", .035);
        }, i * 100);
    });
}

function createParticles(x, y, amount = 8, boost = 1) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x,
            y,
            dx: (Math.random() - .5) * 5 * boost,
            dy: (Math.random() - .5) * 5 * boost,
            life: 1,
            size: Math.random() * 2 + 1
        });
    }
}

function addPopup(text, x, y) {
    popups.push({ text, x, y, life: 1, dy: -.6 });
}

function updateParticles(dt = 1) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.dx * dt * 60;
        p.y += p.dy * dt * 60;
        p.dy += .06;
        p.life -= .025 * dt * 60;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i];

        p.y += p.dy * dt * 60;
        p.life -= .018 * dt * 60;

        if (p.life <= 0) {
            popups.splice(i, 1);
        }
    }

    screenShake = Math.max(0, screenShake - .65 * dt * 60);
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = "#39ff14";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    popups.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = "#f5f2dc";
        ctx.font = "bold 12px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
    });

    ctx.globalAlpha = 1;
}

function createBricks() {
    bricks = [];
    createBrickDimensions();

    brickRows = Math.min(4 + Math.floor((wave - 1) * .65), 10);

    const bossWave = wave % 5 === 0;
    const layouts = ["normal", "checker", "pyramid", "holes"];
    const layout = layouts[(wave - 1) % layouts.length];

    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            if (layout === "holes" && row > 1 && (row + col) % 4 === 0) {
                continue;
            }

            if (layout === "pyramid" && Math.abs(col - (brickCols - 1) / 2) > row + 2) {
                continue;
            }

            if (layout === "checker" && (row + col) % 2 === 1 && wave < 4) {
                continue;
            }

            let type = "normal";
            let hits = 1;
            const r = Math.random();

            if (wave >= 3 && r < .10) {
                type = "explosive";
                hits = 1;
            } else if (wave >= 2 && r < .24) {
                type = "hard";
                hits = 3;
            } else if (wave >= 2 && r < .42) {
                type = "strong";
                hits = 2;
            } else if (r < .50) {
                type = "bonus";
                hits = 1;
            }

            const x = 15 + col * (brickWidth + brickGap);
            const y = brickTop + row * (brickHeight + brickGap);

            bricks.push({
                x,
                y,
                width: brickWidth,
                height: brickHeight,
                type,
                hits,
                maxHits: hits,
                alive: true
            });
        }
    }

    if (bossWave) {
        boss = {
            x: width / 2 - 65,
            y: brickTop + brickRows * (brickHeight + brickGap) + 15,
            width: 130,
            height: 28,
            hp: 12 + wave * 3,
            maxHp: 12 + wave * 3,
            dx: 2.2 + wave * .08,
            alive: true,
            active: false,
            shotTimer: 80
        };

        playBossSound();
    } else {
        boss = null;
    }
}

function circleRectCollision(b, r) {
    const closestX = Math.max(r.x, Math.min(b.x, r.x + r.width));
    const closestY = Math.max(r.y, Math.min(b.y, r.y + r.height));

    const dx = b.x - closestX;
    const dy = b.y - closestY;

    return (dx * dx + dy * dy) < b.radius * b.radius;
}

function handlePaddleCollision(currentBall) {
    if (currentBall.dy <= 0) {
        return;
    }

    if (!circleRectCollision(currentBall, paddle)) {
        return;
    }

    currentBall.y = paddle.y - currentBall.radius - 0.5;

    const paddleCenter = paddle.x + paddle.width / 2;
    const hitPosition = (currentBall.x - paddleCenter) / (paddle.width / 2);
    const normalizedHit = Math.max(-1, Math.min(1, hitPosition));
    const maxAngle = Math.PI * 0.333;
    const angle = normalizedHit * maxAngle;

    const currentSpeed = Math.sqrt(currentBall.dx * currentBall.dx + currentBall.dy * currentBall.dy);

    currentBall.dx = currentSpeed * Math.sin(angle);
    currentBall.dy = -Math.abs(currentSpeed * Math.cos(angle));

    const minimumVerticalSpeed = currentSpeed * 0.35;

    if (Math.abs(currentBall.dy) < minimumVerticalSpeed) {
        currentBall.dy = -minimumVerticalSpeed;

        const horizontalSpeed = Math.sqrt(Math.max(0, currentSpeed * currentSpeed - currentBall.dy * currentBall.dy));

        currentBall.dx = normalizedHit < 0 ? -horizontalSpeed : horizontalSpeed;
    }

    playSound(180, .04, "square", .025);
}

function handleBrickCollision(currentBall) {
    for (const brick of bricks) {
        if (!brick.alive) {
            continue;
        }

        if (!circleRectCollision(currentBall, brick)) {
            continue;
        }

        const overlapLeft = currentBall.x + currentBall.radius - brick.x;
        const overlapRight = brick.x + brick.width - (currentBall.x - currentBall.radius);
        const overlapTop = currentBall.y + currentBall.radius - brick.y;
        const overlapBottom = brick.y + brick.height - (currentBall.y - currentBall.radius);

        const minHorizontal = Math.min(overlapLeft, overlapRight);
        const minVertical = Math.min(overlapTop, overlapBottom);

        if (minHorizontal < minVertical) {
            currentBall.dx *= -1;
        } else {
            currentBall.dy *= -1;
        }

        if (activePowerUps.fireball <= 0) {
            brick.hits--;
        } else {
            brick.hits = 0;
        }

        if (brick.hits <= 0) {
            brick.alive = false;
            totalBricksBroken++;
            combo++;
            comboTimer = 120;

            const multiplier = Math.min(combo, 10);
            let brickScore = 10 * multiplier;

            if (brick.type === "bonus") {
                brickScore *= 3;
            }

            if (brick.type === "hard") {
                brickScore *= 2;
            }

            score += brickScore;

            addPopup(`+${brickScore}`, brick.x + brick.width / 2, brick.y);
            createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, 10);

            screenShake = brick.type === "explosive" ? 8 : 2;

            playBrickSound();

            if (brick.type === "explosive") {
                explodeBrick(brick);
            }

            if (Math.random() < 0.16) {
                spawnPowerUp(brick);
            }
        } else {
            createParticles(currentBall.x, currentBall.y, 4);
            playSound(150, .04, "square", .025);
        }

        const currentSpeed = Math.sqrt(currentBall.dx * currentBall.dx + currentBall.dy * currentBall.dy);
        const newSpeed = Math.min(currentSpeed * BALL_ACCELERATION, BALL_MAX_SPEED);
        const speedRatio = newSpeed / currentSpeed;

        currentBall.dx *= speedRatio;
        currentBall.dy *= speedRatio;

        setComboUI();

        break;
    }
}

function explodeBrick(centerBrick) {
    for (const brick of bricks) {
        if (!brick.alive || brick === centerBrick) {
            continue;
        }

        const dx = (brick.x + brick.width / 2) - (centerBrick.x + centerBrick.width / 2);
        const dy = (brick.y + brick.height / 2) - (centerBrick.y + centerBrick.height / 2);

        if (Math.sqrt(dx * dx + dy * dy) < brickWidth * 1.5) {
            brick.hits = 0;
            brick.alive = false;
            score += 15;
            totalBricksBroken++;
            createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, 8);
        }
    }
}

function spawnPowerUp(brick) {
    const types = ["big", "slow", "multi", "fire", "laser", "life", "small"];
    const type = types[Math.floor(Math.random() * types.length)];

    powerUps.push({
        x: brick.x + brick.width / 2,
        y: brick.y,
        speed: 2.2,
        type,
        spin: 0
    });
}

function updatePowerUps(dt) {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];

        p.y += p.speed * dt * 60;
        p.spin += .08 * dt * 60;

        if (circleRectCollision({ x: p.x, y: p.y, radius: 10 }, paddle)) {
            activatePowerUp(p.type);
            powerUps.splice(i, 1);
            continue;
        }

        if (p.y > height + 20) {
            powerUps.splice(i, 1);
        }
    }
}

function activatePowerUp(type) {
    playPowerUpSound();

    if (type === "big") {
        activePowerUps.bigPaddle = 600;
        paddle.width = width * 0.28;
    }

    if (type === "slow") {
        activePowerUps.slowBall = 500;
    }

    if (type === "multi") {
        for (let i = 0; i < 2; i++) {
            balls.push({
                radius: ball.radius,
                x: ball.x,
                y: ball.y,
                dx: i === 0 ? -Math.abs(ball.dx) : Math.abs(ball.dx),
                dy: ball.dy
            });
        }
    }

    if (type === "fire") {
        activePowerUps.fireball = 600;
    }

    if (type === "laser") {
        activePowerUps.laser = 600;
    }

    if (type === "life") {
        lives = Math.min(lives + 1, 5);
        updateUI();
    }

    if (type === "small") {
        activePowerUps.smallBall = 500;
        ball.radius = Math.max(3, width * .008);
    }
}

function updatePowerEffects() {
    for (const key in activePowerUps) {
        if (activePowerUps[key] > 0) {
            activePowerUps[key]--;
        }
    }

    if (activePowerUps.bigPaddle <= 0) {
        paddle.width = width * 0.18;
    }

    if (activePowerUps.smallBall <= 0) {
        ball.radius = Math.max(5, width * 0.012);
    }
}

function drawPowerUps() {
    powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);

        const colors = {
            big: "#39ff14",
            slow: "#00d9ff",
            multi: "#d946ef",
            fire: "#f97316",
            laser: "#facc15",
            life: "#ff3b3b",
            small: "#ffffff"
        };

        ctx.fillStyle = colors[p.type];
        ctx.shadowBlur = 12;
        ctx.shadowColor = colors[p.type];
        ctx.fillRect(-8, -8, 16, 16);

        ctx.fillStyle = "#050805";
        ctx.font = "bold 9px Courier New";
        ctx.textAlign = "center";

        const letters = {
            big: "B",
            slow: "S",
            multi: "M",
            fire: "F",
            laser: "L",
            life: "+",
            small: "•"
        };

        ctx.fillText(letters[p.type], 0, 3);
        ctx.restore();
    });
}

function drawLaser() {
    if (activePowerUps.laser <= 0) {
        return;
    }

    ctx.shadowBlur = 10;
    ctx.shadowColor = "#39ff14";
    ctx.strokeStyle = "#39ff14";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(paddle.x + 8, paddle.y);
    ctx.lineTo(paddle.x + 8, 0);
    ctx.moveTo(paddle.x + paddle.width - 8, paddle.y);
    ctx.lineTo(paddle.x + paddle.width - 8, 0);
    ctx.stroke();

    ctx.shadowBlur = 0;

    if (Math.random() < .18) {
        laserHit(paddle.x + 8);
    }

    if (Math.random() < .18) {
        laserHit(paddle.x + paddle.width - 8);
    }
}

function laserHit(x) {
    for (const brick of bricks) {
        if (brick.alive && x >= brick.x && x <= brick.x + brick.width) {
            brick.hits--;

            if (brick.hits <= 0) {
                brick.alive = false;
                score += 20;
                createParticles(x, brick.y + brick.height / 2, 5);
            }

            break;
        }
    }
}

function updateBoss(dt) {
    if (!boss || !boss.alive || !boss.active) {
        return;
    }

    boss.x += boss.dx * dt * 60;

    if (boss.x <= 10) {
        boss.x = 10;
        boss.dx = Math.abs(boss.dx);
    }

    if (boss.x + boss.width >= width - 10) {
        boss.x = width - boss.width - 10;
        boss.dx = -Math.abs(boss.dx);
    }

    boss.shotTimer -= dt * 60;

    if (boss.shotTimer <= 0) {
        boss.shotTimer = 100 - Math.min(45, wave * 3);

        powerUps.push({
            x: boss.x + Math.random() * boss.width,
            y: boss.y + boss.height,
            speed: 2.5,
            type: "small",
            spin: 0
        });
    }

    updateBossUI();
}

function hitBoss(b) {
    if (!boss || !boss.alive || !boss.active) {
        return false;
    }

    if (
        b.x + b.radius < boss.x ||
        b.x - b.radius > boss.x + boss.width ||
        b.y + b.radius < boss.y ||
        b.y - b.radius > boss.y + boss.height
    ) {
        return false;
    }

    if (!activePowerUps.fireball) {
        b.dy = -Math.abs(b.dy);
    }

    const damage = activePowerUps.fireball ? 3 : 1;
    boss.hp -= damage;

    score += 25 * damage;

    addPopup(`-${damage}`, b.x, boss.y);

    createParticles(b.x, b.y, 8);
    screenShake = 4;
    playSound(180, 0.05, "square", 0.035);

    updateBossUI();

    if (boss.hp <= 0) {
        boss.hp = 0;
        boss.alive = false;

        const bonus = 1000 * wave;
        score += bonus;

        addPopup(`BOSS +${bonus}`, width / 2, boss.y);

        createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 80);

        screenShake = 15;

        unlockAchievement("boss");

        playBossSound();
        updateBossUI();

        setTimeout(() => {
            if (!gameWon) {
                winGame();
            }
        }, 450);
    }

    updateUI();

    return true;
}

function drawBoss() {
    if (!boss || !boss.alive || !boss.active) {
        return;
    }

    ctx.save();

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff3b3b";
    ctx.fillStyle = "#ff3b3b";

    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

    ctx.fillStyle = "#050805";
    ctx.fillRect(boss.x + 12, boss.y + 8, boss.width - 24, 6);

    ctx.restore();
}

function updateMainBall() {
    const speedMultiplier = activePowerUps.slowBall > 0 ? 0.7 : 1;

    ball.x += ball.dx * speedMultiplier;
    ball.y += ball.dy * speedMultiplier;

    if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.dx = Math.abs(ball.dx);
        playSound(300, 0.025, "square", 0.02);
    }

    if (ball.x + ball.radius >= width) {
        ball.x = width - ball.radius;
        ball.dx = -Math.abs(ball.dx);
        playSound(300, 0.025, "square", 0.02);
    }

    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy);
        playSound(350, 0.025, "square", 0.02);
    }

    handlePaddleCollision(ball);

    if (boss && boss.alive) {
        hitBoss(ball);
    }

    if (gameRunning) {
        handleBrickCollision(ball);
    }

    if (ball.y - ball.radius > height) {
        loseLife();
    }
}

function loseLife() {
    if (gameWon) {
        return;
    }

    lives--;
    combo = 0;
    balls = [];

    setComboUI();

    playSound(120, 0.15, "sawtooth", 0.035);

    if (lives <= 0) {
        endGame();
        return;
    }

    resetBall();
    updateUI();
}

function updateExtraBalls(dt) {
    for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        const mult = activePowerUps.slowBall > 0 ? 0.7 : 1;

        b.x += b.dx * mult * dt * 60;
        b.y += b.dy * mult * dt * 60;

        if (b.x - b.radius <= 0) {
            b.x = b.radius;
            b.dx = Math.abs(b.dx);
        }

        if (b.x + b.radius >= width) {
            b.x = width - b.radius;
            b.dx = -Math.abs(b.dx);
        }

        if (b.y - b.radius <= 0) {
            b.y = b.radius;
            b.dy = Math.abs(b.dy);
        }

        handlePaddleCollision(b);

        if (boss && boss.alive) {
            hitBoss(b);
        }

        if (gameRunning) {
            handleBrickCollision(b);
        }

        if (b.y - b.radius > height) {
            balls.splice(i, 1);
            continue;
        }
    }
}

function resetBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 3;

    const direction = Math.random() < 0.5 ? -1 : 1;

    ball.speed = Math.min(2.2 + (wave - 1) * 0.12, 3.8);

    ball.dx = direction * (ball.speed * 0.55);
    ball.dy = -Math.sqrt(Math.max(1, ball.speed * ball.speed - ball.dx * ball.dx));

    balls = [];
}

function startGame() {
    initAudio();
    playStartSound();

    score = 0;
    lives = 5;
    wave = 1;
    combo = 0;
    comboTimer = 0;
    totalBricksBroken = 0;
    runTime = 0;
    gameOver = false;
    gameWon = false;
    gameRunning = true;
    paused = false;
    boss = null;
    particles = [];
    popups = [];
    powerUps = [];
    balls = [];

    activePowerUps = {
        bigPaddle: 0,
        slowBall: 0,
        fireball: 0,
        laser: 0,
        smallBall: 0
    };

    paddle.width = width * 0.18;
    paddle.x = width / 2 - paddle.width / 2;
    paddle.targetX = paddle.x;

    createBricks();
    resetBall();
    updateUI();
    setComboUI();
    setPauseUI();

    message.classList.add("hidden");

    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    gameLoop(lastTime);
}

function nextWave() {
    wave++;
    score += 500 * wave;
    combo = 0;
    comboTimer = 0;

    createBricks();
    resetBall();

    updateUI();
    setComboUI();

    playSound(700, .1, "square", .04);

    setTimeout(() => {
        playSound(900, .12, "square", .04);
    }, 100);
}

function checkWave() {
    const remaining = bricks.filter(b => b.alive).length;

    if (boss && boss.alive) {
        if (remaining > 0) {
            boss.active = false;
            updateBossUI();
            return;
        }

        if (remaining === 0 && !boss.active) {
            boss.active = true;
            boss.shotTimer = 60;

            playBossSound();
            updateBossUI();

            addPopup("BOSS BATTLE", width / 2, height * 0.35);
            createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 30);
        }

        return;
    }

    if (remaining === 0) {
        nextWave();
    }
}

function drawBackground() {
    ctx.fillStyle = "#050805";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(156,255,87,.035)";
    ctx.lineWidth = 1;

    const gridSize = 28;

    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawPaddle() {
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(57,255,20,.45)";
    ctx.fillStyle = "#f5f5dc";

    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#050805";

    ctx.fillRect(paddle.x + paddle.width / 2 - 1, paddle.y, 2, paddle.height);
}

function drawBall(b = ball) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#39ff14";
    ctx.fillStyle = activePowerUps.fireball > 0 ? "#f5f2dc" : "#39ff14";

    ctx.fill();

    ctx.shadowBlur = 0;
}

function drawBricks() {
    const colors = {
        normal: "#39ff14",
        strong: "#00d9ff",
        hard: "#ff3b3b",
        explosive: "#ff8c00",
        bonus: "#d946ef"
    };

    for (const brick of bricks) {
        if (!brick.alive) {
            continue;
        }

        const color = colors[brick.type] || "#39ff14";

        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color;

        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#050805";

        if (brick.maxHits > 1) {
            ctx.font = "bold 8px Courier New";
            ctx.textAlign = "center";
            ctx.fillText(brick.hits, brick.x + brick.width / 2, brick.y + brick.height - 4);
        }
    }
}

function draw() {
    ctx.save();

    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - .5) * screenShake,
            (Math.random() - .5) * screenShake
        );
    }

    drawBackground();
    drawBricks();
    drawBoss();
    drawPaddle();
    drawLaser();
    drawBall();

    balls.forEach(drawBall);

    drawPowerUps();
    drawParticles();

    ctx.restore();
}

function gameLoop(timestamp) {
    if (!gameRunning) {
        return;
    }

    const dt = Math.min((timestamp - lastTime) / 1000, .035);
    lastTime = timestamp;

    if (!paused) {
        runTime += dt;

        updatePaddle();
        updateMainBall(dt);
        updateExtraBalls(dt);
        updatePowerUps(dt);
        updatePowerEffects();
        updateBoss(dt);
        updateParticles(dt);

        if (comboTimer > 0) {
            comboTimer -= dt * 60;
        } else if (combo > 0) {
            combo = 0;
            setComboUI();
        }

        checkAchievements();
        checkWave();
    }

    draw();
    setPauseUI();

    animationId = requestAnimationFrame(gameLoop);
}

const achievements = {
    first: "FIRST BLOOD",
    combo10: "COMBO MASTER",
    speed: "SPEED DEMON",
    survivor: "SURVIVOR",
    king: "BREAKOUT KING",
    boss: "BOSS SLAYER"
};

function unlockAchievement(key) {
    const unlocked = JSON.parse(localStorage.getItem("dg_breakout_achievements") || "[]");

    if (unlocked.includes(key)) {
        return;
    }

    unlocked.push(key);

    localStorage.setItem("dg_breakout_achievements", JSON.stringify(unlocked));

    score += 250;

    addPopup(`ACHIEVEMENT: ${achievements[key]}`, width / 2, height * .45);

    playPowerUpSound();
}

function checkAchievements() {
    if (totalBricksBroken >= 1) {
        unlockAchievement("first");
    }

    if (combo >= 10) {
        unlockAchievement("combo10");
    }

    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

    if (speed >= BALL_MAX_SPEED * .98) {
        unlockAchievement("speed");
    }

    if (runTime >= 600) {
        unlockAchievement("survivor");
    }

    if (score >= 50000) {
        unlockAchievement("king");
    }
}

function winGame() {
    if (gameWon) {
        return;
    }

    gameWon = true;
    gameRunning = false;
    gameOver = false;
    paused = false;

    updateBossUI();

    score += 2500;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("dg_breakout_best", bestScore);
    }

    updateUI();

    playSound(440, 0.12, "square", 0.045);

    setTimeout(() => {
        playSound(660, 0.12, "square", 0.045);
    }, 120);

    setTimeout(() => {
        playSound(880, 0.20, "square", 0.05);
    }, 240);

    messageTitle.textContent = "YOU WIN";
    messageSubtitle.textContent = `FINAL SCORE ${score.toLocaleString("tr-TR")} • BOSS DESTROYED`;

    message.classList.remove("hidden");

    saveScore();
}

function endGame() {
    gameRunning = false;
    gameOver = true;

    stopMusic();
    playGameOverSound();

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("dg_breakout_best", bestScore);
    }

    updateUI();

    messageTitle.textContent = "GAME OVER";
    messageSubtitle.textContent = `SCORE ${score.toLocaleString("tr-TR")} • TAP TO PLAY AGAIN`;

    message.classList.remove("hidden");

    saveScore();
}

async function saveScore() {
    try {
        let { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            const { data, error } = await supabaseClient.auth.signInAnonymously();

            if (error) {
                console.error("Anonymous giriş hatası:", error);
                return;
            }

            user = data.user;
        }

        if (!user || score <= 0) {
            return;
        }

        const username = "PLAYER-" + user.id.substring(0, 6).toUpperCase();

        const { error: profileError } = await supabaseClient
            .from("profiles")
            .upsert({ id: user.id, username });

        if (profileError) {
            console.error("Profile hatası:", profileError);
            return;
        }

        const { error: scoreError } = await supabaseClient
            .from("scores")
            .insert({ user_id: user.id, score, game: "breakout" });

        if (scoreError) {
            console.error("Breakout skor hatası:", scoreError);
        } else {
            console.log("✅ Breakout skoru leaderboard'a kaydedildi:", score);
        }
    } catch (error) {
        console.error("Supabase hata:", error);
    }
}

function updateUI() {
    scoreElement.textContent = score.toLocaleString("tr-TR");
    bestElement.textContent = bestScore.toLocaleString("tr-TR");
    livesElement.textContent = lives;
    levelElement.textContent = "WAVE " + String(wave).padStart(2, "0");

    updateBossUI();
}

const keys = {
    left: false,
    right: false
};

function updateKeyboard() {
    if (keys.left) {
        paddle.targetX -= paddle.speed;
    }

    if (keys.right) {
        paddle.targetX += paddle.speed;
    }

    paddle.targetX = Math.max(0, Math.min(width - paddle.width, paddle.targetX));
}

function updatePaddle() {
    updateKeyboard();

    paddle.x += (paddle.targetX - paddle.x) * 0.10;
    paddle.x = Math.max(0, Math.min(width - paddle.width, paddle.x));
}

window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (event.key === "ArrowLeft" || key === "a") {
        keys.left = true;
        event.preventDefault();
    }

    if (event.key === "ArrowRight" || key === "d") {
        keys.right = true;
        event.preventDefault();
    }

    if (key === "p" && gameRunning) {
        paused = !paused;
        setPauseUI();
    }

    if ((event.key === " " || event.key === "Enter") && !gameRunning) {
        event.preventDefault();
        handleStart();
    }
});

window.addEventListener("keyup", event => {
    const key = event.key.toLowerCase();

    if (event.key === "ArrowLeft" || key === "a") {
        keys.left = false;
    }

    if (event.key === "ArrowRight" || key === "d") {
        keys.right = false;
    }
});

canvas.addEventListener("touchmove", event => {
    event.preventDefault();

    const touch = event.touches[0];
    if (!touch) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    paddle.targetX = touchX - paddle.width / 2;
}, { passive: false });

function handleStart() {
    initAudio();

    if (!gameRunning) {
        startGame();
    }
}

canvas.addEventListener("click", handleStart);

canvas.addEventListener("touchstart", event => {
    event.preventDefault();
    handleStart();
}, { passive: false });

makeDynamicUI();
resizeCanvas();
updateUI();
draw();

console.log("Doğu Games - Breakout Deluxe hazır! 🧱");