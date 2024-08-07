import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import Camera from "../../../libs/blablaland/Camera"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"
import ServerManager from "../../../libs/manager/ServerManager"

class MoveToMap {

    /**
     *
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const method: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_METHODE_ID)
        const cameraId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CAMERA_ID)
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)

        const cameraFound: Camera|undefined = user.getCamera(cameraId)
        const map = serverManager.getUniverseById(serverId)!.universeManager.getMapById(mapId)

        if (cameraFound !== undefined) {
            const error: number = cameraFound.currMap === 10 && !user.inConsole && mapId !== 10 ? 1 : 0

            if (!error) {
                if (serverId != cameraFound.serverId) {
                    cameraFound.gotoMap(mapId, {
                        serverId: serverId,
                        mapFileId: map.fileId,
                        method: method,
                        isTeleportForce: true
                    })
                } else {
                    universeManager.getMapById(user.mapId).leave(user, method)
                }

                cameraFound.method = method
                cameraFound.prevMap = cameraFound.currMap
                cameraFound.currMap = mapId
                cameraFound.serverId = serverId
                cameraFound.mapReady = false

                user.walker.readStateFromMessage(packet)
            }

            const packetSender: Packet = {
                type: 3,
                subType: 5
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CAMERA_ID, cameraFound.id)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, map.id)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, serverId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_FILEID, map.fileId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_METHODE_ID, method)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_ERROR_ID, error)
            user.socketManager.send(socketMessage)
        }
    }
}

export default MoveToMap