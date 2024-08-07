import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { FXEvent, ParamsFX} from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class ChangeUniverse {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: FXEvent): void {
        const FX: ParamsFX|undefined = user.hasFX(6, 'CHANGE_UNIVERSE')

        if (event.packet.bitReadBoolean()) {
            const serverId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
            const dateServer: number = Date.now()

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, serverId)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(5, 5)

            if (FX) {
                FX.close = 0
                user.userFX.dispose(FX)
            }
            user.userFX.writeChange({
                id: 6,
                identifier: `CHANGE_UNIVERSE`,
                data: [30, 1, socketMessage],
                duration: 5,
                isPersistant: true,
                isMap: true
            })
        } else {
            if (FX) {
                FX.close = 0
                user.userFX.dispose(FX)
            }
        }
    }
}

export default ChangeUniverse