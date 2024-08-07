import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import Camera from "../../../libs/blablaland/Camera"

class RemoveCamera {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const cameraId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CAMERA_ID)

        serverManager.removeCameraById(cameraId, user)
    }
}

export default RemoveCamera