import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../libs/manager/UniverseManager"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import { ObjectDatabase } from "../../interfaces/database"

class PotionThrower {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const positionX: number = item.packet.bitReadSignedInt(17)
        const positionY: number = item.packet.bitReadSignedInt(17)
        const mouseX: number = item.packet.bitReadSignedInt(17)
        const mouseY: number = item.packet.bitReadSignedInt(17)
        const potionId: number = item.packet.bitReadUnsignedInt(32)

        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        socketMessage.bitWriteSignedInt(17, positionX)
        socketMessage.bitWriteSignedInt(17, positionY)
        socketMessage.bitWriteSignedInt(17, mouseX)
        socketMessage.bitWriteSignedInt(17, mouseY)
        socketMessage.bitWriteUnsignedInt(32, potionId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)

        const map = universeManager.getMapById(user.mapId)
        if (map.isProtected()) {
            return user.interface.addInfoMessage(`Cette map est protégée contre les projectiles ^^`)
        }

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, socketMessage, potionId],
            identifier: `POTION_THROWER`,
            duration: 7
        }
        map.mapFX.writeChange(user, params)
        const userObject: ObjectDatabase|undefined = user.inventory.getObject(potionId)
        if (userObject) {
            userObject.quantity--
            user.inventory.reloadObject(userObject)
        }
    }
}

export default PotionThrower