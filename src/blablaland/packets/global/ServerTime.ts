import { Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"

class ServerTime {
    
    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const packetSender: Packet = {
            type: 1,
            subType: 1
        }
        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        user.socketManager.send(socketMessage)
    }
}

export default ServerTime