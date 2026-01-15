FROM ghcr.io/isso-comments/isso:latest

COPY isso.conf /config/isso.conf

ENV ISSO_SETTINGS=/config/isso.conf

EXPOSE 8080

VOLUME ["/db"]
