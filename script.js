// =======================================
// CONFIGURATION & DATABASE URL
// =======================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyT6aWTLY-tJ6BFFlbZQUm94kHz1Wc7XR2yA2KgWRiVCeBRB3_1T7RCik6ppNCpni1dWA/exec";

// =======================================
// 1. SISTEM PEMBUKA UNDANGAN & MUSIK
// =======================================
const openBtn = document.getElementById("open");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");
const body = document.body;
const mainContent = document.querySelector(".main-content");
const navbar = document.querySelector(".navbar"); // Inisialisasi elemen navbar

let isPlaying = false;

if (openBtn) {
    openBtn.addEventListener("click", function () {
        // Hilangkan kelas pengunci scroll di body
        body.classList.remove("lock-scroll");
        
        // Munculkan kontainer utama undangan
        mainContent.classList.remove("content-hidden");
        mainContent.classList.add("content-show");

        // Munculkan navbar saat tombol diklik (Sinkronisasi CSS baru)
        if (navbar) {
            navbar.classList.add("show-nav");
        }

        // Putar audio otomatis setelah interaksi klik
        playAudio();

        // Scroll halus langsung ke area konten pembuka pertama
        const introSection = document.querySelector(".intro");
        if (introSection) {
            introSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}

function playAudio() {
    if (music) {
        music.play().then(() => {
            isPlaying = true;
            musicBtn.innerText = "🎵";
            musicBtn.classList.add("rotating");
        }).catch(error => {
            console.log("Pemutaran musik otomatis diblokir browser:", error);
        });
    }
}

if (musicBtn) {
    musicBtn.addEventListener("click", function () {
        if (isPlaying) {
            music.pause();
            musicBtn.innerText = "🔇";
            musicBtn.classList.remove("rotating");
        } else {
            music.play();
            musicBtn.innerText = "🎵";
            musicBtn.classList.add("rotating");
        }
        isPlaying = !isPlaying;
    });
}

// =======================================
// 2. COUNTDOWN TIMER SYSTEM
// =======================================
function weddingCountdown() {
    const targetDate = new Date("August 22, 2026 09:00:00").getTime();
    const countdownElement = document.getElementById("countdown");

    if (!countdownElement) return;

    setInterval(function () {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            countdownElement.innerHTML = "Acara Telah Berlangsung";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `
            <div>${days}d </div>
            <div>${hours}h </div>
            <div>${minutes}m </div>
            <div>${seconds}s</div>
        `;
    }, 1000);
}

// =======================================
// 3. COPY TO CLIPBOARD (SALIN REKENING)
// =======================================
function copyRek() {
    const norek = "1860001119292";
    navigator.clipboard.writeText(norek).then(() => {
        alert("Nomor Rekening Mandiri berhasil disalin!");
    }).catch(err => {
        console.error("Gagal menyalin text: ", err);
    });
}

// =======================================
// 4. AMBIL NAMA TAMU KUSTOM DARI URL LINK
// =======================================
function getGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');

    if (guestName) {
        const guestElement = document.getElementById("guest");
        if (guestElement) {
            // Mengubah format persen (%20) atau plus (+) kembali menjadi spasi normal
            guestElement.innerText = decodeURIComponent(guestName.replace(/\+/g, ' '));
        }
    }
}

// =======================================
// 5. INTEGRASI GOOGLE SHEETS & BUKU TAMU REALTIME
// =======================================
const rsvpForm = document.getElementById("rsvpForm");
const commentsContainer = document.getElementById("commentsContainer");
const submitBtn = document.getElementById("submitBtn");

function loadComments() {
    if (!commentsContainer || SCRIPT_URL.includes("MASUKKAN_URL") || SCRIPT_URL === "") return;

    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            commentsContainer.innerHTML = "";
            
            if (!data || data.length === 0) {
                commentsContainer.innerHTML = '<p class="loading-comments">Belum ada ucapan. Kirim ucapan Anda pertama kali!</p>';
                return;
            }

            // Membalikkan data agar baris paling baru masuk berada di urutan paling atas web
            data.reverse().forEach(item => {
                const badgeClass = item.kehadiran === "Hadir" ? "status-hadir" : "status-tidak";
                const badgeText = item.kehadiran === "Hadir" ? `✓ Hadir (${item.jumlah} Orang)` : "✕ Tidak Hadir";

                const commentCard = document.createElement("div");
                commentCard.className = "comment-card";
                commentCard.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-name">${item.nama}</span>
                        <span class="comment-status ${badgeClass}">${badgeText}</span>
                    </div>
                    <p class="comment-text">${item.ucapan}</p>
                `;
                commentsContainer.appendChild(commentCard);
            });
        })
        .catch(error => {
            console.error("Gagal menarik database ucapan:", error);
            commentsContainer.innerHTML = '<p class="loading-comments">Gagal memuat ucapan tamu.</p>';
        });
}

if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (SCRIPT_URL.includes("MASUKKAN_URL") || SCRIPT_URL === "") {
            alert("Harap pasang URL Web App Google Apps Script Anda terlebih dahulu di berkas script.js!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Mengirim...";

        // PERBAIKAN: Menggunakan URLSearchParams agar format data dikirim dalam bentuk x-www-form-urlencoded yang disukai Google Apps Script bawaan
        const urlParams = new URLSearchParams();
        urlParams.append("nama", document.getElementById("rsvpNama").value);
        urlParams.append("jumlah", document.getElementById("rsvpJumlah").value);
        urlParams.append("kehadiran", document.getElementById("rsvpKehadiran").value);
        urlParams.append("ucapan", document.getElementById("rsvpUcapan").value);

        fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlParams.toString()
        })
        .then(response => response.json())
        .then(result => {
            if (result.result === "success" || result.status === "success") {
                alert("Konfirmasi kehadiran dan ucapan berhasil dikirim!");
                rsvpForm.reset();
                loadComments(); // Refresh daftar komentar seketika tanpa reload halaman
            } else {
                alert("Gagal memproses data. Silakan coba kembali.");
            }
        })
        .catch(error => {
            console.error("Error submit form:", error);
            alert("Terjadi masalah koneksi jaringan database.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = "Kirim Konfirmasi";
        });
    });
}

// =======================================
// INITIALIZATION ON LOAD
// =======================================
document.addEventListener("DOMContentLoaded", function() {
    // Jalankan penangkap nama kustom dari URL link (?to=Nama)
    getGuestName();

    // Jalankan timer hitung mundur
    weddingCountdown();
    
    // Tarik daftar komentar dari spreadsheet
    loadComments();

    // Sembunyikan elemen loader bawaan halaman awal
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 500);
        }, 1000);
    }
});