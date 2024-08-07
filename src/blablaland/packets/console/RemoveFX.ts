import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import Binary from "../../../libs/blablaland/network/Binary"

class RemoveFX {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.inConsole) return
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const skinId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SKIN_ID)
        const binary: Binary = packet.bitReadBinaryData()
        const mapId: number = binary.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const FX_SID: number = binary.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)

        const mapFound = serverManager.getUniverseById(serverId)?.universeManager.getMapById(mapId)
        if (!mapFound) return

        for (let FX of mapFound.mapFX.getListFX()) {
            if (FX.id === 5 && FX.sid === FX_SID) {
                mapFound.mapFX.dispose(user, FX)
            }
        }
    }
}

export default RemoveFX