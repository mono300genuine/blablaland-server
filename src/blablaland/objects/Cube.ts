import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Cube {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const positionX: number = item.packet.bitReadSignedInt(17)
        const positionY: number = item.packet.bitReadSignedInt(17)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, 1, item.packet],
            isPersistant: true,
            duration: 10
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Cube