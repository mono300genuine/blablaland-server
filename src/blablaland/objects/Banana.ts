import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"

class Banana {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const map = universeManager.getMapById(user.mapId)
        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, item.packet],
            duration: 30,
        }

        const FX: ParamsFX|undefined = user.hasFX(4, '54')
        if (FX) user.userFX.dispose(FX)
        user.userFX.writeChange({
            id: 4,
            sid: 54,
            duration: 10,
            isYourself: true,
            data: {
                walkspeed: 50,
                jumpspeed: 25
            }
        })

        map.mapFX.writeChange(user, params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Banana