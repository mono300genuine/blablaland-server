import User from "../../libs/blablaland/User"
import UniverseManager from "../../libs/manager/UniverseManager"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Laser {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const userPID: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const positionX: number = item.packet.bitReadSignedInt(16)
        const positionY: number = item.packet.bitReadSignedInt(16)
        const direction: boolean = item.packet.bitReadBoolean()
        const walk : number = item.packet.bitReadSignedInt(2)
        const jump: number = item.packet.bitReadSignedInt(2)
        const isRed: boolean = item.packet.bitReadBoolean()

        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, userPID)
        socketMessage.bitWriteSignedInt(16, positionX)
        socketMessage.bitWriteSignedInt(16, positionY)
        socketMessage.bitWriteBoolean(direction)
        socketMessage.bitWriteSignedInt(2, walk)
        socketMessage.bitWriteSignedInt(2, jump)
        socketMessage.bitWriteBoolean(false) // isRed

        const map = universeManager.getMapById(user.mapId)
        if (!map.isProtected()) {
            let params: ParamsFX = {
                id: 5,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                isPersistant: false
            }
            map.mapFX.writeChange(user, params)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default Laser