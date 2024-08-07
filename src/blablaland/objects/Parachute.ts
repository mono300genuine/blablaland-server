import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Parachute {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `PARACHUTE`)
        
        if (!FX) {
            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, new SocketMessage],
                identifier: `PARACHUTE`,
                isPersistant: true,
            }
            user.userFX.writeChange(params)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default Parachute