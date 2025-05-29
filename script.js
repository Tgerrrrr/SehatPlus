document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi peta
    let map;
    let service;
    let infowindow;
    
    function initMap() {
        const defaultLocation = new google.maps.LatLng(-6.2088, 106.8456); // Jakarta sebagai default
        
        infowindow = new google.maps.InfoWindow();
        
        map = new google.maps.Map(document.getElementById("map"), {
            center: defaultLocation,
            zoom: 12,
        });
        
        // Coba dapatkan lokasi pengguna
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    
                    map.setCenter(pos);
                    new google.maps.Marker({
                        position: pos,
                        map: map,
                        title: "Lokasi Anda",
                        icon: {
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }
                    });
                },
                () => {
                    handleLocationError(true, infowindow, map.getCenter());
                }
            );
        } else {
            handleLocationError(false, infowindow, map.getCenter());
        }
    }
    
    function handleLocationError(browserHasGeolocation, infowindow, pos) {
        infowindow.setPosition(pos);
        infowindow.setContent(
            browserHasGeolocation
                ? "Error: Layanan geolokasi gagal."
                : "Error: Browser Anda tidak mendukung geolokasi."
        );
        infowindow.open(map);
    }
    
    // Fungsi untuk mencari rumah sakit
    function cariRumahSakit() {
        const rsList = document.getElementById('rs-list');
        rsList.innerHTML = '<p>Mencari rumah sakit terdekat...</p>';
        
        const location = map.getCenter();
        
        const request = {
            location: location,
            radius: '5000',
            type: ['hospital']
        };
        
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                rsList.innerHTML = '';
                
                if (results.length === 0) {
                    rsList.innerHTML = '<p>Tidak ditemukan rumah sakit di sekitar area ini.</p>';
                    return;
                }
                
                results.slice(0, 5).forEach((place) => {
                    if (!place.name || !place.vicinity) return;
                    
                    const rsItem = document.createElement('div');
                    rsItem.className = 'rs-item';
                    
                    let content = `<h3>${place.name}</h3>`;
                    content += `<p><i class="fas fa-map-marker-alt"></i> ${place.vicinity}</p>`;
                    
                    if (place.rating) {
                        content += `<p><i class="fas fa-star"></i> Rating: ${place.rating}/5`;
                        if (place.user_ratings_total) {
                            content += ` (${place.user_ratings_total} ulasan)`;
                        }
                        content += `</p>`;
                    }
                    
                    if (place.geometry) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        content += `<a href="http://maps.google.co.id/?q=" target="_blank"><i class="fas fa-directions"></i> Dapatkan Petunjuk Arah</a>`;
                    }
                    
                    rsItem.innerHTML = content;
                    rsList.appendChild(rsItem);
                    
                    const marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: place.name
                    });
                    
                    google.maps.event.addListener(marker, 'click', () => {
                        infowindow.setContent(`<strong>${place.name}</strong><br>${place.vicinity}`);
                        infowindow.open(map, marker);
                    });
                });
            } else {
                rsList.innerHTML = '<p>Gagal memuat data rumah sakit. Silakan coba lagi.</p>';
            }
        });
    }
    
    // Fungsi untuk simulasi diagnosa
    function prosesDiagnosa() {
        const gejala = document.getElementById('gejala').value.trim();
        const hasilDiagnosa = document.getElementById('hasil-diagnosa');
        
        if (!gejala) {
            alert('Silakan masukkan gejala yang Anda alami.');
            return;
        }
        
        hasilDiagnosa.innerHTML = '<p>Memproses diagnosa...</p>';
        hasilDiagnosa.style.display = 'block';
        
        // Simulasi API call
        setTimeout(() => {
            const kemungkinanPenyakit = [
                "Flu biasa",
                "Demam berdarah",
                "Tifus",
                "Infeksi tenggorokan",
                "Alergi"
            ];
            
            const saran = [
                "Istirahat yang cukup dan minum air putih",
                "Minum obat penurun panas jika demam tinggi",
                "Hindari makanan pedas dan berminyak",
                "Jika gejala memburuk, segera hubungi dokter"
            ];
            
            const randomPenyakit = kemungkinanPenyakit[Math.floor(Math.random() * kemungkinanPenyakit.length)];
            const randomSaran = saran[Math.floor(Math.random() * saran.length)];
            
            let hasilHTML = `<h3>Hasil Diagnosa Awal</h3>`;
            hasilHTML += `<p><strong>Gejala yang dimasukkan:</strong> ${gejala}</p>`;
            hasilHTML += `<p><strong>Kemungkinan penyakit:</strong> ${randomPenyakit}</p>`;
            hasilHTML += `<p><strong>Saran:</strong> ${randomSaran}</p>`;
            hasilHTML += `<p class="disclaimer"><i>Catatan: Hasil ini hanya perkiraan awal. Untuk diagnosa yang akurat, silakan berkonsultasi dengan dokter.</i></p>`;
            
            hasilDiagnosa.innerHTML = hasilHTML;
        }, 2000);
    }
    
    // Pasang event listeners
    document.getElementById('cari-rs').addEventListener('click', cariRumahSakit);
    document.getElementById('diagnosa-btn').addEventListener('click', prosesDiagnosa);
    
    // Inisialisasi peta setelah Google Maps API siap
    if (typeof google !== 'undefined') {
        initMap();
    } else {
        console.error('Google Maps API gagal dimuat');
    }
});