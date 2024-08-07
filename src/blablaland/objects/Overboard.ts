import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Lantern {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const color: number = item.packet.bitReadUnsignedInt(5)
        const FX: ParamsFX|undefined = user.hasFX(6, `OVERBOARD`)

        if (type === 0) {
            if (!FX) {
                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteUnsignedInt(5, color)
                const params: ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    identifier: `OVERBOARD`
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
            if (FX) {
                user.userFX.dispose(FX)
                const boost: ParamsFX|undefined = user.hasFX(6, `OVERBOARD_BOOST`)
                if (boost) {
                    user.userFX.dispose(boost)
                }
            }
        } else if (type == 3) {
            if (FX) {
                if (user.hasFX(6, `OVERBOARD_BOOST`)) return

                const direction: boolean = item.packet.bitReadBoolean()
                let socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteBoolean(user.walker.direction)

                let params: ParamsFX = {
                    id: 6,
                    sid: FX.sid,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    duration: 3,
                    identifier: `OVERBOARD_BOOST`
                }
                user.userFX.writeChange(params)
            }
        }
    }
}

export default Lantern