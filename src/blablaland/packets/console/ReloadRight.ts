import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { Packet, Right } from "../../../interfaces/blablaland"

class ReloadRight {

    /**
     * Reload Right
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.hasRight('DROITSCHANGE')) return
        await serverManager.updateListRight()
        const rights: Right[] = serverManager.getListRight()

        const packetSender: Packet = {
            type: 6,
            subType: 7
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        for (let right of rights)
            socketMessage.bitWriteUnsignedInt(16, right.gradeId)

        for (let item of serverManager.getListUserConsole()) {
            item.socketManager.send(socketMessage)
        }
    }
}

export default ReloadRight