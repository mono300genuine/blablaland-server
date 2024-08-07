import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import { MessageBuilder, Webhook } from "discord-webhook-node"

class NoPowers extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const map = universeManager.getMapById(user.mapId)

            map.isObjectAllowed = !map.isObjectAllowed
            user.interface.addInfoMessage(`Les pouvoirs de la map sont maintenant ${map.isObjectAllowed ? 'activés' : 'désactivés'}`)

            if (map.isObjectAllowed && map.isMessageAllowed) {
                map.bypassAllowed = []
            }

            const webhook: string|undefined = process.env.WEBHOOK_CMD
            if (webhook && !user.isAdmin()) {
                const sender: Webhook = new Webhook(webhook)
                const embed: MessageBuilder = new MessageBuilder()
                    .setColor(15844367)
                    .setTitle('Modération')
                    .setDescription(`Utilisation d'une commande`)
                    .setAuthor(`${user.username} (${user.pseudo})`)
                    .addField(`MapId`, user.mapId.toString())
                    .addField(`Commande`, command.name.toUpperCase())
                    .addField(`Commentaire`, `${map.isObjectAllowed ? 'Activation' : 'Désactivation'} des pouvoirs`)
                    .setTimestamp()
                await sender.send(embed)
            }
        }
    }
}

export default NoPowers