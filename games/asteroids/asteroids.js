// ============================================================
// DOĞU GAMES — ASTEROIDS
// Geliştirilmiş sürüm: parallax yıldızlar, ekran sarsıntısı,
// gemi izi, patlama flaşları, combo sistemi, level-up efekti
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameWrapper = document.querySelector(".game-wrapper");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const livesElement = document.getElementById("lives");
const waveElement = document.getElementById("wave");

const scoreBoxElement = document.getElementById("scoreBox");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySubtitle = document.getElementById("overlaySubtitle");
const overlayScore = document.getElementById("overlayScore");
const overlayNewBest = document.getElementById("overlayNewBest");

const comboTag = document.getElementById("comboTag");


// ============================================================
// CANVAS
// ============================================================

let width = 800;
let height = 520;

function resizeCanvas() {

    const rect = gameWrapper.getBoundingClientRect();

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    buildStarField();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// GAME STATE
// ============================================================

let gameRunning = false;

let score = 0;

let best =
    Number(
        localStorage.getItem(
            "doguAsteroidsBest"
        )
    ) || 0;

let lives = 3;

let wave = 1;

let gameOver = false;

let lastTime = 0;

let waveTimer = 0;

// --- YENİ: combo / streak sistemi ---

let comboCount = 0;

let comboTimer = 0;

const COMBO_WINDOW = 1.1;

// --- YENİ: ekran sarsıntısı ---

let shakeAmount = 0;

let shakeTime = 0;

// --- YENİ: level-up flash ---

let waveFlashTimer = 0;

// --- YENİ: puan uçuşan yazılar ---

let floatingTexts = [];

// --- YENİ: patlama flaşları (ışık halkaları) ---

let flashes = [];

// --- YENİ: arka plan parallax yıldız tabakaları ---

let starLayers = [];


// ============================================================
// PLAYER
// ============================================================

const player = {

    x: width / 2,

    y: height / 2,

    radius: 13,

    angle: -Math.PI / 2,

    velocityX: 0,

    velocityY: 0,

    rotationSpeed: 3.1,

    thrust: 185,

    friction: 0.985,

    maxSpeed: 310,

    invulnerable: 0,

    fireCooldown: 0,

    // YENİ: gemi izi (trail) noktaları

    trail: []

};


// ============================================================
// ARRAYS
// ============================================================

let asteroids = [];

let bullets = [];

let particles = [];


// ============================================================
// INPUT
// ============================================================

const keys = {};

document.addEventListener(
    "keydown",
    function(event) {

        keys[event.code] = true;

        if (
            [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "Space"
            ].includes(event.code)
        ) {
            event.preventDefault();
        }

        if (
            event.code === "Space" &&
            !gameRunning
        ) {
            startGame();
        }

    }
);

document.addEventListener(
    "keyup",
    function(event) {

        keys[event.code] = false;

    }
);


// ============================================================
// OVERLAY
// ============================================================

overlay.addEventListener(
    "click",
    function() {

        if (!gameRunning) {
            startGame();
        }

    }
);


// ============================================================
// TOUCH CONTROLS (mobil dokunmatik butonlar)
// ============================================================

function bindTouchButton(id, code) {

    const el =
        document.getElementById(id);

    if (!el) {
        return;
    }

    const press = function(event) {

        event.preventDefault();

        keys[code] = true;

        el.classList.add("active");

        if (
            code === "Space" &&
            !gameRunning
        ) {
            startGame();
        }
    };

    const release = function(event) {

        event.preventDefault();

        keys[code] = false;

        el.classList.remove("active");
    };

    el.addEventListener("touchstart", press, { passive: false });
    el.addEventListener("touchend", release, { passive: false });
    el.addEventListener("touchcancel", release, { passive: false });

    el.addEventListener("mousedown", press);
    el.addEventListener("mouseup", release);
    el.addEventListener("mouseleave", release);
}

bindTouchButton("btnLeft", "ArrowLeft");
bindTouchButton("btnRight", "ArrowRight");
bindTouchButton("btnUp", "ArrowUp");
bindTouchButton("btnFire", "Space");


// ============================================================
// UTILS
// ============================================================

function random(min, max) {

    return (
        Math.random() *
        (max - min) +
        min
    );
}


function distance(
    x1,
    y1,
    x2,
    y2
) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


function wrapObject(object) {

    if (object.x < -object.radius) {
        object.x = width + object.radius;
    }

    if (object.x > width + object.radius) {
        object.x = -object.radius;
    }

    if (object.y < -object.radius) {
        object.y = height + object.radius;
    }

    if (object.y > height + object.radius) {
        object.y = -object.radius;
    }
}


// ============================================================
// YENİ: EKRAN SARSINTISI
// ============================================================

function triggerShake(amount, duration) {

    shakeAmount =
        Math.max(shakeAmount, amount);

    shakeTime =
        Math.max(shakeTime, duration);
}


function updateShake(dt) {

    if (shakeTime > 0) {

        shakeTime -= dt;

        if (shakeTime <= 0) {

            shakeTime = 0;

            shakeAmount = 0;
        }
    }
}


// ============================================================
// YENİ: PARALLAX YILDIZ TABAKALARI
// ============================================================

function buildStarField() {

    starLayers = [
        {
            count: 45,
            speed: 4,
            size: 1,
            alpha: 0.35,
            stars: []
        },
        {
            count: 28,
            speed: 10,
            size: 1.4,
            alpha: 0.5,
            stars: []
        },
        {
            count: 14,
            speed: 20,
            size: 1.9,
            alpha: 0.75,
            stars: []
        }
    ];

    for (const layer of starLayers) {

        for (
            let i = 0;
            i < layer.count;
            i++
        ) {

            layer.stars.push({

                x: random(0, width),

                y: random(0, height),

                twinklePhase:
                    random(0, Math.PI * 2),

                twinkleSpeed:
                    random(1.2, 3.2)

            });
        }
    }
}


function updateStarField(dt) {

    for (const layer of starLayers) {

        for (const star of layer.stars) {

            // Gemi hızının tersine hafif kayma -> derinlik hissi

            star.x -=
                (player.velocityX / 60) *
                (layer.speed / 20) *
                dt *
                6;

            star.y -=
                (player.velocityY / 60) *
                (layer.speed / 20) *
                dt *
                6;

            star.x -= layer.speed * dt * 0.6;

            star.twinklePhase +=
                star.twinkleSpeed * dt;

            if (star.x < 0) {
                star.x += width;
            }

            if (star.x > width) {
                star.x -= width;
            }

            if (star.y < 0) {
                star.y += height;
            }

            if (star.y > height) {
                star.y -= height;
            }
        }
    }
}


function drawStarField() {

    ctx.save();

    for (const layer of starLayers) {

        for (const star of layer.stars) {

            const twinkle =
                0.6 +
                Math.sin(star.twinklePhase) *
                0.4;

            ctx.globalAlpha =
                layer.alpha * twinkle;

            ctx.fillStyle =
                "#c9cabf";

            ctx.fillRect(
                star.x,
                star.y,
                layer.size,
                layer.size
            );
        }
    }

    ctx.restore();
}


// ============================================================
// SCORE
// ============================================================

function bumpScoreDisplay() {

    scoreElement.classList.add("bump");

    scoreBoxElement.classList.add("pulse");

    setTimeout(
        function() {

            scoreElement.classList.remove("bump");

            scoreBoxElement.classList.remove("pulse");

        },
        160
    );
}


function addScore(points, worldX, worldY) {

    // YENİ: combo çarpanı

    comboCount++;

    comboTimer = COMBO_WINDOW;

    const multiplier =
        1 + Math.floor(comboCount / 3) * 0.5;

    const finalPoints =
        Math.round(points * multiplier);

    score += finalPoints;

    scoreElement.textContent =
        score.toLocaleString("tr-TR");

    bumpScoreDisplay();

    if (
        worldX !== undefined &&
        worldY !== undefined
    ) {

        spawnFloatingText(
            worldX,
            worldY,
            "+" + finalPoints
        );
    }

    if (comboCount >= 3) {

        comboTag.textContent =
            "COMBO x" +
            multiplier.toFixed(1).replace(".0", "");

        comboTag.classList.add("show");
    }

    if (score > best) {

        best = score;

        bestElement.textContent =
            best.toLocaleString("tr-TR");

        localStorage.setItem(
            "doguAsteroidsBest",
            best
        );
    }
}


function updateCombo(dt) {

    if (comboTimer > 0) {

        comboTimer -= dt;

        if (comboTimer <= 0) {

            comboCount = 0;

            comboTag.classList.remove("show");
        }
    }
}


// ============================================================
// YENİ: UÇUŞAN PUAN YAZILARI
// ============================================================

function spawnFloatingText(x, y, text) {

    floatingTexts.push({

        x: x,

        y: y,

        text: text,

        life: 0.75,

        maxLife: 0.75

    });
}


function updateFloatingTexts(dt) {

    for (
        let i = floatingTexts.length - 1;
        i >= 0;
        i--
    ) {

        const item =
            floatingTexts[i];

        item.y -= 34 * dt;

        item.life -= dt;

        if (item.life <= 0) {

            floatingTexts.splice(i, 1);
        }
    }
}


function drawFloatingTexts() {

    ctx.save();

    ctx.font =
        "bold 13px 'Courier New', monospace";

    ctx.textAlign = "center";

    for (const item of floatingTexts) {

        const alpha =
            Math.max(0, item.life / item.maxLife);

        ctx.globalAlpha = alpha;

        ctx.fillStyle = "#39ff14";

        ctx.shadowBlur = 6;

        ctx.shadowColor = "#39ff14";

        ctx.fillText(
            item.text,
            item.x,
            item.y
        );
    }

    ctx.restore();
}


// ============================================================
// YENİ: PATLAMA IŞIK FLAŞLARI (halka)
// ============================================================

function spawnFlash(x, y, maxRadius, color) {

    flashes.push({

        x: x,

        y: y,

        radius: 2,

        maxRadius: maxRadius,

        life: 0.35,

        maxLife: 0.35,

        color: color || "#39ff14"

    });
}


function updateFlashes(dt) {

    for (
        let i = flashes.length - 1;
        i >= 0;
        i--
    ) {

        const flash =
            flashes[i];

        flash.life -= dt;

        const progress =
            1 - Math.max(0, flash.life / flash.maxLife);

        flash.radius =
            2 + progress * flash.maxRadius;

        if (flash.life <= 0) {

            flashes.splice(i, 1);
        }
    }
}


function drawFlashes() {

    ctx.save();

    for (const flash of flashes) {

        const alpha =
            Math.max(0, flash.life / flash.maxLife);

        ctx.globalAlpha = alpha * 0.8;

        ctx.strokeStyle = flash.color;

        ctx.lineWidth = 2;

        ctx.shadowBlur = 14;

        ctx.shadowColor = flash.color;

        ctx.beginPath();

        ctx.arc(
            flash.x,
            flash.y,
            flash.radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }

    ctx.restore();
}


// ============================================================
// CREATE ASTEROID
// ============================================================

function createAsteroid(
    x,
    y,
    size = 3
) {

    const radius =
        size === 3
            ? random(32, 43)
            : size === 2
                ? random(20, 28)
                : random(11, 16);

    let angle =
        random(
            0,
            Math.PI * 2
        );

    let speed;

    if (size === 3) {
        speed = random(25, 55);
    }
    else if (size === 2) {
        speed = random(40, 80);
    }
    else {
        speed = random(65, 115);
    }

    speed +=
        (wave - 1) * 4;

    return {

        x: x,

        y: y,

        radius: radius,

        size: size,

        velocityX:
            Math.cos(angle) * speed,

        velocityY:
            Math.sin(angle) * speed,

        rotation:
            random(0, Math.PI * 2),

        rotationSpeed:
            random(-1.2, 1.2),

        vertices:
            createAsteroidShape(),

        // YENİ: her asteroid biraz farklı bir yeşil tonu / kalınlıkta olsun

        hue:
            random(-6, 10),

        wobble:
            random(0.9, 1.15)

    };
}


// ============================================================
// ASTEROID SHAPE
// ============================================================

function createAsteroidShape() {

    const points = [];

    const count =
        Math.floor(
            random(8, 12)
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        points.push({
            angle:
                (Math.PI * 2 / count) * i,

            radius:
                random(
                    0.72,
                    1.15
                )
        });

    }

    return points;
}


// ============================================================
// CREATE WAVE
// ============================================================

function createWave() {

    asteroids = [];

    const count =
        Math.min(
            3 + wave,
            10
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        let x;
        let y;

        do {

            x =
                random(
                    0,
                    width
                );

            y =
                random(
                    0,
                    height
                );

        }
        while (
            distance(
                x,
                y,
                player.x,
                player.y
            ) < 170
        );

        asteroids.push(
            createAsteroid(
                x,
                y,
                3
            )
        );
    }

    waveElement.textContent =
        String(wave).padStart(2, "0");
}


// ============================================================
// YENİ: WAVE FLASH (yeni dalga başladığında ekranda yeşil vurgu)
// ============================================================

function triggerWaveFlash() {

    waveFlashTimer = 0.6;

    const waveLabel =
        document.getElementById("wave");

    waveLabel.classList.add("flash");

    setTimeout(
        function() {

            waveLabel.classList.remove("flash");

        },
        600
    );
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

    gameRunning = true;

    gameOver = false;

    score = 0;

    lives = 3;

    wave = 1;

    comboCount = 0;

    comboTimer = 0;

    comboTag.classList.remove("show");

    scoreElement.textContent = "0";

    livesElement.textContent = "3";

    livesElement.classList.remove("low");

    waveElement.textContent = "01";

    player.x = width / 2;
    player.y = height / 2;

    player.velocityX = 0;
    player.velocityY = 0;

    player.angle = -Math.PI / 2;

    player.invulnerable = 2;

    player.fireCooldown = 0;

    player.trail = [];

    bullets = [];

    particles = [];

    floatingTexts = [];

    flashes = [];

    shakeAmount = 0;

    shakeTime = 0;

    overlayNewBest.classList.remove("show");

    createWave();

    overlay.style.opacity = "0";

    setTimeout(
        function() {

            overlay.style.display = "none";

        },
        200
    );

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}


// ============================================================
// GAME OVER
// ============================================================

function endGame() {

    gameRunning = false;

    gameOver = true;

    overlay.style.display =
        "flex";

    requestAnimationFrame(
        function() {

            overlay.style.opacity = "1";

        }
    );

    overlayTitle.innerHTML =
        "GAME <span>OVER</span>";

    overlaySubtitle.textContent =
        "TAP TO PLAY AGAIN";

    overlayScore.textContent =
        `SCORE ${score.toLocaleString("tr-TR")}`;

    if (score > 0 && score === best) {

        overlayNewBest.classList.add("show");
    }
    else {

        overlayNewBest.classList.remove("show");
    }

    triggerShake(14, 0.4);
}


// ============================================================
// PLAYER EXPLOSION
// ============================================================

function destroyPlayer() {

    createExplosion(
        player.x,
        player.y,
        32
    );

    spawnFlash(
        player.x,
        player.y,
        70,
        "#f4f3df"
    );

    triggerShake(11, 0.35);

    comboCount = 0;

    comboTag.classList.remove("show");

    lives--;

    livesElement.textContent =
        lives;

    if (lives <= 1) {

        livesElement.classList.add("low");
    }

    if (lives <= 0) {

        endGame();

        return;
    }

    player.x =
        width / 2;

    player.y =
        height / 2;

    player.velocityX = 0;

    player.velocityY = 0;

    player.angle =
        -Math.PI / 2;

    player.invulnerable =
        2.5;

    player.trail = [];
}


// ============================================================
// SHOOT
// ============================================================

function shoot() {

    if (
        player.fireCooldown > 0
    ) {
        return;
    }

    const speed = 430;

    const noseX =
        player.x +
        Math.cos(player.angle) *
        player.radius;

    const noseY =
        player.y +
        Math.sin(player.angle) *
        player.radius;

    bullets.push({

        x: noseX,

        y: noseY,

        radius: 2,

        velocityX:
            Math.cos(player.angle) *
            speed +
            player.velocityX * 0.3,

        velocityY:
            Math.sin(player.angle) *
            speed +
            player.velocityY * 0.3,

        life: 1.25,

        // YENİ: küçük iz kuyruğu için önceki pozisyon

        trailX: noseX,

        trailY: noseY

    });

    player.fireCooldown =
        0.16;

    // YENİ: küçük namlu parıltısı

    particles.push({

        x: noseX,

        y: noseY,

        velocityX:
            Math.cos(player.angle) * 40,

        velocityY:
            Math.sin(player.angle) * 40,

        life: 0.08,

        maxLife: 0.08,

        radius: 3

    });
}


// ============================================================
// CREATE EXPLOSION
// ============================================================

function createExplosion(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            random(
                0,
                Math.PI * 2
            );

        const speed =
            random(
                30,
                170
            );

        particles.push({

            x: x,

            y: y,

            velocityX:
                Math.cos(angle) *
                speed,

            velocityY:
                Math.sin(angle) *
                speed,

            life:
                random(
                    0.3,
                    0.8
                ),

            maxLife: 0.8,

            radius:
                random(
                    1,
                    3
                )

        });
    }
}


// ============================================================
// UPDATE PLAYER
// ============================================================

function updatePlayer(dt) {

    if (
        keys["ArrowLeft"]
    ) {

        player.angle -=
            player.rotationSpeed *
            dt;
    }

    if (
        keys["ArrowRight"]
    ) {

        player.angle +=
            player.rotationSpeed *
            dt;
    }


    if (
        keys["ArrowUp"]
    ) {

        player.velocityX +=
            Math.cos(
                player.angle
            ) *
            player.thrust *
            dt;

        player.velocityY +=
            Math.sin(
                player.angle
            ) *
            player.thrust *
            dt;

        createThrusterParticle();
    }


    const speed =
        Math.sqrt(
            player.velocityX *
            player.velocityX +
            player.velocityY *
            player.velocityY
        );

    if (
        speed >
        player.maxSpeed
    ) {

        player.velocityX =
            player.velocityX /
            speed *
            player.maxSpeed;

        player.velocityY =
            player.velocityY /
            speed *
            player.maxSpeed;
    }


    player.velocityX *=
        Math.pow(
            player.friction,
            dt * 60
        );

    player.velocityY *=
        Math.pow(
            player.friction,
            dt * 60
        );


    player.x +=
        player.velocityX *
        dt;

    player.y +=
        player.velocityY *
        dt;


    wrapObject(player);


    // YENİ: gemi izi güncelle

    player.trail.push({
        x: player.x,
        y: player.y
    });

    if (player.trail.length > 10) {

        player.trail.shift();
    }


    if (
        keys["Space"]
    ) {

        shoot();
    }


    if (
        player.fireCooldown > 0
    ) {

        player.fireCooldown -=
            dt;
    }


    if (
        player.invulnerable > 0
    ) {

        player.invulnerable -=
            dt;
    }

}


// ============================================================
// THRUSTER PARTICLE
// ============================================================

function createThrusterParticle() {

    const backAngle =
        player.angle +
        Math.PI;

    const spread =
        random(-0.28, 0.28);

    const x =
        player.x +
        Math.cos(backAngle) *
        11;

    const y =
        player.y +
        Math.sin(backAngle) *
        11;

    const speed =
        random(
            30,
            90
        );

    particles.push({

        x: x,

        y: y,

        velocityX:
            Math.cos(backAngle + spread) *
            speed,

        velocityY:
            Math.sin(backAngle + spread) *
            speed,

        life: 0.22,

        maxLife: 0.22,

        radius:
            random(1, 2.4),

        // YENİ: turbo alevi rengi için işaret

        flame: true

    });
}


// ============================================================
// UPDATE BULLETS
// ============================================================

function updateBullets(dt) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.trailX = bullet.x;

        bullet.trailY = bullet.y;

        bullet.x +=
            bullet.velocityX *
            dt;

        bullet.y +=
            bullet.velocityY *
            dt;

        bullet.life -=
            dt;

        wrapObject(bullet);

        if (
            bullet.life <= 0
        ) {

            bullets.splice(
                i,
                1
            );
        }
    }
}


