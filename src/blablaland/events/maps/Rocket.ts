import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Rocket {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: MapEvent, universeManager: UniverseManager): void {
        const planetId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_PLANETID)

        if (planetId !== 2) {
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteString(user.pseudo)

            universeManager.getMapById(101).mapFX.writeChange(user, {
                id: 6,
                data: socketMessage,
                duration: 8
            })
            user.getCamera()?.gotoMap(355, { method: 1 })
        } else {
            user.getCamera()?.gotoMap(340, { method: 1 })
        }

    }
}

export default Rocket