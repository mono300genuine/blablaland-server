import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class Ninja {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        const positionX: number = event.packet.bitReadSignedInt(17)
        const positionY: number = event.packet.bitReadSignedInt(17)
        const direction: boolean = event.packet.bitReadBoolean()
        const dateServer: number = Date.now()

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteSignedInt(17, positionX)
        socketMessage.bitWriteSignedInt(17, positionY)
        socketMessage.bitWriteBoolean(direction)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)

        const params: ParamsFX = {
            id: 5,
            data: [20, 2, socketMessage],
            duration: 3
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
    }
}

export default Ninja