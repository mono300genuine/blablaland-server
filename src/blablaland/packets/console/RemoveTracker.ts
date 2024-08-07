import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"

class RemoveTracker {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const IPAddress: number = packet.bitReadUnsignedInt(32)
        const userID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const userFound: User|undefined = serverManager.getListUser().find(item => (item.id === userID || item.pid === userPID) && !item.inConsole)

        if (!user.tracker) return

        for (let i = 0; i < user.tracker.getListInstance().length; i++) {
            let instance = user.tracker.getListInstance()[i]
            if (instance.IP === IPAddress && instance.id === userID && instance.pid === userPID) {
                user.tracker.getListInstance().splice(i, 1)
                i--
            }
        }

        if (userFound) {
            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    let userTracker = item.tracker.getInstanceByUser(instance, userFound)
                    if (userTracker && item.grade >= user.secretTracker) {
                        item.tracker.sendMessage(instance, userTracker, `${user.pseudo} quitte la poursuite`, { isModerator: true })
                    }
                }
            }
        }
    }
}

export default RemoveTracker