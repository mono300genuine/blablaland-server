import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class IceMagician {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if (event.type === 0) {
            const positionX: number = event.packet.bitReadSignedInt(17)
            const positionY: number = event.packet.bitReadSignedInt(17)
            const directionX: number = event.packet.bitReadSignedInt(8)
            const directionY: number = event.packet.bitReadSignedInt(8)
            event.packet.bitReadSignedInt(7)

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(16,  100)
            universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
                id: 5,
                data: [52, 1, socketMessage],
                identifier: 'SURFACE_COVER',
                memory: [directionX, directionY],
                duration: 10,
            })
        }
    }
}

export default IceMagician