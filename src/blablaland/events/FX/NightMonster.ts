import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent } from "../../../interfaces/blablaland"

class NightMonster {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const userFound: User|undefined = serverManager.getUserById(userId, {
            inConsole: false
        })

        if (userFound) {
            if ([90, 92, 418, 424, 436].includes(userFound.skinId)) {
                user.transform.nightMonster(userFound.skinId + 1, userFound.pseudo)
            } else if ([91, 93, 419, 425, 439].includes(userFound.skinId)) {
                user.transform.nightMonster(userFound.skinId, userFound.pseudo)
            }
        }
    }
}

export default NightMonster