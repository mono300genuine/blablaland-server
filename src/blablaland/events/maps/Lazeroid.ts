import User from "../../../libs/blablaland/User"
import { MapEvent, ParamsFX } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"

class Lazeroid {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: MapEvent, universeManager: UniverseManager): void {
        const map = universeManager.getMapById(user.mapId)

        const FX: ParamsFX|undefined = map.hasFX(6, `LAZEROID`)
        const dateServer: number = Date.now()
        let isActive: boolean = true

        if (FX) {
            isActive = false
            map.mapFX.dispose(user, FX)
        }

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteBoolean(isActive)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)

        map.mapFX.writeChange(user, {
            id: 6,
            isActive: isActive,
            identifier: `LAZEROID`,
            data: socketMessage
        })
    }
}

export default Lazeroid