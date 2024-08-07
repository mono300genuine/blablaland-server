import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"

class Table {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userID: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const userFound: User|undefined = serverManager.getUserById(userID, {
            inConsole: false
        })
        if (!userFound) return

        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
        socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userID)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, socketMessage],
            identifier: `TABLE`,
            duration: 360
        }
        const map = universeManager.getMapById(user.mapId)
        if (map) {
            map.mapFX.writeChange(user, params)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default Table