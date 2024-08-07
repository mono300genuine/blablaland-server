import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Luge {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX : ParamsFX|undefined = user.hasFX(6, `LUGE`)
        if (!FX) {
            let params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, item.packet],
                identifier: `LUGE`
            }
            user.userFX.writeChange(params)
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default Luge