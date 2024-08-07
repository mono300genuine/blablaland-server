import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Drum {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `DRUM`)
        if (!FX) {
            let params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, item.packet],
                identifier: `DRUM`
            }
            user.userFX.writeChange(params)
        } else {
            user.userFX.dispose(FX)
            if (item.type.id !== FX.data[1]) {
                item.packet.bitPosition = 0
                this.execute(user, item)
            }
        }
    }
}

export default Drum