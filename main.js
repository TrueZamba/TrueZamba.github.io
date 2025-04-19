// main.js

// --- SONIDO RETRO AL HACER CLIC EN ENLACES ---

// Crea un elemento de audio (puedes usar un sonido .wav o .mp3 corto y retro) // sonido retro corto

// Añade el sonido a todos los enlaces
document.addEventListener('DOMContentLoaded', () => {
    const beepSound = new Audio(''); // ruta correcta
  
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        beepSound.currentTime = 0;
        beepSound.play();
      });
    });
  });
  

// --- ANIMACIÓN DE "SCANLINES" (líneas horizontales como CRT) ---
function createScanlines() {
  const scanlines = document.createElement('div');
  scanlines.id = 'scanlines';
  scanlines.style.position = 'fixed';
  scanlines.style.top = 0;
  scanlines.style.left = 0;
  scanlines.style.width = '100vw';
  scanlines.style.height = '100vh';
  scanlines.style.pointerEvents = 'none';
  scanlines.style.zIndex = 1000;
  scanlines.style.background = 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.15) 3px, transparent 5px)';
  document.body.appendChild(scanlines);
}
createScanlines();

// --- EFECTO DE "GLITCH" EN EL TÍTULO AL PASAR EL MOUSE ---
function glitchText(element) {
  const originalText = element.textContent;
  element.addEventListener('mouseenter', () => {
    let glitchInterval = setInterval(() => {
      element.textContent = originalText.split('').map(char => {
        return Math.random() > 0.8 ? String.fromCharCode(33 + Math.random() * 94) : char;
      }).join('');
    }, 50);
    element.addEventListener('mouseleave', () => {
      clearInterval(glitchInterval);
      element.textContent = originalText;
    }, { once: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const h1 = document.querySelector('h1');
  if (h1) glitchText(h1);
});

// --- EFECTO DE PARPADEO EN LOS ENLACES AL PASAR EL MOUSE ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.classList.add('blink');
    });
    link.addEventListener('mouseleave', () => {
      link.classList.remove('blink');
    });
  });
});

// --- EFECTO DE PARPADEO EN CSS (añade esto a tu style.css) ---
// .blink {
//   animation: blink 0.15s steps(2, start) 3;
// }
// @keyframes blink {
//   to { visibility: hidden; }
// }

// --- OPCIONAL: ANIMACIÓN DE TEXTO DE CONSOLA EN EL MENSAJE DE BIENVENIDA ---
document.addEventListener('DOMContentLoaded', () => {
  const welcome = document.createElement('div');
  welcome.style.position = 'fixed';
  welcome.style.bottom = '20px';
  welcome.style.left = '50%';
  welcome.style.transform = 'translateX(-50%)';
  welcome.style.background = '#111';
  welcome.style.color = '#39ff14';
  welcome.style.fontFamily = "'Press Start 2P', monospace";
  welcome.style.padding = '10px 24px';
  welcome.style.border = '2px solid #ff5e00';
  welcome.style.borderRadius = '8px';
  welcome.style.zIndex = 2000;
  welcome.style.fontSize = '1em';
  welcome.style.boxShadow = '0 0 20px #39ff14';
  document.body.appendChild(welcome);

  const message = "¡Bienvenido a nuestro proyecto!";
  let i = 0;
  function typeWriter() {
    if (i < message.length) {
      welcome.textContent += message.charAt(i);
      i++;
      setTimeout(typeWriter, 40);
    } else {
      setTimeout(() => {
        welcome.style.transition = 'opacity 1s';
        welcome.style.opacity = 0;
        setTimeout(() => welcome.remove(), 1000);
      }, 2000);
    }
  }
  typeWriter();
});
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });
  