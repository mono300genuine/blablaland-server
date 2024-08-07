import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Star {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        if (!user.isModerator()) return
        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(32, Math.floor(Date.now() / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, socketMessage],
            duration: 10
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
    }
}

export default Star