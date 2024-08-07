import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Burn {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const positionX: number = event.packet.bitReadSignedInt(16)
        const positionY: number = event.packet.bitReadSignedInt(16)
        const map = universeManager.getMapById(user.mapId)

        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteSignedInt(16, positionX)
        socketMessage.bitWriteSignedInt(16, positionY)

        map.mapFX.writeChange(user,{
            id: 5,
            data: [30, 3, socketMessage],
            identifier: `FIRE`,
            duration: 15,
        })
    }
}

export default Burn