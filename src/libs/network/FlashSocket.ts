import net from 'net'
import 'dotenv/config'

class FlashSocket {

    private server: net.Server

    constructor() {
        this.server = net.createServer(this.listener.bind(this)).listen(843)
        console.info('\x1b[33m%s\x1b[0m', `Server FlashSocket initialized`)
    }

    /**
     * Listen to the packets received
     * @param  {net.Socket} socket
     * @returns void
     */
     listener(socket: net.Socket): void {
        socket.on('data', (data: Buffer) => this.handleData(socket, data))
    }

    /**
     * @param  {net.Socket} socket
     * @param  {Buffer} data
     * @returns void
     */
    handleData(socket: net.Socket, data: Buffer): void {
        if (data.toString().includes('<policy-file-request/>\x00')) {
            socket.write(`<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>\x00`)
            return
        }
    }
}

export default FlashSocket