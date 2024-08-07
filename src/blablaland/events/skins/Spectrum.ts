import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Spectrum {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        const positionX: number = event.packet.bitReadSignedInt(17)
        const positionY: number = event.packet.bitReadSignedInt(17)
        const surfaceBody: number = event.packet.bitReadUnsignedInt(4)

        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteSignedInt(17, positionX)
        socketMessage.bitWriteSignedInt(17, positionY)
        socketMessage.bitWriteUnsignedInt(4, surfaceBody)
        socketMessage.bitWriteString(user.pseudo)
        socketMessage.bitWriteUnsignedInt(2, user.gender)

        const FX = serverManager.hasFX(5, `TOMB_${user.id}_`)
        if (FX && FX.item) {
            FX.map.mapFX.dispose(user, FX.item)
        }

        universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
            id: 5,
            identifier: `TOMB_${user.id}`,
            data: [39, 271, socketMessage],
            memory: [user.mapId, user.walker.positionX, user.walker.positionY],
            duration: 7200
        })
    }
}

export default Spectrum