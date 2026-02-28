import jsonServer from 'json-server'
import cors from 'cors'

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(cors()) // ✅ Enable CORS
server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 10000

server.listen(PORT, '0.0.0.0', () => {
    console.log(`JSON Server is running on port ${PORT}`)
})