import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Bottle {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(4, `17`)
        if (!FX) {
            const FX: ParamsFX|undefined = user.hasFX(3, `PAINT`)
            if (FX) {
                user.userFX.dispose(FX)
            }
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(32, item.database.quantity)

            const params: ParamsFX = {
                id: 4,
                sid: 17,
                data: {
                    skinId: 306,
                    binary: socketMessage
                },
                isYourself: true
            }
            user.userFX.writeChange(params)
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default Bottle