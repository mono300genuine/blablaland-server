 import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet, Right } from "../../../interfaces/blablaland"
import { MessageBuilder, Webhook } from "discord-webhook-node"

class Identity {

    /**
     * Auth console
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const secretChat: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_GRADE)
        const secretTracker: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_GRADE)

        user.secretChat = user.hasRight('SECRETALLOW') ? secretChat : 0
        user.secretTracker = user.hasRight('SECRETALLOW') ? secretTracker : 0

        let packetSender: Packet = {
            type: 1,
            subType: 18
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(32, user.clientBytes.id)
        socketMessage.bitWriteUnsignedInt(32, user.clientBytes.position)
        socketMessage.bitWriteUnsignedInt(32, user.clientBytes.size)
        user.socketManager.send(socketMessage)

        packetSender = {
            type: 2,
            subType: 3
        }
        socketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_ERROR_ID, user.isModerator() ? 0 : 1)
        user.socketManager.send(socketMessage)

        user.inConsole = true
        user.isGameUnmodified = true

        let moderatorFound: User|undefined = serverManager.getListUserConsole().find(item => item.id === user.id)
        if (moderatorFound) moderatorFound.socketManager.close()

        /**
          *Login to the moderators' chat
         **/
        packetSender = {
            type: 6,
            subType: 2
        }
        socketMessage = new SocketMessage(packetSender)
        for (let item of serverManager.getListUserConsole()) {
            if (!item.secretChat || user.grade >= item.secretChat) {
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, item.pid)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, item.grade)
                socketMessage.bitWriteString(item.pseudo)
                socketMessage.bitWriteString(item.username)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_GRADE, item.secretChat) // secretChat
            }
        }
        socketMessage.bitWriteBoolean(false)
        user.socketManager.send(socketMessage)
        serverManager.addListUserConsole(user)

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
            if (item.id === user.id || item.grade >= user.secretChat) {
                item.socketManager.send(socketMessage)
            }
        }

        /**
         * Rights
         */
        let rights: Right[] = serverManager.getListRight()
        packetSender = {
            type: 6,
            subType: 7
        }
        socketMessage = new SocketMessage(packetSender)
        for (let right of rights) {
            socketMessage.bitWriteUnsignedInt(16, right.gradeId)
        }
        user.socketManager.send(socketMessage)

        const webhook: string|undefined = process.env.WEBHOOK_CONSOLE
        if (webhook && !user.isAdmin()) {
            const sender: Webhook = new Webhook(webhook)
            const embed: MessageBuilder = new MessageBuilder()
                .setColor(5763719)
                .setTitle('Console')
                .setDescription(`Connexion à la console`)
                .setAuthor(`${user.username} (${user.pseudo})`)
                .setTimestamp()
            await sender.send(embed)
        }

        serverManager.addListUser(user)
        user.socketManager.send(serverManager.getUsersCount(user.serverId))
        setInterval(() => user.socketManager.send(serverManager.getUsersCount(user.serverId)), 5000)
    }
}

export default Identity