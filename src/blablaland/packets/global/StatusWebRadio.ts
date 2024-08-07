import { Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"

class StatusWebRadio {
    
    /**
     * @param user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const status: number = packet.bitReadUnsignedInt(8)
        if (status == 1) {
            let packetSender: Packet = {
                type: 1,
                subType: 17
            }
            let socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(8, status)
            socketMessage.bitWriteBoolean(false)
            user.socketManager.send(socketMessage)
        }
    }
}

export default StatusWebRadio