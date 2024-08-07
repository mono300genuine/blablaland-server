import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"

class UserSearch {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.isModerator()) return
        const PID: number = packet.bitReadUnsignedInt(16)
        const pseudo: string = packet.bitReadString()

        let packetSender: Packet = {
            type: 6,
            subType: 1
        }

        const listUsers: User[] = serverManager.getListUser().filter(item => item.pseudo.toLowerCase().startsWith(pseudo.toLowerCase()) && !item.inConsole)

        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(16, PID)
        for (let item of listUsers) {
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteString(item.pseudo)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, item.pid)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, item.id)
            socketMessage.bitWriteUnsignedInt(32, item.IP)
        }
        socketMessage.bitWriteBoolean(false)
        user.socketManager.send(socketMessage)
    }
}

export default UserSearch