import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Instrument {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const FX: ParamsFX|undefined = user.hasFX(6, `INSTRUMENT`)

        if (type === 0) {
            if (!FX) {
                const params: ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id],
                    identifier: `INSTRUMENT`
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
            if (!FX) return
            const musicNote: number = item.packet.bitReadUnsignedInt(4)

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteUnsignedInt(4, musicNote)

            const params: ParamsFX = {
                id: 6,
                identifier: `INSTRUMENT`,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                isPersistant: false
            }
            user.userFX.writeChange(params)
        }
    }
}

export default Instrument