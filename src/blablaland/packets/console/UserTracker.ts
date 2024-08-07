import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"

class UserTracker {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.isModerator()) return
        const PID: number = packet.bitReadUnsignedInt(16)
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)

        const userFound: User|undefined = serverManager.getUserByPid(userPID)
        if (userFound) {
            let packetSender: Packet = {
                type: 6,
                subType: 8
            }

            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(16, PID)
            socketMessage.bitWriteString(userFound.username)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, userFound.pid)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userFound.id)
            socketMessage.bitWriteUnsignedInt(32, userFound.IP) // AddIP
            user.socketManager.send(socketMessage)
        }
    }
}

export default UserTracker