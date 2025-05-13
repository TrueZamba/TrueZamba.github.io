# RetroHub - Hub de Emuladores y ROMs

RetroHub es un sitio web estilo retro con efectos neón, diseñado para servir como punto central para acceder a emuladores y repositorios de ROMs. Este proyecto utiliza HTML, CSS y JavaScript puro, sin frameworks adicionales.

![RetroHub Preview](img/preview.jpg)

## Características

- ✨ Diseño retro con efectos neón
- 🎮 Links a los principales emuladores y repositorios de ROMs
- 🎵 Reproductor de música de fondo
- ⏳ Preloader animado
- 📱 Diseño totalmente responsive
- 🎮 Easter egg (código Konami)

## Estructura del Proyecto

```
retrohub/
├──style.css
├──script.js
├── img/
│   ├── retroarch.jpg
│   ├── dolphin.jpg
│   ├── ppsspp.jpg
│   ├── pcsx2.jpg
│   ├── mame.jpg
│   ├── snes9x.jpg
│   ├── archive.jpg
│   ├── vimms.jpg
│   ├── cdromance.jpg
│   ├── romspedia.jpg
│   ├── hero-bg.jpg
│   └── preview.jpg
├── audio/
│   └── retrowave.mp3
├── index.html
└── README.md
```

## Instalación y Despliegue

### Opción 1: Despliegue local

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/retrohub.git
```

2. Navega al directorio del proyecto:
```bash
cd retrohub
```

3. Abre `index.html` en tu navegador preferido.

### Opción 2: Despliegue con GitHub Pages

1. Crea un repositorio en GitHub.

2. Sube todos los archivos del proyecto a tu repositorio:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

3. En GitHub, ve a la pestaña "Settings" de tu repositorio.

4. Desplázate hacia abajo hasta la sección "GitHub Pages".

5. En "Source", selecciona la rama "main" y haz clic en "Save".

6. Tu sitio web estará disponible en `https://tu-usuario.github.io/retrohub/`.

## Personalización

### Añadir tu propia música
1. Reemplaza el archivo `audio/retrowave.mp3` con tu música preferida.
2. Asegúrate de que el archivo tenga el mismo nombre o actualiza la referencia en el archivo `js/script.js`.

### Cambiar imágenes
1. Reemplaza las imágenes en la carpeta `img/` con tus propias imágenes.
2. Asegúrate de mantener los mismos nombres de archivo o actualiza las referencias en `index.html`.

### Modificar color neón
1. Abre el archivo `css/style.css`.
2. Busca la sección `:root` al principio del archivo.
3. Modifica los valores de `--primary-color` y `--secondary-color` según tus preferencias.

## Recursos necesarios

Para completar este proyecto, necesitarás crear o conseguir:

1. **Imágenes**: 
   - Imágenes de los emuladores (retroarch.jpg, dolphin.jpg, etc.)
   - Imágenes de los repositorios de ROMs (archive.jpg, vimms.jpg, etc.)
   - Imagen de fondo para la sección hero (hero-bg.jpg)
   - Imagen de previsualización para el README (preview.jpg)

2. **Audio**:
   - Un archivo de música retrowave o similar (retrowave.mp3)

## Adiciones futuras

- [ ] Modo oscuro/claro
- [ ] Sección de tutoriales de configuración
- [ ] Filtros de búsqueda por consola
- [ ] Sección de noticias sobre emulación
- [ ] Sistema de comentarios

## Notas importantes

- Este sitio es puramente informativo y no aloja contenido protegido por derechos de autor.
- El sitio solo proporciona enlaces a sitios oficiales y repositorios legales de preservación.
- Asegúrate de cumplir con las leyes de tu país en relación con la emulación.

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Agradecimientos

- Fuentes: [Google Fonts](https://fonts.google.com/)
- Iconos: [Font Awesome](https://fontawesome.com/)
