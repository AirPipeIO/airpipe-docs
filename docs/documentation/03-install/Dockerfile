FROM alpine:latest

ENV AIRPIPE_API_KEY="YOUR_API_KEY"

WORKDIR /app

# Pulls the latest Air Pipe version at build time from download.airpipe.io.
# Pin LATEST_VERSION to a specific version (e.g. 1.0.0) if you prefer reproducible builds.
RUN apk add --no-cache curl nano && \
    LATEST_VERSION=$(curl -fsSL https://download.airpipe.io/latest.version) && \
    ARCH=$(uname -m) && \
    echo "Installing Air Pipe ${LATEST_VERSION} for ${ARCH}" && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl -o /app/agent "https://download.airpipe.io/${LATEST_VERSION}/linux/x86_64/airpipe"; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        curl -o /app/agent "https://download.airpipe.io/${LATEST_VERSION}/linux/aarch64/airpipe"; \
    else \
        echo "Unsupported architecture: ${ARCH}" && exit 1; \
    fi && \
    chmod +x /app/agent

# UPDATE to your config directory
COPY configs /app/configs

# 4111 is the default http port used
EXPOSE 4111

CMD ["/app/agent", "server", "--config-dir", "configs/"]

# example build & run command
# docker build -t my-airpipe-image .
# docker run -d -p 4111:4111 my-airpipe-image
