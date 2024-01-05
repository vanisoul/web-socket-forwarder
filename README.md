# web-socket-forwarder

這個專案是一個使用 Bun 建立的 WebSocket 微服務，提供了兩個主要功能。

## 功能

1. **WebSocket 連線**：客戶端可以透過 `/upgrade` 路由建立 WebSocket 連線。
2. **廣播消息**：透過 `/broadcast/{msg}` 路由可以將消息廣播給所有已連線的 WebSocket 用戶。

## 環境變數

此專案使用以下環境變數：

- `PORT`：服務監聽的端口（預設為 8080）。
- `CLEAN_TIME`：非活耀 WebSocket 連線的清除時間（毫秒），預設為 30000 毫秒。
- `X_API_KEY`：用於授權的 API 密鑰，預設為 "1234567890"。必須在查詢字串中提供 `x-api-key` 並符合此值才能通過授權。

## 安裝與運行

1. 確保已安裝 Bun。
2. 在專案根目錄下運行 `bun install` 安裝依賴。
3. 運行 `bun run start` 啟動服務。

## 使用範例

### 建立 WebSocket 連線

使用 WebSocket 客戶端連接到 `ws://<your_server_address>/upgrade`。

### 發送廣播消息

發送一個 HTTP 請求到 `http://<your_server_address>/broadcast/{msg}`，其中 `{msg}` 是你想廣播的消息。