import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties";
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Fairy {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        const positionX: number = event.packet.bitReadSignedInt(17)
        const positionY: number = event.packet.bitReadSignedInt(17)
        const surfaceBody: number = event.packet.bitReadUnsignedInt(8)
        const skinColor: number = event.packet.bitReadUnsignedInt(8)
        const userPID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteSignedInt(17, positionX)
        socketMessage.bitWriteSignedInt(17, positionY)
        socketMessage.bitWriteUnsignedInt(8, surfaceBody)
        socketMessage.bitWriteUnsignedInt(8, skinColor)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userPID)

        const params: ParamsFX = {
            id: 5,
            data: [19, 103, socketMessage],
            duration: 30
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
    }
}

export default Fairy