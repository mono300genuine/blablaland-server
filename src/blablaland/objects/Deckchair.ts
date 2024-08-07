import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Deckchair {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const isActive: boolean = item.packet.bitReadBoolean()
        const model: number = isActive ? item.packet.bitReadUnsignedInt(2) : 0

        const FX: ParamsFX|undefined = user.hasFX(6, `DECKCHAIR`)
        if (!FX) {
            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(2, model)

            let params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                identifier: `DECKCHAIR`
            }
            user.userFX.writeChange(params)
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default Deckchair