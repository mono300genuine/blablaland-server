import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Lantern {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const isActive: boolean = item.packet.bitReadBoolean()
        const color: number = item.packet.bitReadUnsignedInt(10)
        const FX: ParamsFX|undefined = user.hasFX(6, `LANTERN`)

        if (!FX && isActive) {
            let params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, item.packet],
                identifier: `LANTERN`
            }
            user.userFX.writeChange(params)
        } else if (FX && isActive) {
            user.userFX.dispose(FX)
            item.packet.bitPosition = 0
            this.execute(user, item)
        } else if (FX && !isActive) {
            user.userFX.dispose(FX)
        }
    }
}

export default Lantern