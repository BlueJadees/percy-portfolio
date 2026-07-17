"""Servidor de desarrollo local para el portafolio.

Sirve src/ en http://localhost:5500 espejando el comportamiento del
nginx.conf de producción: headers COOP/COEP en /assets/games/ (requeridos
por los exports HTML5 de Godot 4). Sin cache para ver cambios al instante.

Uso:  python tools/dev-server.py
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 5500
ROOT = Path(__file__).resolve().parent.parent / "src"


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if self.path.startswith("/assets/games/"):
            self.send_header("Cross-Origin-Opener-Policy", "same-origin")
            self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print(f"Dev server -> http://localhost:{PORT}   (raiz: {ROOT})")
    print("Ctrl+C para detener.")
    ThreadingHTTPServer(("127.0.0.1", PORT), DevHandler).serve_forever()
