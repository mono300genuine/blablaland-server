import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class Commando {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if (event.type === 1) {
            const positionX: number = event.packet.bitReadSignedInt(17)
            const positionY: number = event.packet.bitReadSignedInt(17)
            const mouseX: number = event.packet.bitReadSignedInt(17)
            const mouseY: number = event.packet.bitReadSignedInt(17)
            const dateServer: number = Date.now()

            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
            socketMessage.bitWriteSignedInt(17, positionX)
            socketMessage.bitWriteSignedInt(17, positionY)
            socketMessage.bitWriteSignedInt(17, mouseX)
            socketMessage.bitWriteSignedInt(17, mouseY)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)

            const params: ParamsFX = {
                id: 5,
                data: [24, 1, socketMessage],
                duration: 3
            }
            universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
        }
    }
}

export default Commando