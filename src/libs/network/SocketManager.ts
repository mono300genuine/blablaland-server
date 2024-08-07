import PacketParser from "../../blablaland/PacketParser"
import UniverseManager from "../manager/UniverseManager"
import SocketMessage from "../blablaland/network/SocketMessage"
import ServerManager from "../manager/ServerManager"
import RateLimiter from "./RateLimiter"
import User from "../blablaland/User"
import { Socket } from "net"
import IP from "ip"
import 'dotenv/config'

class SocketManager {

    private socket: Socket

    private universeManager: UniverseManager
    private readonly serverManager: ServerManager
    private rateLimiter: RateLimiter

    private buffer: Array<number>
    private inputCounter: number
    private outputCounter: number

    readonly IP: string
    private readonly user: User


    constructor(socket: Socket, universeManager: UniverseManager, serverManager: ServerManager, rateLimiter: RateLimiter) {
        this.socket = socket
        this.universeManager = universeManager
        this.serverManager = serverManager
        this.rateLimiter = rateLimiter
        this.user = new User(this, serverManager)
        this.IP = socket.remoteAddress ? socket.remoteAddress.replace(/^.*:/, '') : ''
        this.user.IP = IP.toLong(this.IP)
        this.buffer = new Array<number>()
        this.inputCounter = 12
        this.outputCounter = 12
    }
    
    /**
     * Processes the data received as a packet
     * @param  {Buffer} data
     * @returns void
     */
    handleData(data: Buffer): void {
        if (this.rateLimiter.isIPBanned(this.getIP())) this.close()
        if (data.toString().includes('<policy-file-request/>\x00')) {
            this.socket.write(`<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>\x00`)
            return
        }
        if (this.socket.localAddress === this.socket.remoteAddress &&
            this.user.isTouriste) {
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.readMessage(data)
            new PacketParser(this.user, socketMessage, this.universeManager,
                this.serverManager)
        }

        for (let i = 0; i < data.length; i++) {
            const byteBuffer: number = data[i]
            if (byteBuffer == 0) {
                this.inputCounter = this.inputCounter + 1
                if (this.inputCounter >= 65530) {
                    this.inputCounter = 12
                }
                
                const packet: SocketMessage = new SocketMessage()
                packet.readMessage(this.buffer)

                const outputCounter: number = packet.bitReadUnsignedInt(16)

                if (!(outputCounter < this.inputCounter ||
                    outputCounter > this.inputCounter + 20)) {
                    if (!this.rateLimiter.checkRateLimit(this.getIP(), this.user.pid)) {
                        for (let user of this.serverManager.getListUser()) {
                            if (user.socketManager.IP === this.getIP()) {
                                const message: string = `Votre IP est temporairement bloquée pendant 5 minutes. Mesure de sécurité suite à un comportement suspect. Tout va bien !`
                                user.socketManager.close(message)
                            }
                        }
                        return
                    } else {
                        new PacketParser(this.user, packet, this.universeManager, this.serverManager)
                    }
                    this.buffer = new Array<number>()
                }
            } else {
                this.buffer.push(byteBuffer)
            }
        }
    }

    /**
     * @param  {Buffer} error
     * @returns void
     */
    async handleError(error: Buffer): Promise<void> {
        await this.user.disconnect()
        this.socket.destroy()
    }
    
    /**
     * @param  {Buffer} close
     * @returns void
     */
    async handleClose(close: Buffer): Promise<void> {
        await this.user.disconnect()
        this.socket.destroy()
    }

    /**
     * Sending the socket to the client
     * @param  {SocketMessage} socketMessage
     * @returns void
     */
    send(socketMessage: SocketMessage): void {
        this.outputCounter = this.outputCounter + 1
        if (this.outputCounter >= 65530) {
            this.outputCounter = 12
        }
        let packet = new SocketMessage()
        packet.bitWriteUnsignedInt(16, this.outputCounter)
        packet.bitWriteBinary(socketMessage)

        let data = packet.exportMessage()
        if (data) {
            this.socket.write(data)
            this.socket.write('\x00')
        }
    }

    /**
     * Sends the packet to all players
     * @param socketMessage
     * @param except
     * @param mapId
     */
    sendAll(socketMessage: SocketMessage, except?: User, mapId?: number): void {
        const listCamera = this.serverManager.getListCamera()
                            .filter((c) =>  c.serverId == this.universeManager.getServerId() && c.currMap === (mapId ?? this.user.mapId))
        const processedUserPids: Map<number, boolean> = new Map<number, boolean>()
        for (let camera of listCamera) {
            const pid: number = camera.user.pid
            if (except !== undefined && except.pid === pid) {
                continue
            }
            if (!processedUserPids.has(pid)) {
                camera.user.socketManager.send(socketMessage)
                processedUserPids.set(pid, true)
            }
        }
    }

    setUniverseManager(universeManager: UniverseManager): void {
        this.universeManager = universeManager
    }

    /**
     * Get universe socket
     */
    getUniverseManager(): UniverseManager {
        return this.universeManager
    }

    getIP(): string {
        return this.IP
    }

    /**
     * Closes the player's connection
     * @param error
     */
    close(error?: string): void {
        this.user.disconnect().then((): void => {
            if (!error) {
                error = `La connexion au jeu vient d'être interrompue !`
            }
            let packetSender = { type: 1,  subType: 2 }
            let socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteString(error)
            this.send(socketMessage)
        })
    }
}

export default SocketManager