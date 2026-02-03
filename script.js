// ===== CONFIGURACIÓN Y VARIABLES GLOBALES =====
const CONFIG = {
    ANIMATION_DURATION: 300,
    SEARCH_DELAY: 500,
    TOAST_DURATION: 5000,
    MUSIC_FADE_DURATION: 1000,
    SCROLL_THRESHOLD: 100
};

let isLoading = false;
let searchTimeout = null;
let currentTheme = 'dark';
let favorites = JSON.parse(localStorage.getItem('retrohub-favorites') || '[]');
let musicTracks = [
    { title: 'Synthwave Dreams', artist: 'RetroHub Radio', src: 'audio/synthwave-dreams.mp3' },
    { title: 'Neon Nights', artist: 'Cyber Station', src: 'audio/neon-nights.mp3' },
    { title: 'Digital Horizon', artist: 'Future Beats', src: 'audio/digital-horizon.mp3' }
];
let currentTrack = 0;

// ===== ELEMENTOS DOM =====
const DOM = {
    preloader: document.getElementById('preloader'),
    loadProgress: document.getElementById('loadProgress'),
    progressText: document.getElementById('progressText'),
    header: document.getElementById('header'),
    navigation: document.getElementById('navigation'),
    menuToggle: document.getElementById('menuToggle'),
    searchToggle: document.getElementById('searchToggle'),
    searchOverlay: document.getElementById('searchOverlay'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchClose: document.getElementById('searchClose'),
    musicPlayer: document.getElementById('musicPlayer'),
    playerToggle: document.getElementById('playerToggle'), // Botón minimizar
    playPauseBtn: document.getElementById('playPauseBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeIcon: document.getElementById('volumeIcon'),
    trackTitle: document.getElementById('trackTitle'),
    toastContainer: document.getElementById('toastContainer'),
    quickViewModal: document.getElementById('quickViewModal'),
    modalClose: document.getElementById('modalClose')
};

// ===== SISTEMA DE AUDIO =====
class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.isLooping = false;
        this.currentVolume = 0.5;
        this.isMuted = false;
        this.initializeAudio();
        this.initializeLoopButton();
    }

    initializeAudio() {
        this.audio.loop = this.isLooping;
        this.audio.volume = this.currentVolume;
        
        this.audio.addEventListener('ended', () => {
            if (!this.isLooping) {
                this.nextTrack();
            }
        });

        this.audio.addEventListener('error', (e) => {
            console.warn('Audio error:', e);
            if (typeof showToast === 'function') showToast('Error al cargar la música', 'error');
        });
        
        this.loadTrack(currentTrack);
    }

    initializeLoopButton() {
        const loopBtn = document.getElementById('loopBtn');
        if (loopBtn) {
            loopBtn.addEventListener('click', () => this.toggleLoop());
        }
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        
        const loopBtn = document.getElementById('loopBtn');
        if (loopBtn) {
            if (this.isLooping) {
                loopBtn.classList.add('active');
                if (typeof showToast === 'function') showToast('Bucle activado', 'info');
            } else {
                loopBtn.classList.remove('active');
                if (typeof showToast === 'function') showToast('Bucle desactivado', 'info');
            }
        }
    }

    loadTrack(index) {
        if (index >= 0 && index < musicTracks.length) {
            const track = musicTracks[index];
            this.audio.src = track.src;
            if (DOM.trackTitle) {
                DOM.trackTitle.textContent = track.title;
            }
            const artistEl = document.querySelector('.track-artist');
            if (artistEl) {
                artistEl.textContent = track.artist;
            }
            currentTrack = index;
        }
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
            if (typeof showToast === 'function') showToast('Reproduciendo música', 'success');
        } catch (error) {
            console.warn('Autoplay blocked:', error);
            if (typeof showToast === 'function') showToast('Haz clic para reproducir la música', 'warning');
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    setVolume(volume) {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.isMuted ? 0 : this.currentVolume;
        this.updateVolumeDisplay();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.volume = this.isMuted ? 0 : this.currentVolume;
        this.updateVolumeDisplay();
    }

    nextTrack() {
        currentTrack = (currentTrack + 1) % musicTracks.length;
        this.loadTrack(currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }

    prevTrack() {
        currentTrack = currentTrack === 0 ? musicTracks.length - 1 : currentTrack - 1;
        this.loadTrack(currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }

    updatePlayButton() {
        if (DOM.playPauseBtn) {
            const icon = DOM.playPauseBtn.querySelector('i');
            if (icon) {
                icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    }

    updateVolumeDisplay() {
        if (DOM.volumeSlider) {
            DOM.volumeSlider.value = this.currentVolume;
        }
        if (DOM.volumeIcon) {
            let iconClass = 'fas fa-volume-up';
            if (this.isMuted || this.currentVolume === 0) {
                iconClass = 'fas fa-volume-mute';
            } else if (this.currentVolume < 0.5) {
                iconClass = 'fas fa-volume-down';
            }
            DOM.volumeIcon.className = iconClass;
        }
    }
}

// ===== SISTEMA DE NOTIFICACIONES =====
class ToastManager {
    constructor() {
        this.toasts = [];
    }

    show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
        const toast = this.createToast(message, type);
        DOM.toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => this.remove(toast), duration);
        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon"><i class="${icons[type] || icons.info}"></i></div>
            <div class="toast-content"><div class="toast-message">${message}</div></div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });
        return toast;
    }

    remove(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, CONFIG.ANIMATION_DURATION);
    }
}

