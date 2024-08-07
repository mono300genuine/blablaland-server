import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"

class BirthdayBalloon {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const positionX: number = item.packet.bitReadUnsignedInt(16)
        const positionY: number = item.packet.bitReadUnsignedInt(16)
        const name: string = item.packet.bitReadString()

        const dateServer: number = Date.now()
        item.packet.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        item.packet.bitWriteUnsignedInt(10, dateServer % 1000)
        item.packet.bitWriteString(name)

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

export default BirthdayBalloon