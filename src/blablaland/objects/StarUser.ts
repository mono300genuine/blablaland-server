import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class StarUser {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        if (!user.isModerator()) return
        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))

        const params: ParamsFX = {
            id: 6,
            data: [item.type.fxFileId, item.type.id, socketMessage],
            isPersistant: true,
        }
        user.userFX.writeChange(params)
    }
}

export default StarUser