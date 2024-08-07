import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"

class SkinAction {
    
    /**
     * @param user
     * @param packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const packId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SMILEY_PACK_ID)
        const smileyId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SMILEY_ID)
        const data = packet.bitReadBinaryData()
        const playCallBack: boolean = packet.bitReadBoolean()
        user.interface.onFlood()

        const packetSender: Packet = {
            type: 5,
            subType: 8
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, user.mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, user.serverId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SMILEY_PACK_ID, packId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SMILEY_ID, smileyId)
        socketMessage.bitWriteBinaryData(data)
        user.socketManager.sendAll(socketMessage, user)
        if (playCallBack) {
            user.socketManager.send(socketMessage)
        }
        user.clearIntervalDodo(true)
    }
}

export default SkinAction