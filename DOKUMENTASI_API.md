# Dokumentasi API Validator Games (Internal Store)

Dokumentasi ini menjelaskan penggunaan API untuk memvalidasi ID akun game pada toko top-up Anda secara profesional, serta langkah konfigurasi variabel lingkungan (*Environment Variables* & *Secrets*) pada platform Cloudflare Workers.

---

## 1. Konfigurasi Variabel Lingkungan & Keamanan (CORS)

Untuk menjaga agar API ini **hanya dapat diakses oleh toko top-up Anda sendiri** (tidak disalahgunakan oleh pihak lain), API ini mengimplementasikan pengamanan berbasis CORS dengan memanfaatkan fitur **Secrets** dari Cloudflare Workers.

Setiap request dari browser wajib mengirimkan header `Origin` yang valid. API akan mencocokkan `Origin` tersebut dengan daftar domain tepercaya yang disimpan di variabel `ALLOWED_ORIGINS`. Request *Server-to-Server* (tanpa header `Origin`) tetap dapat mengakses secara bebas.

### 1.1 Panduan Resmi Cloudflare
Konfigurasi variabel lingkungan dan secret ini mengacu pada standar resmi dari Cloudflare. Informasi selengkapnya dapat dibaca di:
👉 [Cloudflare Workers Environment Variables Documentation](https://developers.cloudflare.com/workers/configuration/environment-variables/)

---

### 1.2 Konfigurasi di Production (Cloudflare Cloud)

Variabel `ALLOWED_ORIGINS` disimpan sebagai **Secret** terenkripsi, sehingga aman dan tidak bocor ke publik atau di dalam repositori kode (*source code*).

#### Cara A: Menggunakan Wrangler CLI (Sangat Direkomendasikan)
Jalankan perintah berikut di terminal proyek Anda:
```bash
npx wrangler secret put ALLOWED_ORIGINS
```
Ketika diminta memasukkan nilai, ketikkan daftar domain toko Anda dipisahkan dengan koma (tanpa spasi setelah koma):
```bash
Enter a secret value: https://tokomu.com,https://www.tokomu.com,https://admin.tokomu.com
```
*Catatan: Pastikan Anda menyertakan protokol (`https://` atau `http://`) secara lengkap.*

#### Cara B: Melalui Cloudflare Dashboard
1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigasi ke **Workers & Pages** > Pilih Worker `validator-games` Anda.
3. Pilih menu **Settings** > **Variables and Secrets**.
4. Pada bagian *Environment Variables*, klik **Add**.
5. Masukkan konfigurasi berikut:
   - **Type**: `Secret` (agar nilainya terenkripsi)
   - **Variable name**: `ALLOWED_ORIGINS`
   - **Value**: `https://tokomu.com,https://www.tokomu.com` (ganti dengan domain toko Anda)
6. Klik **Deploy** untuk menerapkan perubahan.

---

### 1.3 Konfigurasi untuk Pengembangan Lokal (Local Development)

Untuk keperluan testing lokal (misalnya di localhost), jangan mengubah kode sumber. Cukup gunakan file `.dev.vars` di root folder proyek Anda.

1. Buat file `.dev.vars` (jika belum ada) di root proyek:
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
   ```
2. Jalankan server lokal:
   ```bash
   npx wrangler dev
   ```
   Wrangler akan secara otomatis mendeteksi `.dev.vars` dan memuat variabel tersebut sebagai lingkungan simulasi lokal.

> [!IMPORTANT]
> Jangan pernah meng-commit file `.dev.vars` atau file `.env` lainnya yang berisi data sensitif ke git. File `.dev.vars` Anda sudah otomatis dimasukkan ke `.gitignore`.

---

## 2. Struktur Dasar Request & Response API

### 2.1 Format Request
API ini mendukung berbagai format request untuk kenyamanan integrasi Anda:
- **Metode**: `GET`, `POST`, `HEAD`
- **Content-Type (untuk POST)**: `application/json` atau `application/x-www-form-urlencoded`

#### Contoh GET Request:
```http
GET /ml?id=123456789&zone=2202 HTTP/1.1
Host: validator-games.derisfirmansyah177.workers.dev
Origin: https://tokomu.com
```

#### Contoh POST Request (JSON):
```http
POST /ml HTTP/1.1
Host: validator-games.derisfirmansyah177.workers.dev
Content-Type: application/json
Origin: https://tokomu.com

{
  "id": "123456789",
  "zone": "2202"
}
```

---

### 2.2 Format Response

#### Response Sukses (HTTP 200 OK)
Jika akun game ditemukan dan valid:
```json
{
  "success": true,
  "game": "Mobile Legends: Bang Bang",
  "id": 123456789,
  "server": 2202,
  "name": "SuperPlayer",
  "country": "ID"
}
```

#### Response Gagal (HTTP 404 Not Found atau 400 Bad Request)
Jika data tidak valid atau akun tidak ditemukan:
```json
{
  "success": false,
  "message": "Not found"
}
```

#### Response Akses Ditolak (HTTP 403 Forbidden)
Jika request dikirim dari domain browser yang tidak terdaftar di `ALLOWED_ORIGINS`:
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

### 2.3 Response Headers Utama
Setiap response sukses/gagal dari API akan menyertakan beberapa header penting berikut:

| Header | Contoh Nilai | Deskripsi |
|--------|-------------|-----------|
| `Access-Control-Allow-Origin` | `https://tokomu.com` | Mengizinkan browser di domain tepercaya untuk membaca data. |
| `Cache-Control` | `public, max-age=30, s-maxage=43200` | Pengaturan cache di sisi Cloudflare Edge network (12 jam) dan browser (30 detik). |
| `X-Response-Time` | `45` | Durasi waktu proses API dalam satuan milidetik (ms). |
| `Vary` | `Origin` | Menginstruksikan cache-proxy agar membedakan cache berdasarkan domain asal request. |

---

## 3. Daftar Endpoint Game & Parameter

Berikut adalah daftar endpoint untuk 16 game yang didukung:

### 3.1 Mobile Legends: Bang Bang
- **Endpoint**: `/ml`
- **Parameter Wajib**:
  - `id` (angka) : User ID MLBB
  - `zone` atau `server` (angka) : Zone ID / Server ID MLBB
- **Contoh Request**: `/ml?id=123456789&zone=2202`

### 3.2 Genshin Impact
- **Endpoint**: `/gi`
- **Parameter Wajib**:
  - `id` (angka) : UID Genshin Impact (Server terdeteksi otomatis melalui digit awal UID)
- **Contoh Request**: `/gi?id=601234567`

### 3.3 Honkai: Star Rail
- **Endpoint**: `/hsr`
- **Parameter Wajib**:
  - `id` (angka) : UID Honkai: Star Rail
- **Contoh Request**: `/hsr?id=801234567`

### 3.4 Zenless Zone Zero
- **Endpoint**: `/zzz`
- **Parameter Wajib**:
  - `id` (angka) : UID Zenless Zone Zero
- **Contoh Request**: `/zzz?id=150123456`

### 3.5 Honkai Impact 3rd
- **Endpoint**: `/hi`
- **Parameter Wajib**:
  - `id` (angka) : UID Honkai Impact 3rd
- **Contoh Request**: `/hi?id=20123456`

### 3.6 Garena Free Fire
- **Endpoint**: `/ff`
- **Parameter Wajib**:
  - `id` (angka) : Player ID Free Fire
- **Contoh Request**: `/ff?id=87654321`

### 3.7 Garena AOV (Arena of Valor)
- **Endpoint**: `/aov`
- **Parameter Wajib**:
  - `id` (angka) : Player ID AOV
- **Contoh Request**: `/aov?id=9876543210`

### 3.8 Call of Duty: Mobile
- **Endpoint**: `/codm`
- **Parameter Wajib**:
  - `id` (angka) : OpenID / Player ID CODM
- **Contoh Request**: `/codm?id=4567890123`

### 3.9 VALORANT
- **Endpoint**: `/valo`
- **Parameter Wajib**:
  - `id` (string) : Riot ID beserta Tag (Format: `Username#TAG`)
- **Contoh Request**: `/valo?id=RiotPlayer%231234` (*Catatan: Karakter `#` perlu di-URL encode menjadi `%23`*)

### 3.10 Punishing: Gray Raven
- **Endpoint**: `/pgr`
- **Parameter Wajib**:
  - `id` (angka) : Player ID PGR
  - `server` atau `zone` (string) : Nama server (`asia`, `os`, `eu`, `na`)
- **Contoh Request**: `/pgr?id=123456&server=asia`

### 3.11 LifeAfter
- **Endpoint**: `/la`
- **Parameter Wajib**:
  - `id` (angka) : Account ID LifeAfter
  - `server` atau `zone` (string) : Nama server (contoh: `miskatown`, `hopevalley`, dll.)
- **Contoh Request**: `/la?id=987654&server=miskatown`

### 3.12 Love and Deepspace
- **Endpoint**: `/ld`
- **Parameter Wajib**:
  - `id` (angka) : UID Love and Deepspace
- **Contoh Request**: `/ld?id=10012345`

### 3.13 Magic Chess: Go Go
- **Endpoint**: `/mcgg`
- **Parameter Wajib**:
  - `id` (angka) : User ID MCGG
  - `server` atau `zone` (angka) : Zone ID / Server ID MCGG
- **Contoh Request**: `/mcgg?id=1234567&server=1001`

### 3.14 Point Blank
- **Endpoint**: `/pb`
- **Parameter Wajib**:
  - `id` (string) : PB Username / Account ID
- **Contoh Request**: `/pb?id=pbplayer123`

### 3.15 Sausage Man
- **Endpoint**: `/sm`
- **Parameter Wajib**:
  - `id` (string) : Character ID Sausage Man (dapat berupa string alfanumerik)
- **Contoh Request**: `/sm?id=s9a8f7d6`

### 3.16 Super Sus
- **Endpoint**: `/sus`
- **Parameter Wajib**:
  - `id` (angka) : Space ID / Space Code Super Sus
- **Contoh Request**: `/sus?id=12345678`

---

## 4. Contoh Integrasi Kode

### 4.1 Menggunakan JavaScript (Fetch API) - Di Toko Online Anda
Gunakan kode berikut pada frontend toko Anda untuk melakukan validasi sebelum mengizinkan pembayaran:

```javascript
async function validasiAkunGame(endpoint, id, zoneOrServer = null) {
  const baseUrl = "https://validator-games.derisfirmansyah177.workers.dev";
  let url = `${baseUrl}/${endpoint}?id=${encodeURIComponent(id)}`;
  
  if (zoneOrServer) {
    url += `&zone=${encodeURIComponent(zoneOrServer)}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.status === 403) {
      console.error("Kesalahan CORS: Domain toko Anda belum terdaftar di ALLOWED_ORIGINS Cloudflare Secrets.");
      return { success: false, message: "Akses API ditolak (CORS)" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Gagal menghubungi server validator:", error);
    return { success: false, message: "Gagal menghubungkan ke validator" };
  }
}

