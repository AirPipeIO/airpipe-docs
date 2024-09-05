FROM alpine:latest

ENV AIRPIPE_API_KEY="YOUR_API_KEY"

WORKDIR /app

# check https://download.airpipe.io/ for which version you require
RUN apk add --no-cache curl && \
    curl -o /app/agent https://download.airpipe.io/0.2.0/linux/x86_64/airpipe && \
    chmod +x /app/agent

    # UPDATE to your config directory
COPY configs /app/configs

# 4111 is the default http port used
EXPOSE 4111

CMD ["/app/agent", "server", "--config-dir", "configs/"]

# example build & run command
# docker build -t my-airpipe-image .
# docker run -d -p 4111:4111 my-airpipe-image