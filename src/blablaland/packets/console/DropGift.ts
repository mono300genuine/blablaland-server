import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class DropGift {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.hasRight('ADVACCESS')) return
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const value: number = packet.bitReadUnsignedInt(16)
        const dateServer: number = Date.now()

        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        socketMessage.bitWriteUnsignedInt(8, 1)

        serverManager.getUniverseById(serverId)?.universeManager?.getMapById(mapId).mapFX.writeChange(user, {
            id: 5,
            identifier: `GIFT`,
            data: [7, 1, socketMessage],
            memory: [1, value],
            duration: 180
        })
    }
}

export default DropGift