import User from "../../libs/blablaland/User"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"

class Bomb {

    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager) {
        const positionX: number = item.packet.bitReadSignedInt(16)
        const positionY: number = item.packet.bitReadSignedInt(16)
        const surfaceBody: number = item.packet.bitReadUnsignedInt(8)
        const name: string = item.packet.bitReadString()

        const map = universeManager.getMapById(user.mapId)
        if (map.isProtected()) {
            return user.interface.addInfoMessage(`Cette map est protégée contre les bombes ^^`)
        }
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteSignedInt(16, positionX)
        socketMessage.bitWriteSignedInt(16, positionY)
        socketMessage.bitWriteUnsignedInt(8, surfaceBody)
        socketMessage.bitWriteString(name)

        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)

        const duration: number =  Math.floor(Math.random() * 20) + 1
        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, socketMessage],
            duration: duration,
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)

        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Bomb