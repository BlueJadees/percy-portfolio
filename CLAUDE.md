# CLAUDE.md — percy-portfolio

Instrucciones de contexto para Claude (extensión VS Code).
Leer este archivo antes de tocar cualquier archivo del proyecto.

---

## Qué es este proyecto

Portafolio web personal de **Percy Antonio Muñoz Barrera** — Backend Senior Developer e Indie Game Dev basado en Santiago, Chile.

El sitio cumple dos objetivos simultáneos:
- Posicionarse como **Desarrollador Backend Senior** ante empresas tecnológicas
- Establecerse como **creador independiente de videojuegos** ante la comunidad indie

El portafolio es un sitio estático HTML/CSS puro, sin frameworks de frontend.

---

## Stack y arquitectura de deployment

```
VS Code (desarrollo local)
    │
    └── push → GitHub (BlueJadees/percy-portfolio)
                    │
                    └── pull manual → Portainer (HomeLab)
                                          │
                                          └── Docker stack (docker-compose.yml)
                                                    │
                                                    └── Nginx (sirve archivos estáticos)
                                                              │
                                                              └── portfolio.tecg8n.xyz
                                                                    (Cloudflare Tunnel)
```

**Repositorio:** `github.com/BlueJadees/percy-portfolio`
**URL de producción:** `https://portfolio.tecg8n.xyz`
**Servidor:** HomeLab personal — Ubuntu Linux, Docker + Portainer
**Proxy:** Cloudflare Tunnels (ya configurado en el homelab)
**Redeploy:** manual — pull desde Portainer UI + restart del stack

---

## Estructura de archivos del proyecto

```
percy-portfolio/
├── CLAUDE.md               ← este archivo
├── Dockerfile              ← construye la imagen (copia src/ y nginx/ DENTRO)
├── docker-compose.yml      ← stack de Portainer (build: . )
├── nginx/
│   └── default.conf        ← configuración del servidor estático (copiada en la imagen)
├── tools/
│   └── dev-server.py       ← servidor de desarrollo local (localhost:5500)
└── src/
    ├── index.html          ← portafolio principal
    ├── assets/
    │   ├── css/            ← estilos (si se separan del HTML)
    │   ├── img/            ← imágenes, capturas de proyectos
    │   └── games/          ← builds HTML5 de juegos (ej. hunt-the-space-dragon/)
    └── favicon.ico
```

---

## Ciclo de trabajo

1. Editar archivos en `src/` desde VS Code
2. Hacer `git add . && git commit -m "descripción"` y `git push`
3. Entrar a Portainer → stack `percy-portfolio` → **Pull and redeploy** (marca "Re-pull image and redeploy" / rebuild) para que reconstruya la imagen con el contenido nuevo
4. Verificar en `https://portfolio.tecg8n.xyz`

El sitio es HTML/CSS estático, pero se **hornea dentro de una imagen** (Dockerfile) en lugar
de montarse por volumen. Motivo: Portainer, al desplegar desde un repositorio, no resuelve de
forma fiable los bind mounts relativos (`./src`, `./nginx`) y termina montando carpetas vacías
sobre las rutas de nginx → nginx arranca sin config, sirve la página de fábrica y responde 502
detrás del tunnel. Copiar los archivos en la imagen elimina esa dependencia por completo.

---

## docker-compose.yml (referencia)

