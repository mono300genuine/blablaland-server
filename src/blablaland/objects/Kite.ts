import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Kite {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const color: number = item.packet.bitReadUnsignedInt(5)
        const FX: ParamsFX|undefined = user.hasFX(6, `KITE`)

        if (type === 0) {
            if (!FX) {
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(5, color)
                const params: ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    identifier: `KITE`
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
        } else if (type == 3) {
            const direction: boolean = item.packet.bitReadBoolean()
        }
    }
}

export default Kite