// ===== SISTEMA DE BÚSQUEDA =====
class SearchManager {
    constructor() {
        this.suggestions = [];
        this.isActive = false;
        this.initializeSuggestions();
    }

    initializeSuggestions() {
        this.suggestions = [
            { text: 'RetroArch', type: 'emulator' },
            { text: 'Dolphin', type: 'emulator' },
            { text: 'PPSSPP', type: 'emulator' },
            { text: 'PCSX2', type: 'emulator' },
            { text: 'Super Mario Bros', type: 'rom' },
            { text: 'Sonic', type: 'rom' }
        ];
    }

    toggle() {
        if (this.isActive) this.close();
        else this.open();
    }

    open() {
        this.isActive = true;
        DOM.searchOverlay.classList.add('active');
        setTimeout(() => DOM.searchInput.focus(), CONFIG.ANIMATION_DURATION);
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isActive = false;
        DOM.searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        this.clearSuggestions();
    }

    search(query) {
        if (!query.trim()) {
            this.clearSuggestions();
            return;
        }
        const filteredSuggestions = this.suggestions.filter(item =>
            item.text.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
        this.showSuggestions(filteredSuggestions);
        this.filterCards(query);
    }

    showSuggestions(suggestions) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        container.innerHTML = '';
        if (suggestions.length === 0) {
            container.innerHTML = '<div class="suggestion-item">No se encontraron resultados</div>';
        } else {
            suggestions.forEach(item => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `<strong>${item.text}</strong> <small style="color:var(--text-muted)">${item.type}</small>`;
                div.addEventListener('click', () => {
                    DOM.searchInput.value = item.text;
                    this.search(item.text);
                    this.clearSuggestions();
                });
                container.appendChild(div);
            });
        }
        container.classList.add('active');
    }

    clearSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) container.classList.remove('active');
    }

    filterCards(query) {
        const cards = document.querySelectorAll('.card');
        const lowerQuery = query.toLowerCase();
        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            const matches = title.includes(lowerQuery) || description.includes(lowerQuery);
            card.style.display = matches ? 'flex' : 'none';
        });
    }
}

// ===== ANIMACIONES =====
class AnimationManager {
    constructor() {
        this.observer = null;
        this.initializeIntersectionObserver();
    }

    initializeIntersectionObserver() {
        const options = { threshold: 0.1 };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        this.observeElements();
    }

    observeElements() {
        document.querySelectorAll('.fade-in').forEach(el => this.observer.observe(el));
    }

    animateCounter(element, target) {
        let start = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target >= 1000 ? (target/1000).toFixed(0) + 'K' : target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }
}

// ===== FAVORITOS =====
class FavoritesManager {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('retrohub-favorites') || '[]');
        this.updateFavoriteButtons();
    }

    toggle(id, element) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.updateButton(element, false);
            toastManager.show('Eliminado de favoritos', 'info');
        } else {
            this.favorites.push(id);
            this.updateButton(element, true);
            toastManager.show('Agregado a favoritos', 'success');
        }
        localStorage.setItem('retrohub-favorites', JSON.stringify(this.favorites));
    }

    updateButton(button, isFavorite) {
        const icon = button.querySelector('i');
        if (icon) icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        button.style.color = isFavorite ? 'var(--error-color)' : '';
    }

    updateFavoriteButtons() {
        document.querySelectorAll('[onclick*="toggleFavorite"]').forEach((button, index) => {
            const isFavorite = this.favorites.includes(index.toString());
            this.updateButton(button, isFavorite);
        });
    }
}