// ============================================================
// UPDATE ASTEROIDS
// ============================================================

function updateAsteroids(dt) {

    for (
        const asteroid of asteroids
    ) {

        asteroid.x +=
            asteroid.velocityX *
            dt;

        asteroid.y +=
            asteroid.velocityY *
            dt;

        asteroid.rotation +=
            asteroid.rotationSpeed *
            dt;

        wrapObject(asteroid);
    }
}


// ============================================================
// UPDATE PARTICLES
// ============================================================

function updateParticles(dt) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.velocityX *
            dt;

        particle.y +=
            particle.velocityY *
            dt;

        particle.velocityX *=
            0.96;

        particle.velocityY *=
            0.96;

        particle.life -=
            dt;

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


// ============================================================
// COLLISIONS
// ============================================================

function checkCollisions() {

    // --------------------------------------------------------
    // BULLET VS ASTEROID
    // --------------------------------------------------------

    for (
        let b = bullets.length - 1;
        b >= 0;
        b--
    ) {

        const bullet =
            bullets[b];

        let hit = false;

        for (
            let a = asteroids.length - 1;
            a >= 0;
            a--
        ) {

            const asteroid =
                asteroids[a];

            const d =
                distance(
                    bullet.x,
                    bullet.y,
                    asteroid.x,
                    asteroid.y
                );

            if (
                d <
                asteroid.radius
            ) {

                bullets.splice(
                    b,
                    1
                );

                createExplosion(
                    asteroid.x,
                    asteroid.y,
                    asteroid.size === 3
                        ? 14
                        : 9
                );

                spawnFlash(
                    asteroid.x,
                    asteroid.y,
                    asteroid.size === 3
                        ? 55
                        : asteroid.size === 2
                            ? 38
                            : 24,
                    "#39ff14"
                );

                triggerShake(
                    asteroid.size === 3 ? 6 : 3,
                    0.18
                );


                // SCORE

                if (
                    asteroid.size === 3
                ) {

                    addScore(100, asteroid.x, asteroid.y);
                }
                else if (
                    asteroid.size === 2
                ) {

                    addScore(50, asteroid.x, asteroid.y);
                }
                else {

                    addScore(25, asteroid.x, asteroid.y);
                }


                // SPLIT

                if (
                    asteroid.size > 1
                ) {

                    const newSize =
                        asteroid.size - 1;

                    asteroids.push(
                        createAsteroid(
                            asteroid.x,
                            asteroid.y,
                            newSize
                        )
                    );

                    asteroids.push(
                        createAsteroid(
                            asteroid.x,
                            asteroid.y,
                            newSize
                        )
                    );
                }


                asteroids.splice(
                    a,
                    1
                );

                hit = true;

                break;
            }
        }

        if (hit) {
            continue;
        }
    }


    // --------------------------------------------------------
    // PLAYER VS ASTEROID
    // --------------------------------------------------------

    if (
        player.invulnerable <= 0
    ) {

        for (
            const asteroid of asteroids
        ) {

            const d =
                distance(
                    player.x,
                    player.y,
                    asteroid.x,
                    asteroid.y
                );

            if (
                d <
                player.radius +
                asteroid.radius * 0.75
            ) {

                destroyPlayer();

                break;
            }
        }
    }
}


