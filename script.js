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
    playerToggle: document.getElementById('playerToggle'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeIcon: document.getElementById('volumeIcon'),
    volumePercentage: document.getElementById('volumePercentage'),
    trackTitle: document.getElementById('trackTitle'),
    fabMain: document.getElementById('fabMain'),
    toastContainer: document.getElementById('toastContainer'),
    quickViewModal: document.getElementById('quickViewModal'),
    modalClose: document.getElementById('modalClose'),
    newsletterClose: document.getElementById('newsletterClose'),
    newsletterBtn: document.getElementById('newsletterBtn'),
    newsletterEmail: document.getElementById('newsletterEmail')
};

// ===== SISTEMA DE AUDIO =====
class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentVolume = 0.5;
        this.isMuted = false;
        this.initializeAudio();
    }

    initializeAudio() {
        this.audio.loop = false;
        this.audio.volume = this.currentVolume;
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('error', (e) => {
            console.warn('Audio error:', e);
            this.showToast('Error al cargar la música', 'error');
        });
        this.loadTrack(currentTrack);
    }

    loadTrack(index) {
        if (index >= 0 && index < musicTracks.length) {
            const track = musicTracks[index];
            this.audio.src = track.src;
            if (DOM.trackTitle) {
                DOM.trackTitle.textContent = track.title;
            }
            currentTrack = index;
        }
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.showToast('Reproduciendo música', 'success');
        } catch (error) {
            console.warn('Autoplay blocked:', error);
            this.showToast('Haz clic para reproducir la música', 'warning');
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
        if (DOM.volumePercentage) {
            DOM.volumePercentage.textContent = Math.round(this.currentVolume * 100) + '%';
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
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
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
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    remove(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, CONFIG.ANIMATION_DURATION);
    }

    clear() {
        const toasts = DOM.toastContainer.querySelectorAll('.toast');
        toasts.forEach(toast => this.remove(toast));
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
        // Datos de ejemplo para sugerencias
        this.suggestions = [
            { text: 'RetroArch', type: 'emulator', category: 'multi-sistema' },
            { text: 'Dolphin', type: 'emulator', category: 'gamecube-wii' },
            { text: 'PPSSPP', type: 'emulator', category: 'psp' },
            { text: 'PCSX2', type: 'emulator', category: 'ps2' },
            { text: 'Super Mario Bros', type: 'rom', category: 'nintendo' },
            { text: 'Sonic the Hedgehog', type: 'rom', category: 'sega' },
            { text: 'Final Fantasy VII', type: 'rom', category: 'playstation' },
            { text: 'Configurar controles', type: 'tutorial', category: 'configuracion' },
            { text: 'Optimizar rendimiento', type: 'tutorial', category: 'rendimiento' }
        ];
    }

    toggle() {
        if (this.isActive) {
            this.close();
        } else {
            this.open();
        }
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
                div.innerHTML = `
                    <strong>${this.highlightMatch(item.text, DOM.searchInput.value)}</strong>
                    <small style="color: var(--text-muted); margin-left: 1rem;">${item.type}</small>
                `;
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

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span style="color: var(--primary-color);">$1</span>');
    }

    clearSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.classList.remove('active');
        }
    }

    filterCards(query) {
        const cards = document.querySelectorAll('.card');
        const lowerQuery = query.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => 
                tag.textContent.toLowerCase()
            );

            const matches = title.includes(lowerQuery) ||
                          description.includes(lowerQuery) ||
                          tags.some(tag => tag.includes(lowerQuery));

            card.style.display = matches ? 'flex' : 'none';
        });
    }
}

// ===== SISTEMA DE ANIMACIONES =====
class AnimationManager {
    constructor() {
        this.observer = null;
        this.initializeIntersectionObserver();
    }

    initializeIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

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
        // Observar elementos con clases de animación
        const elementsToObserve = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
        elementsToObserve.forEach(el => this.observer.observe(el));
    }

    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = this.formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = this.formatNumber(Math.floor(start));
            }
        }, 16);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    animateProgress(element, percentage, duration = 1000) {
        let start = 0;
        const increment = percentage / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= percentage) {
                element.style.width = percentage + '%';
                clearInterval(timer);
            } else {
                element.style.width = Math.floor(start) + '%';
            }
        }, 16);
    }
}

