import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { Packet } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class SecretManager {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    async execute(user: User, packet: SocketMessage): Promise<void> {
        if (!user.hasRight('SECRETALLOW')) return
        const userPID: number = packet.bitReadUnsignedInt(16)

        let packetSender: Packet = {
            type: 6,
            subType: 12
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(16, userPID)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, user.secretChat) // secretChat
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, user.secretTracker) // secretTracker
        user.socketManager.send(socketMessage)
    }
}

export default SecretManager