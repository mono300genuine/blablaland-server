import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import Camera from "../../../libs/blablaland/Camera"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"

class CreateCamera {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.isModerator()) return
        let cameraId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CAMERA_ID)
        const cameraUser: Camera[] = serverManager.getListCamera().filter(function (camera: Camera): boolean {
            return camera.user.pid == user.pid
        })
        for (let camera of cameraUser) {
            cameraId = camera.id
        }
        cameraId++
        let camera: Camera = new Camera(cameraId, user, false, 0)
        serverManager.addListCamera(camera)

        const packetSender: Packet = {
            type: 3,
            subType: 1
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_ERROR_ID,user.isGameUnmodified ? 0 : 1)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CAMERA_ID, cameraId)
        user.socketManager.send(socketMessage)
    }
}

export default CreateCamera