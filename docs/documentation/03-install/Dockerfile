FROM alpine:latest

# Pin a specific version (docker build --build-arg AIRPIPE_VERSION=1.0.0 .)
# or leave empty to pull the latest at build time from download.airpipe.io.
ARG AIRPIPE_VERSION=""

ENV AIRPIPE_API_KEY="YOUR_API_KEY"

WORKDIR /app

RUN apk add --no-cache curl nano && \
    VERSION="${AIRPIPE_VERSION:-$(curl -fsSL https://download.airpipe.io/latest.version)}" && \
    ARCH=$(uname -m) && \
    echo "Installing Air Pipe ${VERSION} for ${ARCH}" && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl -o /app/agent "https://download.airpipe.io/${VERSION}/linux/x86_64/airpipe"; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        curl -o /app/agent "https://download.airpipe.io/${VERSION}/linux/aarch64/airpipe"; \
    else \
        echo "Unsupported architecture: ${ARCH}" && exit 1; \
    fi && \
    chmod +x /app/agent

# UPDATE to your config directory
COPY configs /app/configs

LABEL org.opencontainers.image.title="airpipe" \
      org.opencontainers.image.version="${AIRPIPE_VERSION:-latest}" \
      org.opencontainers.image.source="https://download.airpipe.io"

# 4111 is the default http port used
EXPOSE 4111

CMD ["/app/agent", "server", "--config-dir", "configs/"]

# example build & run commands
# docker build -t my-airpipe-image .                                  # latest
# docker build --build-arg AIRPIPE_VERSION=1.0.0 -t my-airpipe-image . # pinned
# docker run -d -p 4111:4111 my-airpipe-image