// ============================================================
// NEXT WAVE
// ============================================================

function checkWave() {

    if (
        asteroids.length === 0 &&
        gameRunning
    ) {

        wave++;

        waveElement.textContent =
            String(wave).padStart(2, "0");

        player.invulnerable =
            1.5;

        triggerWaveFlash();

        createWave();
    }
}


// ============================================================
// DRAW PLAYER
// ============================================================

function drawPlayerTrail() {

    if (player.trail.length < 2) {
        return;
    }

    ctx.save();

    for (
        let i = 0;
        i < player.trail.length;
        i++
    ) {

        const point =
            player.trail[i];

        const alpha =
            (i / player.trail.length) * 0.22;

        ctx.globalAlpha = alpha;

        ctx.fillStyle = "#39ff14";

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}


function drawPlayer() {

    drawPlayerTrail();

    if (
        player.invulnerable > 0 &&
        Math.floor(
            player.invulnerable * 10
        ) % 2 === 0
    ) {
        return;
    }

    // YENİ: itiş alevi (thrust flame) çizimi

    if (
        keys["ArrowUp"] &&
        gameRunning
    ) {

        ctx.save();

        ctx.translate(
            player.x,
            player.y
        );

        ctx.rotate(
            player.angle
        );

        const flicker =
            random(0.75, 1.15);

        ctx.beginPath();

        ctx.moveTo(-7, -4.5);

        ctx.lineTo(
            -11 - 13 * flicker,
            0
        );

        ctx.lineTo(-7, 4.5);

        ctx.closePath();

        const flameGradient =
            ctx.createLinearGradient(
                -7, 0,
                -11 - 13 * flicker, 0
            );

        flameGradient.addColorStop(0, "rgba(57,255,20,0.85)");

        flameGradient.addColorStop(1, "rgba(255,210,63,0)");

        ctx.fillStyle = flameGradient;

        ctx.shadowBlur = 10;

        ctx.shadowColor = "#39ff14";

        ctx.fill();

        ctx.restore();
    }

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(
        player.angle
    );

    ctx.beginPath();

    ctx.moveTo(
        16,
        0
    );

    ctx.lineTo(
        -11,
        -9
    );

    ctx.lineTo(
        -7,
        0
    );

    ctx.lineTo(
        -11,
        9
    );

    ctx.closePath();

    // YENİ: hafif dolgu ile gövdeye derinlik

    ctx.fillStyle =
        "rgba(57,255,20,0.07)";

    ctx.fill();

    ctx.strokeStyle =
        "#f4f3df";

    ctx.lineWidth = 2;

    ctx.shadowBlur = 9;

    ctx.shadowColor =
        "#39ff14";

    ctx.stroke();

    // YENİ: kokpit noktası

    ctx.beginPath();

    ctx.arc(4, 0, 1.6, 0, Math.PI * 2);

    ctx.fillStyle = "#39ff14";

    ctx.shadowBlur = 6;

    ctx.fill();

    ctx.restore();
}


// ============================================================
// DRAW ASTEROID
// ============================================================

function drawAsteroid(
    asteroid
) {

    ctx.save();

    ctx.translate(
        asteroid.x,
        asteroid.y
    );

    ctx.rotate(
        asteroid.rotation
    );

    ctx.beginPath();

    asteroid.vertices.forEach(
        (point, index) => {

            const x =
                Math.cos(
                    point.angle
                ) *
                asteroid.radius *
                point.radius;

            const y =
                Math.sin(
                    point.angle
                ) *
                asteroid.radius *
                point.radius;

            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }
            else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );

    ctx.closePath();

    // YENİ: çok hafif iç gölgeleme, taş dokusu hissi

    ctx.fillStyle =
        "rgba(139,143,132,0.035)";

    ctx.fill();

    ctx.strokeStyle =
        "#888c84";

    ctx.lineWidth =
        asteroid.size === 3
            ? 2
            : 1.5;

    ctx.shadowBlur = 5;

    ctx.shadowColor =
        "rgba(57,255,20,0.2)";

    ctx.stroke();

    // YENİ: iç kraterler (küçük çizgiler) — büyük asteroidlerde

    if (asteroid.size === 3) {

        ctx.globalAlpha = 0.4;

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
            -asteroid.radius * 0.3,
            -asteroid.radius * 0.2
        );

        ctx.lineTo(
            asteroid.radius * 0.15,
            asteroid.radius * 0.35
        );

        ctx.stroke();
    }

    ctx.restore();
}


