import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UserDie from "../../packets/global/UserDie"
import { MapEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"

class TransitionN300 {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: MapEvent, universeManager: UniverseManager): void {
        if (user.skinId === 387) {
            return user.getCamera()?.gotoMap(339)
        }

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteString(`n'a pas supporté le voyage !`)
        socketMessage.bitWriteUnsignedInt(8, 1)
        new UserDie().execute(user, socketMessage, universeManager)
    }
}

export default TransitionN300