```yaml
services:
  portfolio:
    build: .
    image: percy-portfolio:latest
    container_name: percy-portfolio
    restart: unless-stopped
    ports:
      - "${HOST_PORT:-8081}:80"
```

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY src/ /usr/share/nginx/html/
EXPOSE 80
```

> El puerto del host es configurable con la variable `HOST_PORT` — **default 8081**, porque el
> 8080 ya está ocupado por otro servicio del HomeLab. Cloudflare Tunnel debe apuntar al
> puerto elegido (`localhost:8081`).

> **Historial de este deploy (para no repetir errores):**
> 1. Montar `nginx.conf` como archivo suelto → *"not a directory"*. Se pasó a montar la carpeta.
> 2. Puerto 8080 ocupado por otro servicio → se parametrizó y quedó en 8081.
> 3. Montar `./src` y `./nginx` como volúmenes relativos → Portainer los resolvía como carpetas
>    vacías; nginx arrancaba sin config y devolvía 502. **Solución final: Dockerfile que copia
>    todo dentro de la imagen, sin volúmenes.**

> El puerto 8081 es el interno del HomeLab. Cloudflare Tunnel apunta desde
> `portfolio.tecg8n.xyz` a `localhost:8081` del servidor.

---

## nginx/default.conf (referencia)

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Rutas normales
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Juegos HTML5 embebidos (Godot export)
    location /assets/games/ {
        add_header Cross-Origin-Opener-Policy same-origin;
        add_header Cross-Origin-Embedder-Policy require-corp;
        try_files $uri $uri/ =404;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|wasm|pck)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

> Los headers `COOP` y `COEP` en `/assets/games/` son **obligatorios** para que
> los exports HTML5 de Godot 4 funcionen correctamente (requieren SharedArrayBuffer).

---

## Proyectos que se muestran en el portafolio

> **Frameworks (importante):** el framework principal de Percy es **Flask**, usado en la mayoría de
> sus proyectos web (incluidos los personales del HomeLab como Satelite, Nexo). **Django** se usó
> específicamente en **Kuppel Management**. No asumir Django por defecto. Los proyectos de
> scraping/automatización (Logística, Cobranza) no usan framework web — son scripts con Selenium/Pandas.

### Backend & Arquitectura
| Proyecto | Descripción corta |
|---|---|
| **Kuppel Management** | ERP interno Django/SQL Server integrado con Softland Cloud via SOAP. Proyecto principal. |
| **Automatización Logística** | Selenium scraping de 4 transportistas (El Arriero, TVP, Movituto, Chile Post); consolida Cartas de Porte y estados de entrega en un Excel unificado |
| **DB Explorer Tool** | Utilidad interna personal (Python) para explorar la BD espejo SQL Server: búsqueda de valores por toda la BD, mapa de tablas/columnas, cruce de 2 campos. **No es card propia** — se menciona como tooling de apoyo dentro de la página de Kuppel. |
| **Automatización de Cobranza** (Agecob) | Modernización de datos y campañas para cobranza extrajudicial: esquema SQL Server (reemplaza Excel masivo), campañas de correo automatizadas con Selenium/Pandas (correos vía Brevo), scraping del CRM NeoHotel → SharePoint → dashboard Power BI. Carteras de Falabella/Paris. |
| **Infraestructura HomeLab** | Notebook reciclado → servidor propio: Linux + Docker + Portainer + Cloudflare Tunnels (dominio tecg8n.xyz). Aloja en producción: este portafolio, Satelite, Nexo, Panel IA (ComfyUI, se menciona sin NSFW en el sitio) y Master (Portainer). |

### Videojuegos Indie
| Juego | Motor | Estado |
|---|---|---|
| **Earth-Builder** | Godot 4 (3D) + Blockbench | Proyecto personal más ambicioso. Híbrido RTS (StarCraft) + FP de automatización (Satisfactory): recursos + maquinaria para sostener conflicto entre razas en un planeta. Fase de diseño conceptual, prototipado y GDD. Sin roadmap cerrado; hay imágenes del prototipo (pendientes de subir). |
| **Virals** | **Godot 3** | Party game caótico tipo WarioWare hecho en 48h de Game Jam (temática caótica). **2º lugar**, premiado con diplomado universitario. Colab con Gabriel Ladseatter (animador/diseñador). Publicado: https://jadees.itch.io/virals |
| **Hunt the Space Dragon** | **GDevelop 5** (actual) → Godot 4 (port planeado) | Plataformero retrofuturista tributo NES/Famicom hecho en el ramo Taller de Videojuegos (nota 6.9/7). 2 niveles, mecánicas simples. Pixel art propio (Aseprite), solo audio open-source. Roadmap: port a Godot 4, más niveles/jefes, hub de época, paleta limitada. Jugable pero no publicado. |

### Proyectos Especiales
| Proyecto | Descripción corta |
|---|---|
| **Satelite** | Asistente IA con interfaz de anime — Gemini API + IMAP + exportación Excel |
| **Coliseo Smash** | Comunidad de Super Smash Bros (2018–2024, Percy se separó en 2024 pero sigue viva). Producción AV: streaming (Twitch/YouTube), cámaras/audio/video, control de layout, moderación, comentarismo, oficialización en start.gg. Hitos: eventos de anime (Game Expo, Ñoño Party, Game & Dance), Espacio Geek (Mall Plaza Alameda, Estación Central), y la final transmitida más grande de Chile 2023. Canales: youtube.com/@coliseosmash4205 · twitch.tv/coliseosmashcos |

---

## Convenciones de código

- HTML/CSS puro — **sin frameworks** (no React, no Tailwind, no Bootstrap)
- CSS con variables (`--var`) para toda la paleta de colores
- Sin transpiladores ni bundlers — lo que está en `src/` se sirve tal cual
- Nombres de archivos en minúsculas con guiones: `hunt-the-space-dragon/`
- Commits en español o inglés, consistente dentro de cada sesión

### Paleta de colores (CSS variables definidas en index.html)
Paleta azul petróleo / turquesa (tema "tech nocturno frío").
```css
--bg: #08171A;          /* fondo principal (teal muy oscuro) */
--bg-2: #0E2226;        /* cards */
--bg-3: #163035;        /* hover / secondary */
--text: #E8F0F1;        /* texto principal (blanco con tinte frío) */
--muted: #7C97A0;       /* texto secundario (gris azulado) */
--blue: #38BDF8;        /* acento backend (azul cielo) */
--teal: #2DD4BF;        /* acento gamedev (turquesa) */
--coral: #FB7185;       /* acento proyectos especiales (contraste) */
```

### Tipografías (Google Fonts, ya importadas)
- `Playfair Display` — títulos y display
- `JetBrains Mono` — código, labels, badges
- `Mulish` — cuerpo de texto

---

## Tareas pendientes conocidas

- [ ] Reemplazar links `#` de itch.io y GitHub en las cards de juegos con URLs reales
- [ ] Añadir screenshots/capturas reales de Kuppel Management (ofuscando datos sensibles)
- [ ] Añadir screenshot o GIF de Virals
- [ ] Integrar build HTML5 de Hunt the Space Dragon en `src/assets/games/hunt-the-space-dragon/`
- [ ] Favicon personalizado
- [ ] Meta tags OG para compartir en redes (og:title, og:image, og:description)

---

## Contacto del propietario
- **Email:** percy.munoz08@gmail.com
- **GitHub:** github.com/BlueJadees
- **LinkedIn:** linkedin.com/in/percymumoz08/
- **Teléfono:** +56 9 4928 1669
