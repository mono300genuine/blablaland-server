import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import universeManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { Packet } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class Smile {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: universeManager, serverManager: ServerManager): void {
        const userID: number = packet.bitReadUnsignedInt(24)
        const smileyId: number = packet.bitReadUnsignedInt(5)
        const sendBBL: boolean = packet.bitReadBoolean()

        const userFound: User|undefined = serverManager.getUserById(userID, {
            inConsole: false
        })
        if (!userFound) return

        userFound.addListPackSmiley(smileyId)
        const packetSender: Packet = {
            type: 2,
            subType: 14
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteBoolean(true)
        socketMessage.bitWriteUnsignedInt(8, 0)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SMILEY_PACK_ID, smileyId)
        socketMessage.bitWriteBoolean(false)
        userFound.socketManager.send(socketMessage)
        if (sendBBL) {
            userFound.socketManager.send(new SocketMessage({ type: 2, subType: 13 }))
        }
    }
}

export default Smile