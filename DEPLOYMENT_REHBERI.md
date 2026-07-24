# DiyetGPT Projesi - Canlıya Alma (Deployment) Rehberi

Bu rehber, projenin VDS/VPS gibi Linux (Ubuntu/Debian) tabanlı bir sunucuya yüklenmesi ve Docker üzerinden ayağa kaldırılması için gerekli adımları içerir. Sistem, frontend ve backend'i tek bir kapsayıcıda (container) çalıştıracak şekilde yapılandırılmıştır ve veritabanı dosyalarınız (`database.sqlite`) Docker Volume üzerinden kalıcı (persistent) hale getirilmiştir.

## Gereksinimler

Sunucunuzda aşağıdaki yazılımların kurulu olduğundan emin olun:
- **Docker:** (Kurulum: `sudo apt-get install docker.io -y`)
- **Docker Compose:** (Kurulum: `sudo apt-get install docker-compose -y`)
- **Git:** Proje dosyalarınızı çekmek için.

## Kurulum ve Ayağa Kaldırma Adımları

**1. Proje Dosyalarını Sunucuya Çekin**
Terminal üzerinden sunucunuza bağlanın (SSH) ve projeyi klonlayın/yükleyin:
```bash
git clone <sizin-repo-url-adresiniz>
cd DiyetGPT/Kaloriuygulaması
```
*(Eğer GitHub/GitLab kullanmıyorsanız, dosyalarınızı FileZilla/SCP ile sunucuya atıp `Kaloriuygulaması` klasörüne girin)*

**2. Ortam Değişkenlerini (.env) Hazırlayın**
Backend klasörünün içindeki `.env` dosyasını üretim ortamına göre güncelleyin.
```bash
nano backend/.env
```
İçeriğini aşağıdaki gibi düzenleyin:
```env
PORT=5000
GEMINI_API_KEY=Sizin_Gercek_Gemini_Api_Keyiniz
SESSION_SECRET=Guclu_Bir_Sifre_Belirleyin
IYZICO_API_KEY=Sizin_Gercek_Iyzico_Api_Keyiniz
IYZICO_SECRET_KEY=Sizin_Gercek_Iyzico_Secret_Keyiniz
IYZICO_BASE_URL=https://api.iyzipay.com  # (Canlı ortam için. Test için sandbox-api.iyzipay.com kullanın)
DB_PATH=/app/backend/data/database.sqlite
```
*`Ctrl+O`, `Enter`, `Ctrl+X` tuşlarına basarak kaydedin ve çıkın.*

**3. Docker Compose ile Projeyi Ayağa Kaldırın**
Ana proje dizininde (`Kaloriuygulaması`) olduğunuzdan emin olun ve aşağıdaki komutu çalıştırın:
```bash
sudo docker-compose up -d --build
```
Bu komut, sırasıyla:
- Frontend (React) kodlarınızı derler (build).
- Backend (Node.js) bağımlılıklarını kurar.
- Express sunucusunu ayağa kaldırır ve frontend statik dosyalarını yayınlar.
- Veritabanı dosyaları için güvenli bir volume (kalıcı depolama alanı) oluşturur.

**4. Canlılık Kontrolü**
Sistemin çalıştığını kontrol etmek için logları izleyebilirsiniz:
```bash
sudo docker-compose logs -f
```

## Güvenlik ve SSL (Opsiyonel ama Önerilir)

Uygulamanız şu anda `http://SUNUCU_IP_ADRESI:5000` üzerinden yayın yapacaktır. Gerçek bir canlı ortam için Nginx Reverse Proxy ve Let's Encrypt (Certbot) kullanarak SSL sertifikası (HTTPS) almanız şiddetle önerilir.

Kısaca Nginx ayarı için `/etc/nginx/sites-available/diyetgpt` dosyanızı şu şekilde ayarlayabilirsiniz:
```nginx
server {
    listen 80;
    server_name www.site-adiniz.com site-adiniz.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Ardından `sudo certbot --nginx -d site-adiniz.com -d www.site-adiniz.com` komutu ile SSL sertifikanızı ücretsiz oluşturabilirsiniz.
