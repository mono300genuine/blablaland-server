import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"

class Confetti {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
            id: 5,
            identifier: `CONFETTI`,
            data: [item.type.fxFileId, item.type.id, item.packet],
            isPersistant: false
        })
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Confetti