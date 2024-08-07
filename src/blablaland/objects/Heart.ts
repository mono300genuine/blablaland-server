import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import ServerManager from "../../libs/manager/ServerManager"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"

class Heart {

    /**
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const PID: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const positionX: number = item.packet.bitReadUnsignedInt(16)
        const positionY: number = item.packet.bitReadUnsignedInt(16)
        const name: string = item.packet.bitReadString()

        const userFound: User|undefined = serverManager.getUserByPid(PID)
        if (!userFound || user.pseudo === userFound.pseudo) return

        item.packet.bitWriteString(user.pseudo)
        item.packet.bitWriteString(userFound.pseudo)

        const dateServer: number = Date.now()
        item.packet.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        item.packet.bitWriteUnsignedInt(10, dateServer % 1000)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, item.packet],
            duration: 3600
        }
        universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)

        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Heart