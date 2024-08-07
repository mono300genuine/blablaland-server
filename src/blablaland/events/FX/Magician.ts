import User from "../../../libs/blablaland/User"
import { FXEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class Magician {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const isForbidden: boolean = event.packet.bitReadBoolean()

        let userFound: User|undefined = serverManager.getUserById(userId, {
            inConsole: false
        })
        if (userFound && !isForbidden && ![2, 3, 5, 80].includes(userFound.skinId)) {
            user.transform.copy(userFound.skinId, userFound.skinColor)
        } else {
            user.transform.caca('33', 15)
        }
    }
}

export default Magician