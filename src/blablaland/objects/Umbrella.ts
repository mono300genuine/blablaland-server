import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Umbrella {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const FX: ParamsFX|undefined = user.hasFX(6, `UMBRELLA`)

        if (type === 0) {
            if (!FX) {
                let params: ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id],
                    identifier: `UMBRELLA`
                }
                user.userFX.writeChange(params)
            } else {
                user.userFX.dispose(FX)
                if (item.type.id !== FX.data[1]) {
                    item.packet.bitPosition = 0
                    this.execute(user, item)
                }
            }
        } else if (type == 2) {
            if (FX) user.userFX.dispose(FX)
        }
    }
}

export default Umbrella