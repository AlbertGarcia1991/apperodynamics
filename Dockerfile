FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src/
COPY imgs /usr/share/nginx/html/imgs/

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]