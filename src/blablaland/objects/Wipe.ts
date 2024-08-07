import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Wipe {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(3, `PAINT`)
        if (FX) {
            let params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, new SocketMessage],
                isPersistant: false
            }
            user.userFX.writeChange(params)
            user.userFX.dispose(FX)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default Wipe