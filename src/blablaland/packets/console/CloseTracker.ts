import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { MessageBuilder, Webhook } from "discord-webhook-node"

class CloseTracker {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (!user.isModerator()) return
        const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)

        const userFound: User|undefined = serverManager.getUserById(userId, {
            inConsole: false
        })

        if(userFound) {
           userFound.interface.removeConsoleUserChat(user)

            const webhook: string|undefined = process.env.WEBHOOK_CONSOLE
            if (webhook && !user.isAdmin()) {
                const sender: Webhook = new Webhook(webhook)
                const embed: MessageBuilder = new MessageBuilder()
                    .setColor(15548997)
                    .setTitle('Console')
                    .setDescription('Fermeture d\'un tracker')
                    .setAuthor(`${user.username} (${user.pseudo})`)
                    .addField('Login', userFound.username, true)
                    .addField('Pseudo', userFound.pseudo, true)
                    .setTimestamp()
                await sender.send(embed)
            }
        }
    }
}

export default CloseTracker