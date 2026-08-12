// ==========================================
// DOĞU GAMES - SUPABASE
// ==========================================

const DG_SUPABASE_URL = "https://zvxzfwftwvkjvqvdqabo.supabase.co";

const DG_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GF0KjdrmsluAuSDW9SmkLg_svfG1SrL";


// Supabase client'ı sadece bir kere oluştur
if (!window.dgSupabase) {

    window.dgSupabase = window.supabase.createClient(
        DG_SUPABASE_URL,
        DG_SUPABASE_PUBLISHABLE_KEY
    );

    console.log("Doğu Games - Supabase bağlantısı hazır.");
}

console.log("Doğu Games aktif! 🎮");


// ==========================================
// SAYFA YÜKLENDİ
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Doğu Games hazır.");

    loadLeaderboard();

});


// ==========================================
// LEADERBOARD
// ==========================================

async function loadLeaderboard() {

    const leaderboard = document.getElementById("leaderboard-list");


    if (!leaderboard) {

        console.log("Leaderboard elementi bulunamadı.");

        return;
    }


    try {

        console.log("Leaderboard yükleniyor...");


        const { data, error } = await window.dgSupabase

            .from("scores")

            .select(`
                score,
                game,
                created_at,
                profiles (
                    username
                )
            `)

            .order("score", {
                ascending: false
            })

            .limit(10);


        // ==========================================
        // HATA
        // ==========================================

        if (error) {

            console.error("Leaderboard hatası:", error);


            leaderboard.innerHTML = `

                <div class="leaderboard-header">

                    <span>#</span>

                    <span>PLAYER</span>

                    <span>SCORE</span>

                </div>


                <div class="leaderboard-row">

                    <span class="rank">
                        !
                    </span>

                    <strong>
                        VERİ ALINAMADI
                    </strong>

                    <span>
                        -
                    </span>

                </div>

            `;

            return;
        }


        console.log("Leaderboard verileri:", data);


        // ==========================================
        // HİÇ SKOR YOK
        // ==========================================

        if (!data || data.length === 0) {

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


        data.forEach(function (item, index) {


            const username =
                item.profiles?.username || "BİLİNMİYOR";


            const score =
                Number(item.score).toLocaleString("tr-TR");


            html += `

                <div class="leaderboard-row">

                    <span class="rank">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <strong>
                        ${username}
                    </strong>

                    <span>
                        ${score}
                    </span>

                </div>

            `;

        });


        leaderboard.innerHTML = html;


        console.log("Leaderboard başarıyla yüklendi.");

    }


    catch (error) {

        console.error(
            "Leaderboard bağlantı hatası:",
            error
        );


        leaderboard.innerHTML = `

            <div class="leaderboard-header">

                <span>#</span>

                <span>PLAYER</span>

                <span>SCORE</span>

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

}