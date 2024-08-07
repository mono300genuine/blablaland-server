import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Candy {

    execute(user: User, item: ObjectDefinition) {
        const FX: ParamsFX|undefined = user.hasFX(6, `CANDY_${item.type.id}`)
        if (!FX) {
            let params : ParamsFX = {
                id: 6,
                identifier: `CANDY_${item.type.id}`,
                data: [item.type.fxFileId, item.type.id],
                isPersistant: true,
                duration: 60
            }
            user.userFX.writeChange(params)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default Candy