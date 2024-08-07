import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import UserDie from "../../packets/global/UserDie"

class IrwishFireplace {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: MapEvent, universeManager: UniverseManager): void {
        if (Math.floor(+new Date / (75 * 60 * 1000)) % 2 == 1) {
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteString('a essayé(e) de traverser la cheminée')
            socketMessage.bitWriteUnsignedInt(8, 8)
            return new UserDie().execute(user, socketMessage, universeManager)
        }

        user.getCamera()?.gotoMap(341, {
            method: 1,
            positionX: 26650,
            positionY: 39250
        })
    }
}

export default IrwishFireplace