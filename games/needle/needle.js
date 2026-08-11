// ==========================================
// DOĞU GAMES - İĞNE SAPLAMA
// ==========================================

(function () {

    "use strict";


    // ==========================================
    // SUPABASE
    // ==========================================

    const SUPABASE_URL =
        "https://zvxzfwftwvkjvqvdqabo.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_GF0KjdrmsluAuSDW9SmkLg_svFg1SrL";


    let doguGamesSupabase = null;


    // ==========================================
    // SUPABASE BAĞLANTISI
    // ==========================================

    async function initSupabase() {

        if (doguGamesSupabase) {

            return doguGamesSupabase;

        }


        if (!window.supabase) {

            console.error(
                "Supabase kütüphanesi yüklenemedi."
            );

            return null;

        }


        doguGamesSupabase =
            window.supabase.createClient(

                SUPABASE_URL,

                SUPABASE_PUBLISHABLE_KEY

            );


        return doguGamesSupabase;

    }


    // ==========================================
    // SKORU SUPABASE'E KAYDET
    // ==========================================

    async function saveScoreToSupabase(
        finalScore
    ) {

        if (finalScore <= 0) {

            console.log(
                "Skor 0 olduğu için kaydedilmedi."
            );

            return;

        }


        try {

            const client =
                await initSupabase();


            if (!client) {

                return;

            }


            // Giriş yapmış kullanıcıyı al
            const {

                data: {
                    user
                },

                error: authError

            } =
                await client.auth.getUser();


            if (authError) {

                console.error(
                    "Kullanıcı bilgisi alınamadı:",
                    authError
                );

                return;

            }


            // Kullanıcı giriş yapmamış
            if (!user) {

                console.warn(
                    "Skor kaydedilmedi: Kullanıcı giriş yapmamış."
                );

                return;

            }


            // ==========================================
            // SCORES TABLOSUNA KAYDET
            // ==========================================

            const {
                error
            } =
                await client
                    .from("scores")
                    .insert({

                        user_id:
                            user.id,

                        game:
                            "needle",

                        score:
                            finalScore

                    });


            if (error) {

                console.error(
                    "İğne Saplama skoru kaydedilemedi:",
                    error
                );

                return;

            }


            console.log(
                "İğne Saplama skoru başarıyla kaydedildi:",
                finalScore
            );

        }

        catch (error) {

            console.error(
                "Supabase skor kayıt hatası:",
                error
            );

        }

    }


    // ==========================================
    // ELEMENTLER
    // ==========================================

    const canvas =
        document.getElementById("c");


    const ctx =
        canvas.getContext("2d");


    const scoreEl =
        document.getElementById("score");


    const bestEl =
        document.getElementById("best");


    const msgEl =
        document.getElementById("msg");


    // ==========================================
    // EKRAN DEĞİŞKENLERİ
    // ==========================================

    let W;
    let H;

    let cx;
    let cy;

    let CIRCLE_R;
    let PIN_LEN;
    let PIN_SPEED;


    // ==========================================
    // RESIZE
    // ==========================================

    function resize() {

        const dpr =
            window.devicePixelRatio || 1;


        W =
            window.innerWidth;


        H =
            window.innerHeight;


        canvas.width =
            W * dpr;


        canvas.height =
            H * dpr;


        canvas.style.width =
            W + "px";


        canvas.style.height =
            H + "px";


        ctx.setTransform(

            dpr,
            0,
            0,
            dpr,
            0,
            0

        );


        cx =
            W / 2;


        cy =
            H / 2;


        const minDim =
            Math.min(
                W,
                H
            );


        CIRCLE_R =
            minDim * 0.14;


        PIN_LEN =
            minDim * 0.07;


        PIN_SPEED =
            minDim * 0.016;

    }


    resize();


    window.addEventListener(
        "resize",
        resize
    );


    // ==========================================
    // RENK PALETİ
    // ==========================================

    const PALETTE = [

        "#ff6b6b",

        "#ffd93d",

        "#6bcb77",

        "#4d96ff",

        "#ff922b",

        "#cc5de8",

        "#20c997",

        "#f06595",

        "#74c0fc",

        "#a9e34b",

        "#ffa94d",

        "#e599f7"

    ];


    // ==========================================
    // OYUN DEĞİŞKENLERİ
    // ==========================================

    let angle = 0;


    let rotSpeed =
        0.018;


    let pins = [];


    let score = 0;


    let best =
        Number(
            localStorage.getItem(
                "needleHighScore"
            )
        ) || 0;


    let gameOver = false;


    let shakeFrames = 0;


    let shakeX = 0;

    let shakeY = 0;


    let flashAlpha = 0;


    let lastTime = 0;


    let particles = [];


    let gameOverScale = 1;


    bestEl.textContent =
        "BEST " + best;


    // ==========================================
    // RENK AL
    // ==========================================

    function getColor(i) {

        return PALETTE[
            i % PALETTE.length
        ];

    }


    // ==========================================
    // PARTICLE OLUŞTUR
    // ==========================================

    function spawnParticles(
        x,
        y,
        color
    ) {

        for (
            let i = 0;
            i < 14;
            i++
        ) {

            const spd =
                2 +
                Math.random() *
                4;


            const a =
                Math.random() *
                Math.PI *
                2;


            particles.push({

                x: x,

                y: y,

                vx:
                    Math.cos(a) *
                    spd,

                vy:
                    Math.sin(a) *
                    spd,

                alpha: 1,

                color: color,

                r:
                    2 +
                    Math.random() *
                    3

            });

        }

    }


    // ==========================================
    // İĞNE FIRLAT
    // ==========================================

    function firePin() {

        if (gameOver) {

            restartGame();

            return;

        }


        const color =
            getColor(
                pins.length
            );


        pins.push({

            x: cx,

            y: H + 20,

            vy:
                -PIN_SPEED,

            stuck: false,

            circleAngle: 0,

            color: color,

            id:
                Date.now() +
                Math.random()

        });


        msgEl.classList.remove(
            "show"
        );

    }


    // ==========================================
    // MOUSE / TOUCH
    // ==========================================

    canvas.addEventListener(

        "pointerdown",

        function (e) {

            e.preventDefault();

            firePin();

        },

        {
            passive: false
        }

    );


    // ==========================================
    // KLAVYE
    // ==========================================

    document.addEventListener(

        "keydown",

        function (e) {

            if (

                e.code === "Space" ||

                e.code === "ArrowUp"

            ) {

                e.preventDefault();

                firePin();

            }

        }

    );


    // ==========================================
    // MESAFE
    // ==========================================

    function dist(
        ax,
        ay,
        bx,
        by
    ) {

        const dx =
            ax - bx;


        const dy =
            ay - by;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    const PIN_R =
        4;


    const COLLISION_DIST =
        PIN_R * 2 + 5;


    // ==========================================
    // ÇARPIŞMA KONTROL
    // ==========================================

    function checkCollision(
        pin
    ) {

        for (let p of pins) {

            if (
                p === pin ||
                !p.stuck
            ) {

                continue;

            }


            const px =
                cx +
                Math.cos(
                    p.circleAngle
                ) *
                CIRCLE_R;


            const py =
                cy +
                Math.sin(
                    p.circleAngle
                ) *
                CIRCLE_R;


            if (

                dist(
                    pin.x,
                    pin.y,
                    px,
                    py
                ) < COLLISION_DIST

            ) {

                return true;

            }

        }


        return false;

    }


    // ==========================================
    // GAME OVER
    // ==========================================

    function triggerGameOver(
        collidedPin
    ) {

        gameOver = true;


        shakeFrames =
            35;


        flashAlpha =
            1;


        gameOverScale =
            1;


        if (collidedPin) {

            spawnParticles(

                collidedPin.x,

                collidedPin.y,

                "#ff4444"

            );

        }


        // ==========================================
        // BEST SCORE
        // ==========================================

        if (score > best) {

            best =
                score;


            localStorage.setItem(

                "needleHighScore",

                best

            );


            bestEl.textContent =
                "BEST " + best;

        }


        // ==========================================
        // SUPABASE SKOR KAYDI
        // ==========================================

        saveScoreToSupabase(
            score
        );


        msgEl.textContent =
            "TAP TO RESTART";


        msgEl.classList.add(
            "show"
        );

    }


    // ==========================================
    // RESTART
    // ==========================================

    function restartGame() {

        pins = [];


        particles = [];


        score = 0;


        scoreEl.textContent =
            "0";


        gameOver =
            false;


        flashAlpha =
            0;


        shakeFrames =
            0;


        rotSpeed =
            0.018;


        gameOverScale =
            1;


        msgEl.textContent =
            "TAP TO FIRE";


        msgEl.classList.add(
            "show"
        );

    }


    // ==========================================
    // ARKA PLAN
    // ==========================================

    function drawBg() {

        ctx.fillStyle =
            "#0a0a0f";


        ctx.fillRect(

            0,

            0,

            W,

            H

        );


        const grad =
            ctx.createRadialGradient(

                cx,

                cy,

                0,

                cx,

                cy,

                Math.max(
                    W,
                    H
                ) * 0.65

            );


        grad.addColorStop(

            0,

            "rgba(22,22,40,1)"

        );


        grad.addColorStop(

            1,

            "rgba(8,8,15,1)"

        );


        ctx.fillStyle =
            grad;


        ctx.fillRect(

            0,

            0,

            W,

            H

        );

    }


    // ==========================================
    // MERKEZ ÇEMBERİ
    // ==========================================

    function drawCircle(
        ox,
        oy
    ) {

        ctx.save();


        ctx.translate(

            cx + ox,

            cy + oy

        );


        // Dış glow

        ctx.beginPath();


        ctx.arc(

            0,

            0,

            CIRCLE_R + 14,

            0,

            Math.PI * 2

        );


        ctx.strokeStyle =
            "rgba(255,255,255,0.03)";


        ctx.lineWidth =
            20;


        ctx.stroke();


        // Çember

        ctx.beginPath();


        ctx.arc(

            0,

            0,

            CIRCLE_R,

            0,

            Math.PI * 2

        );


        ctx.strokeStyle =
            "rgba(255,255,255,0.1)";


        ctx.lineWidth =
            1.5;


        ctx.stroke();


        // Hareket noktası

        const tx =
            Math.cos(angle) *
            CIRCLE_R;


        const ty =
            Math.sin(angle) *
            CIRCLE_R;


        ctx.beginPath();


        ctx.arc(

            tx,

            ty,

            4.5,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.5)";


        ctx.shadowColor =
            "white";


        ctx.shadowBlur =
            8;


        ctx.fill();


        ctx.shadowBlur =
            0;


        ctx.restore();

    }


    // ==========================================
    // SAPLANMIŞ İĞNELER
    // ==========================================

    function drawStuckPins(
        ox,
        oy
    ) {

        for (let p of pins) {

            if (!p.stuck) {

                continue;

            }


            const px =
                cx +
                Math.cos(
                    p.circleAngle
                ) *
                CIRCLE_R +
                ox;


            const py =
                cy +
                Math.sin(
                    p.circleAngle
                ) *
                CIRCLE_R +
                oy;


            const ex =
                cx +
                Math.cos(
                    p.circleAngle
                ) *
                (
                    CIRCLE_R +
                    PIN_LEN
                ) +
                ox;


            const ey =
                cy +
                Math.sin(
                    p.circleAngle
                ) *
                (
                    CIRCLE_R +
                    PIN_LEN
                ) +
                oy;


            // İğne

            ctx.beginPath();


            ctx.moveTo(
                px,
                py
            );


            ctx.lineTo(
                ex,
                ey
            );


            ctx.strokeStyle =
                p.color;


            ctx.lineWidth =
                2.5;


            ctx.shadowColor =
                p.color;


            ctx.shadowBlur =
                10;


            ctx.stroke();


            ctx.shadowBlur =
                0;


            // İğne ucu

            ctx.beginPath();


            ctx.arc(

                ex,

                ey,

                PIN_R,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                p.color;


            ctx.shadowColor =
                p.color;


            ctx.shadowBlur =
                16;


            ctx.fill();


            ctx.shadowBlur =
                0;

        }

    }


    // ==========================================
    // UÇAN İĞNELER
    // ==========================================

    function drawFlyingPins() {

        for (let p of pins) {

            if (p.stuck) {

                continue;

            }


            const tailX =
                p.x;


            const tailY =
                p.y +
                PIN_LEN;


            ctx.beginPath();


            ctx.moveTo(

                tailX,

                tailY

            );


            ctx.lineTo(

                p.x,

                p.y

            );


            ctx.strokeStyle =
                p.color;


            ctx.lineWidth =
                2.5;


            ctx.shadowColor =
                p.color;


            ctx.shadowBlur =
                10;


            ctx.stroke();


            ctx.shadowBlur =
                0;


            // Uç

            ctx.beginPath();


            ctx.arc(

                p.x,

                p.y,

                PIN_R,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                p.color;


            ctx.shadowColor =
                p.color;


            ctx.shadowBlur =
                16;


            ctx.fill();


            ctx.shadowBlur =
                0;

        }

    }


    // ==========================================
    // PARTICLES
    // ==========================================

    function drawParticles() {

        for (

            let i =
                particles.length - 1;

            i >= 0;

            i--

        ) {

            const p =
                particles[i];


            p.x +=
                p.vx;


            p.y +=
                p.vy;


            p.vy +=
                0.15;


            p.alpha -=
                0.03;


            if (p.alpha <= 0) {

                particles.splice(
                    i,
                    1
                );

                continue;

            }


            ctx.beginPath();


            ctx.arc(

                p.x,

                p.y,

                p.r,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                p.color;


            ctx.globalAlpha =
                p.alpha;


            ctx.fill();


            ctx.globalAlpha =
                1;

        }

    }


    // ==========================================
    // ANA OYUN DÖNGÜSÜ
    // ==========================================

    function loop(ts) {

        requestAnimationFrame(
            loop
        );


        const dt =
            Math.min(

                ts -
                lastTime,

                50

            );


        lastTime =
            ts;


        // Shake

        if (shakeFrames > 0) {

            shakeFrames--;


            const mag =
                shakeFrames *
                0.38;


            shakeX =
                (
                    Math.random() -
                    0.5
                ) *
                mag;


            shakeY =
                (
                    Math.random() -
                    0.5
                ) *
                mag;

        }

        else {

            shakeX =
                0;


            shakeY =
                0;

        }


        // Flash

        if (flashAlpha > 0) {

            flashAlpha =
                Math.max(

                    0,

                    flashAlpha -
                    0.04

                );

        }


        drawBg();


        // Kırmızı flash

        if (flashAlpha > 0) {

            ctx.fillStyle =
                "rgba(255,60,60," +
                (
                    flashAlpha *
                    0.22
                ) +
                ")";


            ctx.fillRect(

                0,

                0,

                W,

                H

            );

        }


        // ==========================================
        // OYUN DEVAM EDİYOR
        // ==========================================

        if (!gameOver) {

            angle +=
                rotSpeed;


            // Saplanmış iğneleri döndür

            for (let p of pins) {

                if (p.stuck) {

                    p.circleAngle +=
                        rotSpeed;

                }

            }


            // Uçan iğneler

            for (

                let i =
                    pins.length - 1;

                i >= 0;

                i--

            ) {

                const p =
                    pins[i];


                if (p.stuck) {

                    continue;

                }


                p.y +=
                    p.vy;


                const d =
                    dist(

                        p.x,

                        p.y,

                        cx,

                        cy

                    );


                // Çembere ulaştı

                if (

                    d <=
                    CIRCLE_R + 2

                ) {


                    // Başka iğneye çarptı

                    if (
                        checkCollision(p)
                    ) {

                        triggerGameOver(
                            p
                        );

                    }

                    else {

                        // Sapla

                        p.stuck =
                            true;


                        p.circleAngle =
                            Math.atan2(

                                p.y - cy,

                                p.x - cx

                            );


                        // Skor

                        score++;


                        scoreEl.textContent =
                            score;


                        // Zorluk

                        rotSpeed =
                            0.018 +
                            score *
                            0.0007;


                        // Particle

                        spawnParticles(

                            cx +
                            Math.cos(
                                p.circleAngle
                            ) *
                            CIRCLE_R,

                            cy +
                            Math.sin(
                                p.circleAngle
                            ) *
                            CIRCLE_R,

                            p.color

                        );

                    }

                }


                // Ekrandan çıkan iğne

                if (
                    p.y < -60
                ) {

                    pins.splice(

                        i,

                        1

                    );

                }

            }

        }


        // ==========================================
        // ÇİZİMLER
        // ==========================================

        drawStuckPins(

            shakeX,

            shakeY

        );


        drawCircle(

            shakeX,

            shakeY

        );


        drawFlyingPins();


        drawParticles();


        // ==========================================
        // GAME OVER GÖRSELİ
        // ==========================================

        if (

            gameOver &&
            pins.length > 0

        ) {

            const pulse =
                0.55 +
                Math.sin(
                    ts * 0.008
                ) *
                0.2;


            ctx.fillStyle =
                "rgba(255,70,70," +
                pulse +
                ")";


            for (let p of pins) {

                if (!p.stuck) {

                    continue;

                }


                const px =
                    cx +
                    Math.cos(
                        p.circleAngle
                    ) *
                    CIRCLE_R +
                    shakeX;


                const py =
                    cy +
                    Math.sin(
                        p.circleAngle
                    ) *
                    CIRCLE_R +
                    shakeY;


                ctx.beginPath();


                ctx.arc(

                    px,

                    py,

                    PIN_R + 3,

                    0,

                    Math.PI * 2

                );


                ctx.fill();

            }

        }

    }


    // ==========================================
    // OYUNU BAŞLAT
    // ==========================================

    lastTime =
        performance.now();


    requestAnimationFrame(
        loop
    );


})();