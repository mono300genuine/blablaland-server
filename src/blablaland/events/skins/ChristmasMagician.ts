import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"

class ChristmasMagician {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const userFound: User|undefined = serverManager.getUserById(userID, {
            inConsole: false
        })

        if (userFound) {
            let skins: Array<number> = [334, 335, 332, 336]
            let skinId: number = skins[Math.floor(Math.random() * skins.length)]
            userFound.transform.magicianChristmas(skinId)
            user.transform.magicianChristmas(skinId)
        }
    }
}

export default ChristmasMagician