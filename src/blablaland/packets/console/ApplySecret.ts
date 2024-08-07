import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { Packet } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"


class ApplySecret {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.hasRight('SECRETALLOW')) return
        const secretChat: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_GRADE)
        const secretTracker: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_GRADE)

        if (user.secretChat != secretChat) {
            user.secretChat = secretChat

            let packetSender: Packet = {
                type: 6,
                subType: 3
            }
            let socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
            for (let user of serverManager.getListUserConsole()) {
                user.socketManager.send(socketMessage)
            }

            packetSender = {
                type: 6,
                subType: 4
            }
            socketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, user.grade)
            socketMessage.bitWriteString(user.pseudo)
            socketMessage.bitWriteString(user.username)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, user.secretChat) // secretChat
            for (let item of serverManager.getListUserConsole()) {
                if (item.grade >= user.secretChat) {
                    item.socketManager.send(socketMessage)
                }
            }
        } if (user.secretTracker != secretTracker) {
            user.secretTracker = secretTracker

            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    for (let userInstance of instance.getListUser()) {
                        if (item.pid != user.pid) {
                            if (item.grade < user.secretTracker) {
                                item.tracker.sendMessage(instance, userInstance, `${user.pseudo} quitte la poursuite`, { isModerator: true })
                            } else if (item.grade >= user.secretTracker) {
                                item.tracker.sendMessage(instance, userInstance, `${user.pseudo} est maintenant en poursuite`, { isModerator: true })
                            }
                        }
                    }
                }
            }
        }

        await global.db('players')
            .where('user_id', user.id)
            .update({
                secret_chat: secretChat,
                secret_tracker: secretTracker
            })
    }
}

export default ApplySecret