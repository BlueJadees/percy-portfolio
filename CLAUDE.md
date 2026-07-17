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
├── docker-compose.yml      ← stack de Portainer
├── nginx/
│   └── default.conf        ← configuración del servidor estático (se monta la carpeta completa)
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
3. Entrar a Portainer → stack `percy-portfolio` → Pull + Redeploy
4. Verificar en `https://portfolio.tecg8n.xyz`

No hay build step — el sitio es HTML/CSS estático servido directamente por Nginx.

---

## docker-compose.yml (referencia)

```yaml
services:
  portfolio:
    image: nginx:alpine
    container_name: percy-portfolio
    restart: unless-stopped
    volumes:
      - ./src:/usr/share/nginx/html:ro
      - ./nginx:/etc/nginx/conf.d:ro
    ports:
      - "${HOST_PORT:-8081}:80"
```

> El puerto del host es configurable con la variable `HOST_PORT` — **default 8081**, porque el
> 8080 ya está ocupado por otro servicio del HomeLab. Cloudflare Tunnel debe apuntar al
> puerto elegido (`localhost:8081`).

> **Importante:** la config de nginx se monta como **carpeta** (`./nginx` → `/etc/nginx/conf.d`),
> nunca como archivo individual — los bind mounts de archivos sueltos fallan en los deploys
> por Repository de Portainer ("not a directory / trying to mount a directory onto a file").

> El puerto 8080 es el interno del HomeLab. Cloudflare Tunnel apunta desde
> `portfolio.tecg8n.xyz` a `localhost:8080` del servidor.

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

### Backend & Arquitectura
| Proyecto | Descripción corta |
|---|---|
| **Kuppel Management** | ERP interno Django/SQL Server integrado con Softland Cloud via SOAP. Proyecto principal. |
| **Automatización Logística** | Selenium scraping de plataformas de transporte (El Arriero, TVP) |
| **DB Explorer Tool** | Herramienta de análisis de BD sin SSMS, pensada para el ecosistema Softland |
| **Automatización Brevo** | Mailing masivo y generación de comprobantes via API |
| **Infraestructura HomeLab** | Ubuntu + Docker + Portainer + Cloudflare Tunnels |

### Videojuegos Indie
| Juego | Motor | Estado |
|---|---|---|
| **Virals** | Godot 4 | Publicado en itch.io — mejor proyecto de la Game Jam (Diplomado UNSJ Argentina) |
| **Hunt the Space Dragon** | Godot 4 | En desarrollo — port desde GDevelop 5, se embebera en el portafolio como HTML5 |

### Proyectos Especiales
| Proyecto | Descripción corta |
|---|---|
| **Satelite** | Asistente IA con interfaz de anime — Gemini API + IMAP + exportación Excel |
| **Coliseo Smash** | Producción AV de torneos de fighting games — streaming, cámaras, comentarismo |

---

## Convenciones de código

- HTML/CSS puro — **sin frameworks** (no React, no Tailwind, no Bootstrap)
- CSS con variables (`--var`) para toda la paleta de colores
- Sin transpiladores ni bundlers — lo que está en `src/` se sirve tal cual
- Nombres de archivos en minúsculas con guiones: `hunt-the-space-dragon/`
- Commits en español o inglés, consistente dentro de cada sesión

### Paleta de colores (CSS variables definidas en index.html)
```css
--bg: #0E0F11;          /* fondo principal */
--bg-2: #141618;        /* cards */
--bg-3: #1A1C20;        /* hover / secondary */
--text: #EAE8E3;        /* texto principal */
--muted: #6B7280;       /* texto secundario */
--red: #C84B31;         /* acento backend */
--amber: #E8A838;       /* acento gamedev */
--violet: #7C6AF7;      /* acento proyectos especiales */
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
