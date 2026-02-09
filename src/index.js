import express from 'express'
import http from 'http'
import { configDotenv } from 'dotenv'
configDotenv()

const app = express()
const server = http.createServer(app)

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello from Sever')
})


import matchesRoutes from './routes/matches.routes.js'

app.use('/api/matches', matchesRoutes)


// web socket
import { attackWebSocketServer } from './ws/server.js'

const { broadcastMatchCreated } = attackWebSocketServer(server)
app.locals.broadcastMatchCreated = broadcastMatchCreated

server.listen(process.env.PORT, process.env.HOST || 9000, (err) => {
    if (err) return
    console.log(`server is running at ${process.env.PORT}`);
    console.log(`WebSocket is running...`);

})