// ===== GESTOR DE FAVORITOS =====
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
        this.save();
    }

    updateButton(button, isFavorite) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        }
        button.style.color = isFavorite ? 'var(--error-color)' : '';
    }

    updateFavoriteButtons() {
        document.querySelectorAll('[onclick*="toggleFavorite"]').forEach((button, index) => {
            const isFavorite = this.favorites.includes(index.toString());
            this.updateButton(button, isFavorite);
        });
    }

    save() {
        localStorage.setItem('retrohub-favorites', JSON.stringify(this.favorites));
    }

    getFavorites() {
        return this.favorites;
    }
}

// ===== GESTOR DE FILTROS =====
class FilterManager {
    constructor() {
        this.activeFilter = 'all';
        this.initializeFilters();
    }

    initializeFilters() {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        document.querySelectorAll('.quick-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    setFilter(filter) {
        this.activeFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        // Filter cards
        this.filterCards();
        toastManager.show(`Filtro aplicado: ${filter}`, 'info');
    }

    filterByCategory(category) {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const matches = cardCategory.includes(category) || category === 'all';
            
            card.style.display = matches ? 'flex' : 'none';
            
            if (matches) {
                card.style.animation = 'fadeIn 0.5s ease forwards';
            }
        });

        toastManager.show(`Mostrando: ${category}`, 'info');
    }

    filterCards() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            let shouldShow = true;
            
            if (this.activeFilter !== 'all') {
                const cardCategories = card.dataset.category || '';
                shouldShow = cardCategories.includes(this.activeFilter);
            }
            
            card.style.display = shouldShow ? 'flex' : 'none';
        });
    }
}

// ===== GESTOR DE TEMA =====
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('retrohub-theme') || 'dark';
        this.themes = {
            dark: {
                '--primary-color': '#ff00ff',
                '--secondary-color': '#00ffff',
                '--bg-color': '#0a0a0a'
            },
            neon: {
                '--primary-color': '#00ff41',
                '--secondary-color': '#ff00ff',
                '--bg-color': '#000000'
            },
            cyber: {
                '--primary-color': '#ff6b35',
                '--secondary-color': '#4ecdc4',
                '--bg-color': '#1a1a2e'
            }
        };
        this.applyTheme(this.currentTheme);
    }

    toggle() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.setTheme(nextTheme);
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        this.applyTheme(themeName);
        localStorage.setItem('retrohub-theme', themeName);
        toastManager.show(`Tema cambiado: ${themeName}`, 'success');
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        Object.entries(theme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }
}

// ===== INSTANCIAS GLOBALES =====
let audioManager;
let toastManager;
let searchManager;
let animationManager;
let favoritesManager;
let filterManager;
let themeManager;

// ===== FUNCIONES GLOBALES =====
function toggleFavorite(button) {
    const card = button.closest('.card');
    const title = card.querySelector('h3').textContent;
    favoritesManager.toggle(title, button);
}

function showToast(message, type = 'info') {
    toastManager.show(message, type);
}

