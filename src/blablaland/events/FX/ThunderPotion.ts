import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { ParamsFX } from "../../../interfaces/blablaland"

class ThunderPotion {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(8, 60)
        socketMessage.bitWriteBoolean(false)

        const FX: ParamsFX|undefined = user.hasFX(6, `LIGHTNING_EFFECT`)
        if (!FX) {
            let params: ParamsFX = {
                id: 6,
                identifier: `LIGHTNING_EFFECT`,
                data: [35, 0, socketMessage],
                duration: 60
            }
            user.userFX.writeChange(params)
        }
    }
}

export default ThunderPotion