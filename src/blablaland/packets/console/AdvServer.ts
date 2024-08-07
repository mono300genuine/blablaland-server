import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { ParamsFX } from "../../../interfaces/blablaland"
import Binary from "../../../libs/blablaland/network/Binary"

class AdvServer {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.hasRight('ADVACCESS')) return
        let binary: Binary|undefined
        let PID: number|undefined
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const isDelete: number = packet.bitReadUnsignedInt(2)
        const FX_ID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_ID)
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        if (isDelete) PID = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const isActive: boolean = packet.bitReadBoolean()
        if (isActive) binary = packet.bitReadBinaryData()
        const isDuration: boolean = packet.bitReadBoolean()

        const mapFound = serverManager.getUniverseById(serverId)?.universeManager.getMapById(mapId)
        if (!mapFound) return

        if (isDelete) {
            const FX: ParamsFX|undefined = mapFound.hasFX(5, `${PID}`)
            if (FX) mapFound.mapFX.dispose(user, FX)
        } else {
            const params: ParamsFX = {
                id: 5,
                data: [FX_ID, FX_SID, binary],
                duration: isDuration ? packet.bitReadUnsignedInt(32) : undefined
            }
            mapFound.mapFX.writeChange(user, params)
        }

    }
}

export default AdvServer