import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent, Packet, ParamsFX } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"

class FeatherBomb {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const type: number = event.packet.bitReadUnsignedInt(4)

        const map = universeManager.getMapById(user.mapId)
        const surfaceCover: ParamsFX|undefined = map.hasFX(5, `SURFACE_COVER`)

        if (type === 1) {
        /*
            if (surfaceCover) {
                console.log(surfaceCover.memory[0], surfaceCover.memory[1])
                let packetSender: Packet = {
                    type: 1,
                    subType: 16
                }
                const socketMessage: SocketMessage = new SocketMessage(packetSender)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, 9)
                socketMessage.bitWriteUnsignedInt(3, 1)
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(12, surfaceCover.memory[0])
                socketMessage.bitWriteUnsignedInt(12, surfaceCover.memory[1])
                socketMessage.bitWriteUnsignedInt(32, 10)
                socketMessage.bitWriteBoolean(false)
                user.socketManager.send(socketMessage)
            }
         */
        }


    }
}

export default FeatherBomb