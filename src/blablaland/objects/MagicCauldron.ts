import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"

class MagicCauldron {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const positionX: number = item.packet.bitReadSignedInt(17)
        const positionY: number = item.packet.bitReadSignedInt(17)
        const FX = serverManager.hasFX(5, `MAGIC_CAULDRON_${user.username}`)

        if (!FX) {
            const socketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteSignedInt(17, positionX)
            socketMessage.bitWriteSignedInt(17, positionY)

            const params: ParamsFX = {
                id: 5,
                identifier: `MAGIC_CAULDRON_${user.username}`,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                duration: 60
            }
            universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
        } else {
            user.interface.addInfoMessage(`Tu as déjà un Chaudron Magique actif dans Blablaland !`)
        }
    }
}

export default MagicCauldron