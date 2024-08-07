import Binary from "./Binary"
import GlobalProperties from "./GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"


class SocketMessage extends Binary {

    public type
    public subType

    constructor(packet?: Packet) {
        super()

        if (packet) {
            this.bitWriteUnsignedInt(GlobalProperties.BIT_TYPE, packet.type)
            this.bitWriteUnsignedInt(GlobalProperties.BIT_STYPE, packet.subType)
            this.type = packet.type
            this.subType = packet.subType
        }
    }

    /**
     * @returns SocketMessage
     */
    duplicate(): SocketMessage {
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.push(...this)
        socketMessage.bitPosition = this.bitPosition
        socketMessage.bitLength = this.bitLength
        return socketMessage
    }

    /**
     * Read the incoming buffer
     * @param  {Buffer} buffer
     * @returns void
     */
    readMessage(buffer: Buffer|Array<number>): void {
        let i = 0
        while (i < buffer.length) {
            if (buffer[i] == 1) {
                i++
                this.push(buffer[i] == 2 ? 1 : 0)
            } else {
                this.push(buffer[i])
            }
            i++
        }
        this.bitLength = this.length * 8;
    }
    
    /**
     * Export the incoming buffer
     * @returns void
     */
    exportMessage(): Buffer {
        let loc1 = new Array()
        for (let i = 0; i < this.length; i++) {
            if (this[i] == 0) {
                loc1.push(1)
                loc1.push(3)
            } else if (this[i] == 1) {
                loc1.push(1)
                loc1.push(2)
            } else {
                loc1.push(this[i])
            }
        }
        return Buffer.from(loc1)
    }
}

export default SocketMessage