// Contoh pemakaian untuk MLBB:
validasiAkunGame("ml", "123456789", "2202").then(result => {
  if (result.success) {
    alert(`Nama Karakter Ditemukan: ${result.name}`);
  } else {
    alert(`Gagal Validasi: ${result.message}`);
  }
});
```

### 4.2 Menggunakan PHP (cURL) - Integrasi Server Backend
Request dari server backend toko Anda **tidak terpengaruh CORS** karena tidak dikirim melalui browser, sehingga pasti lolos autentikasi IP/domain.

```php
<?php
function validasiAkunGame($endpoint, $id, $zoneOrServer = null) {
    $baseUrl = "https://validator-games.derisfirmansyah177.workers.dev";
    $url = $baseUrl . "/" . $endpoint . "?id=" . urlencode($id);
    
    if ($zoneOrServer !== null) {
        $url .= "&zone=" . urlencode($zoneOrServer);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    // Server-to-server request
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    
    return [
        "success" => false,
        "message" => "Validator HTTP Code " . $httpCode
    ];
}

// Contoh pemakaian:
$result = validasiAkunGame("ml", "123456789", "2202");
if ($result['success']) {
    echo "Karakter ditemukan: " . $result['name'];
} else {
    echo "Gagal: " . $result['message'];
}
?>
```