function toggleMusicPlayer() {
    DOM.musicPlayer.classList.toggle('minimized');
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function openQuickView(emulatorId) {
    // Datos de ejemplo para la vista rápida
    const emulatorData = {
        retroarch: {
            title: 'RetroArch',
            description: 'RetroArch es un frontend para emuladores, motores de juegos y reproductores multimedia.',
            features: ['Multi-sistema', 'Shaders', 'Netplay', 'Rewind'],
            platforms: ['Windows', 'Mac', 'Linux', 'Android', 'iOS'],
            website: 'https://www.retroarch.com/'
        },
        dolphin: {
            title: 'Dolphin',
            description: 'Dolphin es un emulador para GameCube y Wii.',
            features: ['HD Graphics', 'Save States', 'Controller Support'],
            platforms: ['Windows', 'Mac', 'Linux', 'Android'],
            website: 'https://dolphin-emu.org/'
        }
    };

    const data = emulatorData[emulatorId];
    if (!data) return;

    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalBody').innerHTML = `
        <div class="modal-emulator-info">
            <p style="margin-bottom: 1.5rem; line-height: 1.6;">${data.description}</p>
            
            <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">Características:</h4>
            <ul style="margin-bottom: 1.5rem;">
                ${data.features.map(feature => `<li style="margin-bottom: 0.5rem;">• ${feature}</li>`).join('')}
            </ul>
            
            <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">Plataformas:</h4>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
                ${data.platforms.map(platform => `<span class="tag">${platform}</span>`).join('')}
            </div>
            
            <div style="text-align: center;">
                <a href="${data.website}" target="_blank" class="btn btn-primary">
                    <span>Visitar Sitio Oficial</span>
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;

    DOM.quickViewModal.classList.add('active');
}

function closeModal() {
    DOM.quickViewModal.classList.remove('active');
}

// ===== PRELOADER =====
function simulateLoading() {
    let progress = 0;
    const loadingTexts = [
        'Inicializando sistema...',
        'Cargando emuladores...',
        'Verificando ROMs...',
        'Configurando audio...',
        'Preparando interfaz...',
        '¡Listo para jugar!'
    ];
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        
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
        
        // Cambiar texto de carga
        const textIndex = Math.floor((progress / 100) * (loadingTexts.length - 1));
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = loadingTexts[textIndex];
        }
    }, 200);
}

// ===== INICIALIZACIÓN DE ANIMACIONES =====
function initializeAnimations() {
    // Animar contadores en el hero
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseInt(counter.dataset.target);
        if (target) {
            animationManager.animateCounter(counter, target);
        }
    });

    // Animar elementos visibles
    setTimeout(() => {
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            if (isElementInViewport(el)) {
                el.classList.add('visible');
            }
        });
    }, 1000);
}

