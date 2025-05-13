// Esperar a que se cargue todo el contenido
document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const preloader = document.querySelector('.preloader');
    const progress = document.querySelector('.progress');
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    // Elementos del reproductor de música
    const musicPlayer = document.querySelector('.music-player');
    const playPauseBtn = document.getElementById('play-pause');
    const volumeControl = document.getElementById('volume');
    const playerToggle = document.querySelector('.player-toggle');
    
    // Audio para la música de fondo
    const backgroundMusic = new Audio('audio/retrowave.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = volumeControl ? volumeControl.value : 0.5;
    
    // Evento para minimizar/maximizar el reproductor 
    if (playerToggle && musicPlayer) {
        playerToggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamiento por defecto
            musicPlayer.classList.toggle('minimized');
            console.log('Reproductor minimizado:', musicPlayer.classList.contains('minimized'));
        });
    } else {
        console.log('No se encontró el botón toggle o el reproductor');
    }
    
    // En móviles pequeños, comenzar con reproductor minimizado
    if (window.innerWidth <= 480 && musicPlayer) {
        musicPlayer.classList.add('minimized');
    }
    
    // Simulación de carga para el preloader
    let loadProgress = 0;
    const loadingInterval = setInterval(() => {
        loadProgress += Math.random() * 10;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadingInterval);
            
            // Ocultar el preloader después de completar la carga
            setTimeout(() => {
                if (preloader) {
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }
            }, 500);
        }
        if (progress) {
            progress.style.width = loadProgress + '%';
        }
    }, 200);
    
    // Función para cambiar el header cuando se hace scroll
    window.addEventListener('scroll', function() {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Toggle del menú móvil
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            
            // Cambiar el icono del menú
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Cerrar el menú móvil al hacer clic en un enlace
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // Control del reproductor de música
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            const icon = playPauseBtn.querySelector('i');
            
            if (backgroundMusic.paused) {
                // Intentar reproducir la música - puede fallar por políticas de autoplay
                const playPromise = backgroundMusic.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        // Reproducción iniciada con éxito
                        if (icon) {
                            icon.classList.remove('fa-play');
                            icon.classList.add('fa-pause');
                        }
                        
                        // Si el reproductor está minimizado, maximizarlo
                        if (musicPlayer && musicPlayer.classList.contains('minimized')) {
                            musicPlayer.classList.remove('minimized');
                        }
                    })
                    .catch(error => {
                        // Reproducción automática bloqueada
                        console.log("Reproducción automática bloqueada, requiere interacción del usuario:", error);
                    });
                }
            } else {
                backgroundMusic.pause();
                if (icon) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            }
        });
    }
    
    // Control de volumen
    if (volumeControl) {
        volumeControl.addEventListener('input', function() {
            backgroundMusic.volume = volumeControl.value;
            
            // Cambiar el icono según el volumen
            const volumeIcon = document.querySelector('.volume-control i');
            if (volumeIcon) {
                if (parseFloat(volumeControl.value) === 0) {
                    volumeIcon.className = 'fas fa-volume-mute';
                } else if (parseFloat(volumeControl.value) < 0.5) {
                    volumeIcon.className = 'fas fa-volume-down';
                } else {
                    volumeIcon.className = 'fas fa-volume-up';
                }
            }
        });
    }
    
    // Efecto de animaciones para los elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar todos los cards para animarlos cuando entren en el viewport
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
    
    // Añadir efecto de hover neón a las cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = 'var(--neon-box-shadow)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    // Añadir efecto de parpadeo a los textos neón
    const neonTexts = document.querySelectorAll('.neon-text');
    neonTexts.forEach(text => {
        // Añadir clase para animar aleatoriamente
        if (Math.random() > 0.7) {
            text.classList.add('flicker');
        }
    });
    
    // Efecto para los botones neón
    document.querySelectorAll('.neon-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 10px var(--primary-color), 0 0 20px var(--primary-color)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'var(--neon-box-shadow)';
        });
    });
    
    // Detectar si el navegador admite efectos de filtro
    const supportsBackdropFilter = 'backdropFilter' in document.documentElement.style || 
                                  '-webkit-backdrop-filter' in document.documentElement.style;
    
    // Fallback para navegadores que no soportan backdrop-filter
    if (!supportsBackdropFilter) {
        document.querySelectorAll('.music-player, header, nav').forEach(el => {
            el.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
        });
    }
    
    // Scroll suave para los enlaces del menú
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calcular la posición de desplazamiento considerando el header fijo
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Easter egg: Konami Code
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            if (konamiIndex === konamiCode.length) {
                // Activar easter egg
                document.body.classList.add('konami-activated');
                
                // Crear elementos para el efecto visual
                const easterEgg = document.createElement('div');
                easterEgg.className = 'easter-egg';
                easterEgg.innerHTML = '<h2 class="neon-text">¡CÓDIGO KONAMI ACTIVADO!</h2><p>¡Has encontrado un secreto!</p>';
                document.body.appendChild(easterEgg);
                
                // Eliminar después de unos segundos
                setTimeout(() => {
                    easterEgg.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(easterEgg);
                        document.body.classList.remove('konami-activated');
                    }, 1000);
                }, 3000);
                
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    // Añadir estilo CSS para el easter egg
    const easterEggStyle = document.createElement('style');
    easterEggStyle.textContent = `
        .easter-egg {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            z-index: 9999;
            animation: appear 0.5s ease;
            transition: opacity 1s ease;
            box-shadow: var(--neon-box-shadow);
        }
        
        @keyframes appear {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        .konami-activated .neon-text, .konami-activated .neon-btn {
            animation: rainbow 2s linear infinite;
        }
        
        @keyframes rainbow {
            0% { color: #ff0000; text-shadow: 0 0 10px #ff0000; }
            17% { color: #ff8000; text-shadow: 0 0 10px #ff8000; }
            33% { color: #ffff00; text-shadow: 0 0 10px #ffff00; }
            50% { color: #00ff00; text-shadow: 0 0 10px #00ff00; }
            67% { color: #0000ff; text-shadow: 0 0 10px #0000ff; }
            83% { color: #8000ff; text-shadow: 0 0 10px #8000ff; }
            100% { color: #ff0000; text-shadow: 0 0 10px #ff0000; }
        }
    `;
    document.head.appendChild(easterEggStyle);
});

// CSS adicional para las animaciones de entrada
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    .card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .card.in-view {
        opacity: 1;
        transform: translateY(0);
    }
    
    .neon-text.flicker {
        animation: flicker 3s infinite alternate;
    }
`;
document.head.appendChild(animationStyle);
