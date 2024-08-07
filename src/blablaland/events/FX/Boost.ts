import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { FXEvent, Packet } from "../../../interfaces/blablaland"

class Boost {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: FXEvent): void {
        const type: number = event.packet.bitReadUnsignedInt(3)

        if (type === 0) {
            const channelId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
            const boost: number|undefined = user.inventory.getObject(152)?.quantity

            let packetSender: Packet = {
                type: 1,
                subType: 16
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
            socketMessage.bitWriteUnsignedInt(3, boost ? 0 : 1)
            socketMessage.bitWriteUnsignedInt(32, boost ?? 0)

            user.socketManager.send(socketMessage)
        }
    }
}

export default Boost