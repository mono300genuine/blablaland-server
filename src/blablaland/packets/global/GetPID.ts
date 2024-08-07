import { Packet } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import ServerManager from "../../../libs/manager/ServerManager"
import security from "../../../json/security.json"

class GetPID {

    /**
     * Receipt of a PID request by the client
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (user.pid !== 0) return
        const token: number = packet.bitReadSignedInt(16)
        if (token === security.token || process.env.PROD == "false") {
            const packetSender: Packet = {
                type: 1,
                subType: 3
            }
            const countPID: number = serverManager.countPID + 1
            serverManager.countPID = countPID
            user.pid = countPID
            user.username = user.pseudo = 'touriste_' + countPID
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(24, countPID)
            user.socketManager.send(socketMessage)
        }
    }
}

export default GetPID