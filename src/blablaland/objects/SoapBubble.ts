import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class SoapBubble {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `SOAPBUBBLE`)
        if (!FX) {
            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id],
                identifier: `SOAPBUBBLE`,
                duration: 20,
                isPersistant: true,
            }
            user.userFX.writeChange(params)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default SoapBubble