// ===== UTILIDADES =====
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 RetroHub Pro iniciando...');
    
    // Ocultar overflow durante la carga
    document.body.style.overflow = 'hidden';
    
    // Inicializar managers
    audioManager = new AudioManager();
    toastManager = new ToastManager();
    searchManager = new SearchManager();
    animationManager = new AnimationManager();
    favoritesManager = new FavoritesManager();
    filterManager = new FilterManager();
    themeManager = new ThemeManager();
    
    // Simular carga
    simulateLoading();
    
    // ===== HEADER Y NAVEGACIÓN =====
    if (DOM.menuToggle && DOM.navigation) {
        DOM.menuToggle.addEventListener('click', () => {
            DOM.navigation.classList.toggle('active');
            DOM.menuToggle.classList.toggle('active');
        });
    }
    
    // Cerrar menú móvil al hacer clic en enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            DOM.navigation.classList.remove('active');
            DOM.menuToggle.classList.remove('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
            DOM.header.classList.add('scrolled');
        } else {
            DOM.header.classList.remove('scrolled');
        }
    }, 100));
    
    // ===== BÚSQUEDA =====
    if (DOM.searchToggle) {
        DOM.searchToggle.addEventListener('click', () => searchManager.toggle());
    }
    
    if (DOM.searchClose) {
        DOM.searchClose.addEventListener('click', () => searchManager.close());
    }
    
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', debounce((e) => {
            searchManager.search(e.target.value);
        }, CONFIG.SEARCH_DELAY));
        
        DOM.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchManager.close();
            }
        });
    }
    
    // Cerrar búsqueda al hacer clic fuera
    DOM.searchOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.searchOverlay) {
            searchManager.close();
        }
    });
    
    // ===== REPRODUCTOR DE MÚSICA =====
    if (DOM.playerToggle) {
        DOM.playerToggle.addEventListener('click', toggleMusicPlayer);
    }
    
    if (DOM.playPauseBtn) {
        DOM.playPauseBtn.addEventListener('click', () => audioManager.togglePlayPause());
    }
    
    if (DOM.volumeSlider) {
        DOM.volumeSlider.addEventListener('input', (e) => {
            audioManager.setVolume(parseFloat(e.target.value));
        });
    }
    
    if (DOM.volumeIcon) {
        DOM.volumeIcon.addEventListener('click', () => audioManager.toggleMute());
    }
    
    // Botones de control adicionales
    document.getElementById('prevBtn')?.addEventListener('click', () => audioManager.prevTrack());
    document.getElementById('nextBtn')?.addEventListener('click', () => audioManager.nextTrack());
    
    // Click en reproductor minimizado para expandir
    DOM.musicPlayer.addEventListener('click', (e) => {
        if (DOM.musicPlayer.classList.contains('minimized') && e.target === DOM.musicPlayer) {
            DOM.musicPlayer.classList.remove('minimized');
        }
    });
    
    // ===== FLOATING ACTION BUTTON =====
    if (DOM.fabMain) {
        DOM.fabMain.addEventListener('click', () => {
            document.querySelector('.fab-container').classList.toggle('active');
        });
    }
    
    // FAB Options
    document.querySelectorAll('.fab-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            
            switch(action) {
                case 'scroll-top':
                    scrollToTop();
                    break;
                case 'toggle-theme':
                    themeManager.toggle();
                    break;
                case 'feedback':
                    toastManager.show('¡Gracias por tu interés! Función próximamente', 'info');
                    break;
            }
            
            document.querySelector('.fab-container').classList.remove('active');
        });
    });
    
    // ===== MODAL =====
    if (DOM.modalClose) {
        DOM.modalClose.addEventListener('click', closeModal);
    }
    
    DOM.quickViewModal.addEventListener('click', (e) => {
        if (e.target === DOM.quickViewModal) {
            closeModal();
        }
    });
    
    // Quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const emulatorId = e.currentTarget.dataset.emulator;
            openQuickView(emulatorId);
        });
    });
    
    // ===== NEWSLETTER =====
    if (DOM.newsletterClose) {
        DOM.newsletterClose.addEventListener('click', () => {
            document.querySelector('.newsletter-banner').style.display = 'none';
        });
    }
    
    if (DOM.newsletterBtn) {
        DOM.newsletterBtn.addEventListener('click', () => {
            const email = DOM.newsletterEmail.value;
            if (email && email.includes('@')) {
                toastManager.show('¡Gracias por suscribirte!', 'success');
                DOM.newsletterEmail.value = '';
                document.querySelector('.newsletter-banner').style.display = 'none';
            } else {
                toastManager.show('Por favor ingresa un email válido', 'error');
            }
        });
    }
    
    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = DOM.header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K para búsqueda
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchManager.toggle();
        }
        
        // Espacio para play/pause (solo si no hay input activo)
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            audioManager.togglePlayPause();
        }
        
        // ESC para cerrar modales
        if (e.key === 'Escape') {
            closeModal();
            searchManager.close();
        }
    });
    
    // ===== CARDS HOVER EFFECTS =====
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // ===== LOAD MORE FUNCTIONALITY =====
    document.getElementById('loadMoreEmulators')?.addEventListener('click', function() {
        this.innerHTML = '<span class="loading"></span> Cargando...';
        
        setTimeout(() => {
            toastManager.show('¡Más emuladores cargados!', 'success');
            this.innerHTML = '<span>Cargar más emuladores</span><i class="fas fa-plus"></i>';
        }, 2000);
    });
    
    // ===== ANALYTICS Y TRACKING =====
    // Tracking de eventos importantes
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', (e) => {
            console.log('External link clicked:', e.target.href);
            // Aquí se puede agregar Google Analytics o similar
        });
    });
    
    // ===== ERROR HANDLING =====
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        toastManager.show('Ha ocurrido un error. Por favor recarga la página.', 'error');
    });
    
    // ===== PERFORMANCE MONITORING =====
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('⚡ Page Load Time:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms');
            }, 0);
        });
    }
    
    // ===== FINALIZACIÓN =====
    console.log('✅ RetroHub Pro inicializado correctamente');
    toastManager.show('¡Bienvenido a RetroHub Pro!', 'success');
});

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker falló:', error);
            });
    });
}

// ===== EASTER EGGS =====
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-konamiSequence.length);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        console.log('🎮 Código Konami activado!');
        document.body.style.animation = 'rainbow 2s linear infinite';
        toastManager.show('🎉 ¡Código Konami activado! Modo retro habilitado', 'success');
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 10000);
        
        konamiCode = [];
    }
});

// ===== EXPORTS PARA TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioManager,
        ToastManager,
        SearchManager,
        AnimationManager,
        FavoritesManager,
        FilterManager,
        ThemeManager
    };
}