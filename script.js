// ==========================================
// DOĞU GAMES - SUPABASE
// ==========================================

const DG_SUPABASE_URL =
    "https://zvxzfwftwvkjvqvdqabo.supabase.co";

const DG_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GF0KjdrmsluAuSDW9SmkLg_svfG1SrL";


// ==========================================
// SUPABASE CLIENT
// ==========================================

if (!window.dgSupabase) {

    window.dgSupabase =
        window.supabase.createClient(
            DG_SUPABASE_URL,
            DG_SUPABASE_PUBLISHABLE_KEY
        );

    console.log("Doğu Games - Supabase bağlantısı hazır.");

}


// ==========================================
// SAYFA YÜKLENDİ
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Doğu Games hazır.");

        loadLeaderboard();

    }
);


// ==========================================
// LEADERBOARD
// ==========================================

async function loadLeaderboard() {

    const leaderboard =
        document.getElementById(
            "leaderboard-list"
        );


    if (!leaderboard) {

        console.log(
            "Leaderboard elementi bulunamadı."
        );

        return;

    }


    try {

        console.log(
            "Leaderboard yükleniyor..."
        );


        // ==========================================
        // 1 - SKORLARI AL
        // ==========================================

        const {
            data: scores,
            error: scoresError
        } = await window.dgSupabase

            .from("scores")

            .select(
                "id, user_id, game, score, created_at"
            )

            .order(
                "score",
                {
                    ascending: false
                }
            )

            .limit(10);


        // ==========================================
        // SKOR HATASI
        // ==========================================

        if (scoresError) {

            console.error(
                "Scores hatası:",
                scoresError
            );

            showLeaderboardError();

            return;

        }


        console.log(
            "Scores:",
            scores
        );


        // ==========================================
        // SKOR YOK
        // ==========================================

        if (
            !scores ||
            scores.length === 0
        ) {

            leaderboard.innerHTML = `

                <div class="leaderboard-header">

                    <span>#</span>

                    <span>PLAYER</span>

                    <span>SCORE</span>

                </div>


                <div class="leaderboard-row">

                    <span class="rank">
                        -
                    </span>

                    <strong>
                        HENÜZ SKOR YOK
                    </strong>

                    <span>
                        -
                    </span>

                </div>

            `;

            return;

        }


        // ==========================================
        // 2 - USER ID'LERİ TOPLA
        // ==========================================

        const userIds =
            scores.map(
                score => score.user_id
            );


        // ==========================================
        // 3 - PROFILES TABLOSUNDAN
        // USERNAME'LERİ AL
        // ==========================================

        const {
            data: profiles,
            error: profilesError
        } = await window.dgSupabase

            .from("profiles")

            .select(
                "id, username"
            )

            .in(
                "id",
                userIds
            );


        // ==========================================
        // PROFILE HATASI
        // ==========================================

        if (profilesError) {

            console.error(
                "Profiles hatası:",
                profilesError
            );

            showLeaderboardError();

            return;

        }


        console.log(
            "Profiles:",
            profiles
        );


        // ==========================================
        // PROFILE MAP
        // ==========================================

        const profileMap = {};


        profiles.forEach(
            function (profile) {

                profileMap[
                    profile.id
                ] = profile.username;

            }
        );


        // ==========================================
        // LEADERBOARD HTML
        // ==========================================

        let html = `

            <div class="leaderboard-header">

                <span>
                    #
                </span>

                <span>
                    PLAYER
                </span>

                <span>
                    SCORE
                </span>

            </div>

        `;


        // ==========================================
        // SKORLARI OLUŞTUR
        // ==========================================

        scores.forEach(
            function (item, index) {


                const username =
                    profileMap[
                        item.user_id
                    ] || "BİLİNMİYOR";


                const score =
                    Number(
                        item.score
                    ).toLocaleString(
                        "tr-TR"
                    );


                html += `

                    <div class="leaderboard-row">

                        <span class="rank">

                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </span>


                        <strong>

                            ${username}

                        </strong>


                        <span>

                            ${score}

                        </span>

                    </div>

                `;

            }
        );


        // ==========================================
        // EKRANA YAZ
        // ==========================================

        leaderboard.innerHTML =
            html;


        console.log(
            "Leaderboard başarıyla yüklendi."
        );

    }


    catch (error) {

        console.error(
            "Leaderboard bağlantı hatası:",
            error
        );

        showLeaderboardError();

    }

}


// ==========================================
// LEADERBOARD HATA MESAJI
// ==========================================

function showLeaderboardError() {

    const leaderboard =
        document.getElementById(
            "leaderboard-list"
        );


    if (!leaderboard) {
        return;
    }


    leaderboard.innerHTML = `

        <div class="leaderboard-header">

            <span>
                #
            </span>

            <span>
                PLAYER
            </span>

            <span>
                SCORE
            </span>

        </div>


        <div class="leaderboard-row">

            <span class="rank">
                !
            </span>

            <strong>
                BAĞLANTI HATASI
            </strong>

            <span>
                -
            </span>

        </div>

    `;

}