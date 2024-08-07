import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class Float {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const FX: ParamsFX|undefined = user.hasFX(6, `FLOAT_${item.type.id}`)

        if (type === 0 && !FX) {
            let listFloat: Array<ParamsFX> = new Array<ParamsFX>()
            for (let FX of user.userFX.getListFX()) {
                if (FX.identifier?.includes(`FLOAT_`)) {
                    listFloat.push(FX)
                }
            }
            if (listFloat.length >= 3) {
                user.userFX.dispose(listFloat[0])
            }
            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id],
                identifier: `FLOAT_${item.type.id}`
            }
            user.userFX.writeChange(params)
        } else if (type == 0 && FX) {
            user.userFX.dispose(FX)
        }
    }
}

export default Float