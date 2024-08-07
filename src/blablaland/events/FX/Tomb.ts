import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { FXEvent, Packet, ParamsFX } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SkinColor from "../../../libs/blablaland/SkinColor"

class Tomb {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const type: number = event.packet.bitReadUnsignedInt(3)

        if (type === 0) { // isSpectre
            const channelId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)

            let packetSender: Packet = {
                type: 1,
                subType: 16
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
            for (let map of universeManager.getListMap()) {
                for (let FX of map.mapFX.getListFX()) {
                    if (FX.identifier?.includes('TOMB')) {
                        socketMessage.bitWriteBoolean(true)
                        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, map.id)
                    }
                }
            }
            socketMessage.bitWriteBoolean(false)
            user.socketManager.send(socketMessage)
        } else if (type === 1) { // Teleport
            const mapId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
            const FX: ParamsFX|undefined = universeManager.getMapById(mapId).hasFX(5, `TOMB`)

            if (FX) {
                user.getCamera()?.gotoMap(mapId, {
                    positionX: FX.memory[1],
                    positionY: FX.memory[2],
                })
            }
        } else { // Blibli Spectre
            const pseudo: string = event.packet.bitReadString()
            const userID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userID, {
                inConsole: false
            })
            if (!userFound || ![604, 605].includes(userFound.skinId)) return

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(8, 30)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userID)
            socketMessage.bitWriteString(pseudo)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, userFound.skinId)
            SkinColor.exportBinaryColor(socketMessage, userFound.skinColor)

            let idGhost: number = 0
            if (!user.hasFX(6, `BLIBLI_GHOST_274`)) idGhost = 274
            if (!user.hasFX(6, `BLIBLI_GHOST_273`)) idGhost = 273
            if (!user.hasFX(6, `BLIBLI_GHOST_272`)) idGhost = 272

            if (idGhost !== 0) {
                user.userFX.writeChange({
                    id: 6,
                    identifier: `BLIBLI_GHOST_${idGhost}`,
                    data: [39, idGhost, socketMessage],
                    duration: 30
                })
            }
        }
    }
}

export default Tomb