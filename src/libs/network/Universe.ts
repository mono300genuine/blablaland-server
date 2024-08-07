import net from 'net'
import UniverseManager from "../manager/UniverseManager"
import SocketManager from "./SocketManager"
import { UniverseDefinition } from '../../interfaces/blablaland'
import ServerManager from '../manager/ServerManager'
import RateLimiter from './RateLimiter'

class Universe {

    private server: net.Server
    public universeManager: UniverseManager
    public serverManager: ServerManager
    private readonly rateLimiter: RateLimiter
    public universe: UniverseDefinition

    constructor(universe: UniverseDefinition, serverManager: ServerManager, rateLimiter: RateLimiter) {
        this.universe = universe
        this.serverManager = serverManager
        this.server = net.createServer(this.listener.bind(this))
        this.universeManager = new UniverseManager(universe.id)
        this.rateLimiter = rateLimiter
    }

    /**
     * Listen to the packets received and forward them to the SocketManager
     * @param  {net.Socket} socket
     * @returns void
     */
     listener(socket: net.Socket): void {
        const socketManager: SocketManager = new SocketManager(socket, this.universeManager, this.serverManager, this.rateLimiter)
        if (!this.rateLimiter.checkRateLimit(socketManager.getIP())) {
            const message: string = `Votre IP est temporairement bloquée pendant 5 minutes. Mesure de sécurité suite à un comportement suspect. Tout va bien !`
            for (let user of this.serverManager.getListUser()) {
                console.log(user.socketManager.IP === socketManager.getIP())
                if (user.socketManager.IP === socketManager.getIP()) {
                    user.socketManager.close(message)
                }
            }
            return socketManager.close(message)
        }
        socket.on('data', (data: Buffer) => socketManager.handleData(data))
        socket.on('error', (error: Buffer) => socketManager.handleError(error))
        socket.on('close', (close: Buffer) => socketManager.handleClose(close))
    }

    /**
     * Launch server
     * @returns void
     */
    launch(): void {
        this.server.listen(this.universe.port)
        console.info('\x1b[33m%s\x1b[0m', `Server ${this.universe.name} initialized`)
    }
}

export default Universe