import express from 'express'
import { configDotenv } from 'dotenv'
configDotenv()

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello from Sever')
})


import matchesRoutes from './routes/matches.routes.js'

app.use('/api/matches', matchesRoutes)


app.listen(process.env.PORT || 9000, (err) => {
if(err) return
console.log(`server is running at ${process.env.PORT}`);

})
