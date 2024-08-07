import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import Camera from "../../../libs/blablaland/Camera"
import ServerManager from "../../../libs/manager/ServerManager"
import { ParamsFX } from "../../../interfaces/blablaland"

class AskServer {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const type: number = packet.bitReadUnsignedInt(16)

        if (type === 1) {// Irwish Scene
            const cameraId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CAMERA_ID)
            const cameraFound: Camera | undefined = user.getCamera(cameraId)
            if (cameraFound) {
                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteUnsignedInt(32, Math.floor(serverManager.irwishScene / 1000))
                socketMessage.bitWriteUnsignedInt(10, serverManager.irwishScene % 1000)
                universeManager.getMapById(cameraFound.currMap).mapFX.writeChange(user, {
                    id: 5,
                    data: [24, 0, socketMessage],
                    isPersistant: false
                })
            }
        } else if (type === 2) { // N400 Drapeau
            const cameraId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CAMERA_ID)
            const cameraFound: Camera | undefined = user.getCamera(cameraId)
            if (cameraFound) {
                let status: number = 3
                const result = await global.db('player_skin')
                    .where({ player_id: user.id })
                    .whereIn('skin_id', [139, 239, 387, 569])

                if (result.length === 4) {
                    if (user.inventory.getObject(244)) {
                        status = 2
                    } else {
                        status = 1
                        user.inventory.reloadOrInsertObject(244)
                    }
                }
                packet = new SocketMessage()
                packet.bitWriteUnsignedInt(3, 0)
                packet.bitWriteUnsignedInt(3, status)
                user.userFX.writeChange({
                    id: 8,
                    data: packet,
                    isMap: false,
                    isPersistant: false
                })
            }
        } else if (type === 3) {
            const FX: ParamsFX|undefined = user.hasFX(6, `SHIELD_CELESTIAL`)
            if (FX || !FX && ![529, 530, 601, 602].includes(user.skinId)) return
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(10, 60) // Time
            user.userFX.writeChange({
                id: 6,
                identifier: `SHIELD_CELESTIAL`,
                data: [38, 1, socketMessage],
                duration: 60
            })
        }
    }
}

export default AskServer