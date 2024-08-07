import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"

class UserTeleport {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const currentServerId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const newServerId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)

        const userFound: User|undefined = serverManager.getUserByPid(userPID)
        if (!userFound) return

        if (userFound.id != user.id && !user.hasRight('DROITSTELEPORTS')) return
        if (userFound.id == user.id && !user.hasRight('DROITSTELEPORTO')) return

        const map = serverManager.getUniverseById(newServerId)?.universeManager.getMapById(mapId)
        userFound.getCamera()?.gotoMap(mapId, {
            serverId: currentServerId != newServerId ? newServerId : undefined,
            mapFileId: map?.fileId != map?.id ? map?.fileId : undefined,
            isTeleportForce: true
        })
    }
}

export default UserTeleport