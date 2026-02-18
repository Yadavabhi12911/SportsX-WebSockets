import { WebSocketServer, WebSocket } from "ws";
import { da } from "zod/locales";

const matchSubscriber = new Map();

function subscribe(matchId, socket) {
    if (!matchSubscriber.has(matchId)) {
        matchSubscriber.set(matchId, new Set())
    }

    matchSubscriber.get(matchId).add(socket)
}

function unSubscribe(matchId, socket) {
    const subscribers = matchSubscriber.get(matchId)

    if (!subscribers) return

    subscribers.delete(socket)

    if (subscribers.size === 0) {
        matchSubscriber.delete(matchId)
    }
}

function cleanUpSubscriptions(socket) {
    for (const matchId of socket.subscription) {
        unSubscribe(matchId, socket)
    }
}

function handleMessage(socket, data) {
    let message

    try {
        message = JSON.parse(data.toString())
    } catch (error) {
        sendJson(socket, { type: 'error', message: "Invalid Json" })
    }

    if (message?.type === "subscribe" && Number.isInteger(message.matchId)) {
        subscribe(message.matchId, socket)
        socket.subscription.add(message.matchId)

        sendJson(socket, { type: "subscribed", matchId: message.matchId })
        return
    }
    if (message?.type === "unSubscribe" && Number.isInteger(message.matchId)) {
        unSubscribe(message.matchId, socket)
        socket.subscription.delete(message.matchId)

        sendJson(socket, { type: "unSubscribed", matchId: message.matchId })
        return
    }


}

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return

    socket.send(JSON.stringify(payload))
}

function broadcastToAll(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue
        client.send(JSON.stringify(payload))
    }
}

function broadcastToMatch(matchId, payload) {
    const subscribers = matchSubscriber.get(matchId)

    if (!subscribers || subscribers.size === 0) return

    const message = JSON.stringify(payload)

    for (const client of subscribers) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
    }
}

export function attackWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    })

    wss.on('connection', (socket) => {
        socket.isAlive = true
        socket.on('pong', () => { socket.isAlive = true })

        socket.subscription = new Set()

        socket.on('message', (data) => {
            handleMessage(socket, data)
        })

        socket.on('error', () => {
            socket.terminate()
        })

        socket.on('close', () => {
            cleanUpSubscriptions(socket)
        })

        sendJson(socket, { type: 'welcome' })

        socket.on('error', console.error)
    })

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate()
            ws.isAlive = false,
                ws.ping()
        })
    }, 30000)

    wss.on('close', () => clearInterval(interval))

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: 'match_created', data: match })
    }

    function broadcastCommentry(matchId, comment){
        broadcastToMatch(matchId, { type: 'commentary', data: comment })
    }


    return { broadcastMatchCreated, broadcastCommentry }



}



