import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Statue {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const dateServer: number = Date.now()
        item.packet.bitWriteString(user.pseudo)
        item.packet.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        item.packet.bitWriteUnsignedInt(10, dateServer % 1000)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, item.packet],
            duration: 3600
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)

        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Statue