// ===== FILTROS =====
class FilterManager {
    constructor() {
        this.activeFilter = 'all';
        this.initializeFilters();
    }

    initializeFilters() {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    setFilter(filter) {
        this.activeFilter = filter;
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const matches = this.activeFilter === 'all' || (card.dataset.category && card.dataset.category.includes(this.activeFilter));
            card.style.display = matches ? 'flex' : 'none';
        });
        toastManager.show(`Filtro aplicado: ${filter}`, 'info');
    }
}

// ===== INSTANCIAS GLOBALES =====
let audioManager, toastManager, searchManager, animationManager, favoritesManager, filterManager;

// ===== FUNCIONES GLOBALES =====
function toggleFavorite(button) {
    const title = button.closest('.card').querySelector('h3').textContent;
    favoritesManager.toggle(title, button);
}

function showToast(message, type = 'info') {
    toastManager.show(message, type);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeModal() {
    DOM.quickViewModal.classList.remove('active');
}

function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                DOM.preloader.classList.add('hidden');
                document.body.style.overflow = '';
                initializeAnimations();
            }, 500);
        }
        DOM.loadProgress.style.width = progress + '%';
        DOM.progressText.textContent = Math.floor(progress) + '%';
    }, 150);
}

function initializeAnimations() {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseInt(counter.dataset.target);
        if (target) animationManager.animateCounter(counter, target);
    });
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }, 500);
}

// ===== INICIO =====
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflow = 'hidden';
    
    audioManager = new AudioManager();
    toastManager = new ToastManager();
    searchManager = new SearchManager();
    animationManager = new AnimationManager();
    favoritesManager = new FavoritesManager();
    filterManager = new FilterManager();
    
    simulateLoading();
    
    // UI Events
    if (DOM.menuToggle) DOM.menuToggle.addEventListener('click', () => {
        DOM.navigation.classList.toggle('active');
        DOM.menuToggle.classList.toggle('active');
    });

    if (DOM.searchToggle) DOM.searchToggle.addEventListener('click', () => searchManager.toggle());
    if (DOM.searchClose) DOM.searchClose.addEventListener('click', () => searchManager.close());
    
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', (e) => searchManager.search(e.target.value));
        DOM.searchInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') searchManager.close(); });
    }

    // ===== LÓGICA DEL REPRODUCTOR =====
    
    // 1. Botón Minimizar: Clic específico en el botón
    if (DOM.playerToggle) {
        DOM.playerToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // IMPORTANTE: Evita que el clic se propague al contenedor
            DOM.musicPlayer.classList.add('minimized');
        });
    }

    // 2. Expandir: Clic en el cuerpo del reproductor cuando está minimizado
    if (DOM.musicPlayer) {
        DOM.musicPlayer.addEventListener('click', (e) => {
            // Solo expandir si ya está minimizado
            if (DOM.musicPlayer.classList.contains('minimized')) {
                DOM.musicPlayer.classList.remove('minimized');
            }
        });
    }

    // Controles de audio
    if (DOM.playPauseBtn) DOM.playPauseBtn.addEventListener('click', () => audioManager.togglePlayPause());
    if (DOM.volumeSlider) DOM.volumeSlider.addEventListener('input', (e) => audioManager.setVolume(parseFloat(e.target.value)));
    document.getElementById('prevBtn')?.addEventListener('click', () => audioManager.prevTrack());
    document.getElementById('nextBtn')?.addEventListener('click', () => audioManager.nextTrack());

    // Shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchManager.toggle(); }
        if (e.code === 'Space' && !e.target.matches('input, textarea')) { e.preventDefault(); audioManager.togglePlayPause(); }
        if (e.key === 'Escape') { closeModal(); searchManager.close(); }
    });

    // Konami Code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        konamiCode = konamiCode.slice(-konamiSequence.length);
        if (konamiCode.join('') === konamiSequence.join('')) {
            document.body.style.animation = 'rainbow 2s linear infinite';
            toastManager.show('🎉 ¡Código Konami activado!', 'success');
            setTimeout(() => document.body.style.animation = '', 5000);
        }
    });

    console.log('✅ Inicialización completa');
    // LINEA ELIMINADA AQUÍ
});
