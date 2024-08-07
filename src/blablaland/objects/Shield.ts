import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Shield {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `SHIELD`)
        const dateServer: number =  Date.now()
        const launchedAt: number = Math.floor(dateServer / 1000)

        if (!FX) {
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(32, item.database.quantity) // object count
            socketMessage.bitWriteUnsignedInt(32, launchedAt)

            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                duration: item.database.quantity,
                launchedAt: launchedAt,
                identifier: `SHIELD`,
                isPersistant: true,
            }
            user.userFX.writeChange(params)
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default Shield