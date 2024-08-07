import User from "../../../libs/blablaland/User"
import { Packet, SkinEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Cart {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        if (event.type === 0) { // Boost
            const winPID: number = event.packet.bitReadUnsignedInt(16)
            const boost: number|undefined = user.inventory.getObject(152)?.quantity

            const packetSender: Packet = {
                type: 1,
                subType: 13
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(16, winPID)
            socketMessage.bitWriteUnsignedInt(3, boost ? 0 : 1)
            socketMessage.bitWriteUnsignedInt(16, boost ?? 0)
            user.socketManager.send(socketMessage)
        }
    }
}

export default Cart