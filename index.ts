import { WebSocket } from "ws";
import url from "url";
import { ServerWebSocket } from "bun";

const port = parseInt(Bun.env.PORT || "8080");
const cleanTime = parseInt(Bun.env.CLEAN_TIME || "30000");
const xApiKey = Bun.env.X_API_KEY || "1234567890";

type WebSocketWithAlive = ServerWebSocket<unknown> & { isAlive?: boolean };

const clients = new Set<WebSocketWithAlive>();
Bun.serve({
    fetch(req, server) {
        // GET 請求
        if (req.method === "GET" && req.url) {
            // 解析請求的 URL
            const parsedUrl = url.parse(req.url, true);
            const parms = new URLSearchParams(parsedUrl.search ?? "");

            // 檢查 x-api-key (直接查看 QueryString)
            const xApiKeyFromRequest = parms.get("x-api-key");

            if (xApiKeyFromRequest !== xApiKey) {
                return new Response(null, { status: 401 });
            }

            // /upgrade 時，轉發給 WebSocket
            if (parsedUrl.pathname === "/upgrade") {
                if (server.upgrade(req)) {
                    return;
                }
            }

            // 特定路徑 /broadcast/{當參數}
            if (parsedUrl.pathname?.startsWith("/broadcast/")) {
                // 取得 /broadcast/ 後的參數
                const broadcast = parsedUrl.pathname.replace("/broadcast/", "");
                if (broadcast) {
                    // 轉發給所有連線的 client
                    clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(broadcast);
                        }
                    });
                    // 回應已發送
                    return new Response(JSON.stringify({ success: true, broadcast }));
                } else {
                    return new Response(JSON.stringify({ success: false }));
                }
            }
        } else {
            return new Response(null, { status: 401 });
        }
    },
    websocket: {
        message(_, message) {
            console.log('received: %s', message);
        },
        open(ws: WebSocketWithAlive) {
            clients.add(ws);
            ws.isAlive = true;
            console.log('connected');
        },
        pong(ws: WebSocketWithAlive) {
            console.log("pong");
            ws.isAlive = true
        },
        close(ws: WebSocketWithAlive) {
            console.log('disconnected');
            clients.delete(ws);
        },
    },
    port,
});

// 清除機制
function heartbeat() {
    clients.forEach(function each(ws: WebSocketWithAlive) {
        if (ws.isAlive === false) {
            return ws.terminate();
        };

        ws.isAlive = false;
        ws.ping('')
    });
}
setInterval(heartbeat, cleanTime);

console.log(`Server running at http://localhost:${port}/`);


/* 前端使用

const socket = new WebSocket("ws://localhost:8080/upgrade?x-api-key=1234567890");

socket.addEventListener("message", event => {
  console.log(event.data);
})

*/