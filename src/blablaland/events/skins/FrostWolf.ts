import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Jeep {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if(event.type === 1) {
            const danceIceStep: number = event.packet.bitReadUnsignedInt(6)
            const positionX: number = event.packet.bitReadSignedInt(17)
            const positionY: number = event.packet.bitReadSignedInt(17)

            const socketMessage: SocketMessage = new SocketMessage()
            /*
            socketMessage.bitWriteUnsignedInt(16,  danceIceStep * 10)
            universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
                id: 5,
                data: [52, 1, socketMessage],
                identifier: 'SURFACE_COVER',
                memory: [positionX, positionY],
                duration: 10,
            })
           */
        }
    }
}

export default Jeep