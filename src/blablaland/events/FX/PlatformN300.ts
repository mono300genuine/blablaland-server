import User from "../../../libs/blablaland/User"
import { FXEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class PlatformN300 {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const map = universeManager.getMapById(user.mapId)

        for (let FX of map.mapFX.getListFX()) {
            if (FX.id === 5 && FX.sid === FX_SID) {
                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
                socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)

                map.mapFX.writeChange(user, {
                    id: 5,
                    sid: FX_SID,
                    data: [20, 3, socketMessage],
                    isPersistant: false
                })
                user.getCamera()?.gotoMap(340, {
                    method: 1
                })
            }
        }
    }
}

export default PlatformN300