import User from "../../libs/blablaland/User"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../libs/manager/UniverseManager"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"

class TeleportEnter {

    /**
     * @param user
     * @param packet
     * @param universeManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const map = universeManager.getMapById(user.mapId)

        for (let FX of map.mapFX.getListFX()) {
            if (FX_SID === FX.sid) {
                if (FX.data[3]) user.getCamera()?.gotoMap(FX.data[3])
            }
        }
    }
}

export default TeleportEnter