import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import TrackerUser from "../../../libs/blablaland/tracker/TrackerUser"

class UserWarn {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.isModerator()) return
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const unknown: boolean = packet.bitReadBoolean()
        const text: string = packet.bitReadString()

        const userFound: User|undefined = serverManager.getUserByPid(userPID)
        if(userFound) {
            userFound.interface.addUserMessage(text, {
                userPID: user.pid,
                userId: user.id,
                userPseudo: user.pseudo,
                isModo: true
            })

            for (let item of serverManager.getListUserConsole()) {
                if (item.tracker) {
                    for (let tracker of item.tracker.listInstance) {
                        let userTracker: TrackerUser|undefined = item.tracker.getInstanceByUser(tracker, userFound)
                        if (userTracker) {
                            item.tracker.sendPrivateMessage(tracker, userTracker, text, {
                                isHtmlEncode: true,
                                isReceived: true,
                                isModerator: true,
                                pseudo: user.pseudo
                            })
                        }
                    }
                }
            }
        }
    }
}

export default UserWarn