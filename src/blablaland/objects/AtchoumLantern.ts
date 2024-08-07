import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"

class AtchoumLantern {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const color: number = item.packet.bitReadUnsignedInt(5)
        const text: string = item.packet.bitReadString()
        const dateServer: number = Date.now()

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
        socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
        socketMessage.bitWriteString(user.pseudo)
        socketMessage.bitWriteString(text)
        socketMessage.bitWriteUnsignedInt(5, color)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, socketMessage],
            identifier: `ATCHOUM_LANTERN`,
            duration: 3600
        }
        const map = universeManager.getMapById(user.mapId)
        if (map) {
            let nbAtchoumLantern: number = 0
            for (let FX of map.mapFX.getListFX()) {
                if (FX.identifier?.includes(`ATCHOUM_LANTERN`)) {
                    nbAtchoumLantern++
                }
            }
            if (nbAtchoumLantern <= 4) {
                map.mapFX.writeChange(user, params)
                item.database.quantity--
                user.inventory.reloadObject(item.database)
            } else {
                return user.interface.addInfoMessage(`Impossible d'ajouter plus de Lampion Atchouuuum sur cette map.`)
            }
        }
    }
}

export default AtchoumLantern