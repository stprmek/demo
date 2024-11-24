class ZikirMatik {
    constructor() {
        // Temel özellikler
        this.count = 0;
        this.target = 33;
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.autoSaveEnabled = true;
        
        // Zikir veritabanı
        this.zikirler = {
            subhanallah: {
                name: "Sübhanallah",
                meaning: "Allah'ı tüm eksikliklerden tenzih ederim",
                arabic: "سُبْحَانَ ٱللَّٰهِ",
                target: 33
            },
            elhamdulillah: {
                name: "Elhamdülillah",
                meaning: "Hamd Allah'a mahsustur",
                arabic: "ٱلْحَمْدُ لِلَّٰهِ",
                target: 33
            },
            allahuekber: {
                name: "Allahu Ekber",
                meaning: "Allah en büyüktür",
                arabic: "ٱللَّٰهُ أَكْبَرُ",
                target: 33
            }
        };

        // İstatistik verileri
        this.stats = {
            daily: {},
            weekly: {},
            monthly: {},
            total: 0
        };

        this.currentZikir = 'subhanallah';
        this.currentTab = 'daily';
        this.chart = null;

        // Başlangıç fonksiyonları
        this.loadSettings();
        this.loadStats();
        this.initializeEventListeners();
        this.initializeChart();
        this.updateDisplay();
    }

    initializeEventListeners() {
        // Sayaç kontrolleri
        document.getElementById('increment').addEventListener('click', () => this.increment());
        document.getElementById('decrement').addEventListener('click', () => this.decrement());
        document.getElementById('reset').addEventListener('click', () => this.reset());

        // Ayarlar kontrolleri
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('settingsToggle').addEventListener('click', () => this.toggleSettings());
        document.getElementById('targetCount').addEventListener('change', (e) => this.updateTarget(e));
        document.getElementById('vibrationToggle').addEventListener('change', (e) => this.toggleVibration(e));
        document.getElementById('autoSaveToggle').addEventListener('change', (e) => this.toggleAutoSave(e));

        // Zikir kontrolleri
        document.getElementById('zikirSelect').addEventListener('change', (e) => this.changeZikir(e));
        document.getElementById('searchZikir').addEventListener('input', (e) => this.searchZikir(e));
        document.getElementById('addNewZikir').addEventListener('click', () => this.addNewZikir());
        document.getElementById('editZikir').addEventListener('click', () => this.editCurrentZikir());
        document.getElementById('deleteZikir').addEventListener('click', () => this.deleteCurrentZikir());

        // İstatistik kontrolleri
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.changeStatsTab(e));
        });

        // Klavye kontrolleri
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    increment() {
        this.count++;
        if (this.vibrationEnabled) navigator.vibrate(50);
        if (this.soundEnabled) this.playSound();
        
        if (this.count === this.target) {
            this.onTargetReached();
        }

        this.updateDisplay();
        this.updateStats();
        if (this.autoSaveEnabled) this.saveStats();
    }

    decrement() {
        if (this.count > 0) {
            this.count--;
            this.updateDisplay();
            this.updateStats();
            if (this.autoSaveEnabled) this.saveStats();
        }
    }

    reset() {
        if (confirm('Sayacı sıfırlamak istediğinizden emin misiniz?')) {
            this.count = 0;
            this.updateDisplay();
        }
    }

    changeZikir(e) {
        this.currentZikir = e.target.value;
        const zikir = this.zikirler[this.currentZikir];
        
        document.getElementById('zikirArabic').textContent = zikir.arabic;
        document.getElementById('currentZikir').textContent = zikir.name;
        document.getElementById('zikirMeaning').textContent = zikir.meaning;
        
        this.target = zikir.target;
        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('count').textContent = this.count;
        document.getElementById('targetDisplay').textContent = this.target;
        
        const progress = (this.count / this.target) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
    }

    playSound() {
        const audio = new Audio('click.mp3');
        audio.play().catch(e => console.log('Ses çalınamadı:', e));
    }

    onTargetReached() {
        alert(`Hedef sayıya (${this.target}) ulaştınız!`);
        if (this.vibrationEnabled) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
        this.saveSettings();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = document.querySelector('#soundToggle i');
        icon.classList.toggle('fa-volume-up');
        icon.classList.toggle('fa-volume-mute');
        this.saveSettings();
    }

    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    updateTarget(e) {
        const newTarget = parseInt(e.target.value);
        if (newTarget > 0) {
            this.target = newTarget;
            this.updateDisplay();
            this.saveSettings();
        }
    }

    toggleVibration(e) {
        this.vibrationEnabled = e.target.checked;
        this.saveSettings();
    }

    toggleAutoSave(e) {
        this.autoSaveEnabled = e.target.checked;
        this.saveSettings();
    }

    addNewZikir() {
        const name = prompt('Zikir adını giriniz:');
        if (!name) return;

        const arabic = prompt('Arapça metnini giriniz:');
        if (!arabic) return;

        const meaning = prompt('Anlamını giriniz:');
        if (!meaning) return;

        const target = parseInt(prompt('Hedef sayıyı giriniz:', '33')) || 33;

        const key = name.toLowerCase().replace(/\s+/g, '');
        this.zikirler[key] = { name, arabic, meaning, target };

        const option = document.createElement('option');
        option.value = key;
        option.textContent = name;
        document.getElementById('zikirSelect').appendChild(option);

        this.saveSettings();
    }

    editCurrentZikir() {
        const zikir = this.zikirler[this.currentZikir];
        if (!zikir) return;

        const name = prompt('Zikir adını giriniz:', zikir.name);
        if (!name) return;

        const arabic = prompt('Arapça metnini giriniz:', zikir.arabic);
        if (!arabic) return;

        const meaning = prompt('Anlamını giriniz:', zikir.meaning);
        if (!meaning) return;

        const target = parseInt(prompt('Hedef sayıyı giriniz:', zikir.target)) || 33;

        zikir.name = name;
        zikir.arabic = arabic;
        zikir.meaning = meaning;
        zikir.target = target;

        this.changeZikir({ target: { value: this.currentZikir } });
        this.saveSettings();
    }

    deleteCurrentZikir() {
        if (Object.keys(this.zikirler).length <= 1) {
            alert('En az bir zikir bulunmalıdır!');
            return;
        }

        if (confirm('Bu zikri silmek istediğinizden emin misiniz?')) {
            delete this.zikirler[this.currentZikir];
            document.querySelector(`option[value="${this.currentZikir}"]`).remove();
            this.currentZikir = Object.keys(this.zikirler)[0];
            this.changeZikir({ target: { value: this.currentZikir } });
            this.saveSettings();
        }
    }

    searchZikir(e) {
        const searchTerm = e.target.value.toLowerCase();
        const select = document.getElementById('zikirSelect');
        Array.from(select.options).forEach(option => {
            const matches = option.text.toLowerCase().includes(searchTerm);
            option.style.display = matches ? '' : 'none';
        });
    }

    changeStatsTab(e) {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentTab = e.target.dataset.tab;
        this.displayStats();
        this.updateChart();
    }

    updateStats() {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const weekStr = this.getWeekNumber(date);
        const monthStr = `${date.getFullYear()}-${date.getMonth() + 1}`;

        // İstatistik objelerini oluştur (eğer yoksa)
        if (!this.stats.daily) this.stats.daily = {};
        if (!this.stats.weekly) this.stats.weekly = {};
        if (!this.stats.monthly) this.stats.monthly = {};
        if (!this.stats.total) this.stats.total = 0;

        // İstatistikleri güncelle
        this.stats.daily[dateStr] = (this.stats.daily[dateStr] || 0) + 1;
        this.stats.weekly[weekStr] = (this.stats.weekly[weekStr] || 0) + 1;
        this.stats.monthly[monthStr] = (this.stats.monthly[monthStr] || 0) + 1;
        this.stats.total++;

        this.displayStats();
        this.updateChart();
        if (this.autoSaveEnabled) this.saveStats();
    }

    initializeChart() {
        const ctx = document.getElementById('statsChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Zikir Sayısı',
                    data: [],
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateChart() {
        const stats = this.stats[this.currentTab];
        const sortedStats = Object.entries(stats)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-7);

        this.chart.data.labels = sortedStats.map(([date]) => this.formatDate(date));
        this.chart.data.datasets[0].data = sortedStats.map(([, count]) => count);
        this.chart.update();
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return `${date.getFullYear()}-W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
    }

    formatDate(dateStr) {
        if (dateStr.includes('W')) {
            const [year, week] = dateStr.split('-W');
            return `${year} ${week}. Hafta`;
        }
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    saveSettings() {
        const settings = {
            target: this.target,
            soundEnabled: this.soundEnabled,
            vibrationEnabled: this.vibrationEnabled,
            autoSaveEnabled: this.autoSaveEnabled,
            zikirler: this.zikirler,
            theme: document.body.classList.contains('dark-theme')
        };
        localStorage.setItem('zikirSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('zikirSettings'));
        if (settings) {
            this.target = settings.target || 33;
            this.soundEnabled = settings.soundEnabled ?? true;
            this.vibrationEnabled = settings.vibrationEnabled ?? true;
            this.autoSaveEnabled = settings.autoSaveEnabled ?? true;
            this.zikirler = settings.zikirler || this.zikirler;
            if (settings.theme) document.body.classList.add('dark-theme');
        }
    }

    saveStats() {
        localStorage.setItem('zikirStats', JSON.stringify(this.stats));
    }

    loadStats() {
        const stats = JSON.parse(localStorage.getItem('zikirStats'));
        if (stats) {
            this.stats = stats;
        }
    }

    handleKeyPress(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                this.increment();
                break;
            case 'Backspace':
                e.preventDefault();
                this.decrement();
                break;
            case 'r':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.reset();
                }
                break;
        }
    }

    displayStats() {
        const statsDiv = document.getElementById('stats');
        statsDiv.innerHTML = '';
        
        const stats = this.stats[this.currentTab];
        if (!stats) return;

        // İstatistikleri tarihe göre sırala
        const sortedStats = Object.entries(stats)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 7);

        // İstatistik kartları oluştur
        sortedStats.forEach(([date, count]) => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <div class="stat-date">${this.formatDate(date)}</div>
                <div class="stat-count">${count} zikir</div>
            `;
            statsDiv.appendChild(statCard);
        });

        // Toplam zikir sayısını göster
        const totalCard = document.createElement('div');
        totalCard.className = 'stat-card total';
        totalCard.innerHTML = `
            <div class="stat-label">Toplam Zikir</div>
            <div class="stat-count">${this.stats.total || 0}</div>
        `;
        statsDiv.appendChild(totalCard);
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    const zikirMatik = new ZikirMatik();
}); 