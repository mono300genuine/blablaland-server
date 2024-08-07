import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent, ParamsFX } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class SandCastle {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const nb: number = event.packet.bitReadUnsignedInt(3)
        const map = universeManager.getMapById(user.mapId)
        const FX: ParamsFX|undefined = map.mapFX.getListFX().filter((FX) => FX.id === 5 && FX.sid === FX_SID).pop()

        if (FX) {
            let { userID, positionX, positionY, direction, stock } = FX.memory
            stock = stock - 1

            if (stock === 0) {
                map.mapFX.dispose(user, FX)
            } else {
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userID)
                socketMessage.bitWriteSignedInt(17, positionX)
                socketMessage.bitWriteSignedInt(17, positionY)
                socketMessage.bitWriteBoolean(direction)
                socketMessage.bitWriteUnsignedInt(4, stock)

                map.mapFX.writeChange(user, {
                    id: 5,
                    sid: FX_SID,
                    data: [30, 202, socketMessage],
                    memory: { userID, positionX, positionY, direction, stock },
                })
            }
        }
    }
}

export default SandCastle