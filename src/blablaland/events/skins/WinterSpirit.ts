import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"

class WinterSpirit {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        const mouseX: number = event.packet.bitReadUnsignedInt(17)
        const mouseY: number = event.packet.bitReadUnsignedInt(17)

        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(17, mouseX)
        socketMessage.bitWriteUnsignedInt(17, mouseY)

        universeManager.getMapById(user.mapId).mapFX.writeChange(user,{
            id: 5,
            data: [34, 4, socketMessage],
            isPersistant: true,
            duration: 10
        })
    }
}

export default WinterSpirit