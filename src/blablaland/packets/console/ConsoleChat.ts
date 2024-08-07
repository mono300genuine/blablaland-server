import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"

class ConsoleChat {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.isModerator()) return
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const unknown: boolean = packet.bitReadBoolean()
        const grade: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_GRADE)
        const text: string = packet.bitReadString()

        const packetSender: Packet = {
            type: 6,
            subType: 5
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
        socketMessage.bitWriteBoolean(userPID !== 0)
        socketMessage.bitWriteBoolean(true)
        socketMessage.bitWriteString(text)
        for (let item of serverManager.getListUserConsole()) {
            if (item.grade >= grade && item.grade >= user.secretChat) {
                if (userPID !== 0) {
                    if (item.pid == userPID) {
                        item.socketManager.send(socketMessage)
                    }
                } else {
                    item.socketManager.send(socketMessage)
                }
            }
        }
    }
}

export default ConsoleChat