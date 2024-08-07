import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import TrackerUser from "../../../libs/blablaland/tracker/TrackerUser"

class UserKick {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.isModerator()) return
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const serverId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SERVER_ID)
        const unknown: boolean = packet.bitReadBoolean()
        const text: string = packet.bitReadString()

        const userFound: User|undefined = serverManager.getUserByPid(userPID)
        if(userFound) {
            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    let userTracker: TrackerUser|undefined = item.tracker.getInstanceByUser(instance, userFound)
                    if (userTracker) {
                        item.tracker.sendPrivateMessage(instance, userTracker, `Kické : ${text}`, {
                            isHtmlEncode: true,
                            isReceived: true,
                            pseudo: user.username
                        })
                    }
                }
            }

            userFound.interface.addInfoMessage(`${userFound.pseudo} a été kické par ${user.pseudo}.`, {
                isMap: true,
            })
            userFound.interface.addUserMessage(`Kické : ` + text, {
                userPID: user.pid,
                userId: user.id,
                userPseudo: user.pseudo,
                isModo: true,
            })
            userFound.socketManager.close()
            await global.db.insert({
                reason: text,
                duration: 0,
                type: 'KICK',
                moderator_id: user.id,
                player_id: userFound.id,
                created_at: global.db.fn.now(),
                updated_at: global.db.fn.now()
            }).into('punishments')
        }
    }
}

export default UserKick