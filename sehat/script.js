let keranjang = [];

function waPesan(nama){
    window.open("https://wa.me/6285731070315?text=Halo admin, saya ingin pesan "+nama);
}

function waKonsultasi(){
    window.open("https://wa.me/6285731070315?text=Halo admin, saya ingin konsultasi");
}

function waTanya(){
    window.open("https://wa.me/6285731070315?text=Halo admin, saya ingin bertanya tentang produk");
}

function tambahKeranjang(nama){
    keranjang.push(nama);
    document.getElementById('cart-count').innerText = keranjang.length;
    alert(nama + " masuk keranjang");
}

function bukaModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function tutupModal(id) {
    document.getElementById(id).style.display = 'none';
}

function bukaModalKeranjang() {
    const listContainer = document.getElementById('daftar-item-keranjang');
    listContainer.innerHTML = "";
    
    if (keranjang.length === 0) {
        listContainer.innerHTML = "<p style='text-align:center; padding:20px;'>Keranjang masih kosong...</p>";
    } else {
        keranjang.forEach((item, index) => {
            listContainer.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                    <span>${index + 1}. ${item}</span>
                </div>`;
        });
    }
    bukaModal('modal-keranjang');
}

function checkout(){
    if(keranjang.length==0){
        alert("Keranjang kosong");
        return;
    }
    let pesan="Halo admin, saya ingin pesan:%0A";
    keranjang.forEach((item,i)=>{
        pesan+=(i+1)+". "+item+"%0A";
    });
    window.open("https://wa.me/6285731070315?text="+pesan);
}
function tampilkanKonten(menu) {
    // Sembunyikan semua bagian konten dulu
    var semuaKonten = document.querySelectorAll('.hal-konten');
    semuaKonten.forEach(function(el) {
        el.style.display = 'none';
    });

    // Tampilkan hanya bagian yang diklik
    if (menu === 'tentang') {
        document.getElementById('konten-tentang').style.display = 'block';
    }
    // Tambahkan menu lain (promo, edukasi, dll) di sini nanti
}
// Fungsi untuk buka tutup menu di tampilan mobile
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (window.innerWidth <= 768) {
        navMenu.classList.toggle('active');
    }
}

// Menutup menu jika user mengklik di luar menu saat terbuka (Opsional)
window.onclick = function(event) {
    if (!event.target.matches('.menu-toggle') && !event.target.closest('.nav-menu')) {
        const navMenu = document.getElementById('navMenu');
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
}
function tampilkanKonten(menu) {
    // Sembunyikan semua bagian konten dulu
    var semuaKonten = document.querySelectorAll('.hal-konten');
    semuaKonten.forEach(function(el) {
        el.style.display = 'none';
    });

    // Tampilkan bagian yang diklik
    if (menu === 'tentang') {
        document.getElementById('konten-tentang').style.display = 'block';
    } else if (menu === 'profil') {
        document.getElementById('konten-profil').style.display = 'block';
    }
}