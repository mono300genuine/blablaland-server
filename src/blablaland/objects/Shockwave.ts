import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Shockwave {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const params: ParamsFX = {
            id: 6,
            data: [item.type.fxFileId, item.type.id, new SocketMessage],
            isPersistant: false
        }
        user.userFX.writeChange(params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Shockwave