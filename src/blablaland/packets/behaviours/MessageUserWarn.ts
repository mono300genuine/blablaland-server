import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class MessageUserWarn {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const text: string = packet.bitReadString()

        const userFound: User|undefined = serverManager.getUserById(userId, {
            inConsole: true
        })
        if (userFound) {
            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    let userTracker = item.tracker.getInstanceByUser(instance, user)
                    if (userTracker) {
                        item.tracker.sendPrivateMessage(instance, userTracker, text, {
                            isHtmlEncode: true,
                            isReceived: false,
                            isModerator: true,
                            pseudo: userFound.pseudo
                        })
                    }
                }
            }
        }
    }
}

export default MessageUserWarn