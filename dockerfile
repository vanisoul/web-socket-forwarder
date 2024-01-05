# docker build .  設定 VERSION 範例
# docker build . --build-arg VERSION=0.0.1 -t web-socket-forwarder:0.0.1

# docker run 範例
# docker run --rm \
#   -d -p 8080:8080 \
#   -e NODE_ENV="production" \
#   -e PORT="8080" \
#   -e CLEAN_TIME='180000' \
#   -e X_API_KEY="123456789" \
#   -e TZ="Asia/Taipei" \
#   --name web-socket-forwarder web-socket-forwarder:0.0.1

# 使用 ARG 將 Project VERSION 設置為預設值
ARG VERSION=0.0.0

FROM oven/bun:1 as base

# 將 ARG 的版本抓進 image 中
ARG VERSION
ENV VERSION=${VERSION}

WORKDIR /usr/src/app

# 安裝 套件
FROM base AS install
WORKDIR /temp/prod

COPY package.json bun.lockb .
RUN bun install --frozen-lockfile --production

# Test
FROM base AS release
ENV NODE_ENV=production

COPY --from=install /temp/prod/node_modules node_modules
COPY . .

RUN bun test

# run the app
USER bun
ENTRYPOINT [ "bun", "run", "./index.ts" ]