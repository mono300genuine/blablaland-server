import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"

class Fireworks {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const seed: number = item.packet.bitReadUnsignedInt(10)
        const color: number = item.packet.bitReadUnsignedInt(3)
        const positionX: number = item.packet.bitReadSignedInt(16)
        const positionY: number = item.packet.bitReadSignedInt(16)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, item.packet],
            isPersistant: false
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Fireworks