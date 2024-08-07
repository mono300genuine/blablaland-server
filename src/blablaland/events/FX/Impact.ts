import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
class Impact {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const nbImpact: number =  event.packet.bitReadUnsignedInt(3)
        const map = universeManager.getMapById(user.mapId)
        const dateServer: number = Date.now()

        for (const FX of map.mapFX.getListFX()) {
            if (FX.id === 5 && FX.sid === FX_SID) {
                FX.memory.step -= nbImpact / 3

                if (FX.memory.step > 0) {
                    if (FX.memory.ended) {
                        const socketMessage: SocketMessage = new SocketMessage()
                        socketMessage.bitWriteSignedInt(17, FX.memory.x)
                        socketMessage.bitWriteSignedInt(17, FX.memory.y)
                        socketMessage.bitWriteBoolean(FX.memory.ended)
                        socketMessage.bitWriteUnsignedInt(8, Math.floor(FX.memory.step * 255 / 6))
                        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)

                        FX.data[2] = socketMessage
                        map.mapFX.writeChange(user, FX)
                    }
                } else {
                    map.mapFX.dispose(user, FX)
                }
            }
        }
    }
}

export default Impact