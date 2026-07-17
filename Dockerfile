# Imagen del portafolio: copia el sitio y la config de nginx DENTRO de la imagen.
# Evitamos bind mounts relativos (./src, ./nginx) porque Portainer, al desplegar
# desde un repositorio, no siempre resuelve esos paths y termina montando carpetas
# vacías sobre /usr/share/nginx/html y /etc/nginx/conf.d (síntoma clásico: nginx
# arranca pero "default.conf does not exist" y responde 502 tras el tunnel).

FROM nginx:alpine

# Config del servidor (reemplaza el default.conf de fábrica)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Sitio estático
COPY src/ /usr/share/nginx/html/

EXPOSE 80