// ============================================================
// DRAW BULLET
// ============================================================

function drawBullet(
    bullet
) {

    // YENİ: kısa ışık çizgisi (tracer)

    ctx.save();

    ctx.strokeStyle = "#39ff14";

    ctx.globalAlpha = 0.5;

    ctx.lineWidth = 1.4;

    ctx.beginPath();

    ctx.moveTo(bullet.trailX, bullet.trailY);

    ctx.lineTo(bullet.x, bullet.y);

    ctx.stroke();

    ctx.restore();

    ctx.beginPath();

    ctx.arc(
        bullet.x,
        bullet.y,
        bullet.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#39ff14";

    ctx.shadowBlur = 8;

    ctx.shadowColor =
        "#39ff14";

    ctx.fill();

    ctx.shadowBlur = 0;
}


// ============================================================
// DRAW PARTICLES
// ============================================================

function drawParticles() {

    for (
        const particle of particles
    ) {

        const alpha =
            Math.max(
                0,
                particle.life /
                particle.maxLife
            );

        ctx.globalAlpha =
            alpha;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        // YENİ: itiş parçacıkları sıcak (sarı-yeşil), patlamalar yeşil

        ctx.fillStyle =
            particle.flame
                ? "#ffd23f"
                : "#39ff14";

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


// ============================================================
// DRAW
// ============================================================

function draw() {

    ctx.save();

    // YENİ: ekran sarsıntısı uygulaması

    if (shakeAmount > 0) {

        const dx =
            random(-shakeAmount, shakeAmount);

        const dy =
            random(-shakeAmount, shakeAmount);

        ctx.translate(dx, dy);
    }

    ctx.clearRect(
        -20,
        -20,
        width + 40,
        height + 40
    );

    drawStarField();

    drawFlashes();

    for (
        const asteroid of asteroids
    ) {

        drawAsteroid(
            asteroid
        );
    }

    for (
        const bullet of bullets
    ) {

        drawBullet(
            bullet
        );
    }

    drawPlayer();

    drawParticles();

    drawFloatingTexts();

    ctx.restore();
}


// ============================================================
// GAME LOOP
// ============================================================

function gameLoop(timestamp) {

    if (!gameRunning) {

        draw();

        return;
    }

    let dt =
        (timestamp - lastTime) /
        1000;

    lastTime =
        timestamp;

    dt =
        Math.min(
            dt,
            0.033
        );


    updatePlayer(dt);

    updateBullets(dt);

    updateAsteroids(dt);

    updateParticles(dt);

    updateStarField(dt);

    updateShake(dt);

    updateCombo(dt);

    updateFloatingTexts(dt);

    updateFlashes(dt);

    checkCollisions();

    checkWave();

    draw();


    requestAnimationFrame(
        gameLoop
    );
}


// ============================================================
// INITIAL DISPLAY
// ============================================================

resizeCanvas();

bestElement.textContent =
    best.toLocaleString("tr-TR");

livesElement.textContent =
    "3";

waveElement.textContent =
    "01";


// İlk çizim

draw();