import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import { MessageBuilder, Webhook } from "discord-webhook-node"

class ClearMap extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const map = universeManager.getMapById(user.mapId)

            for (let FX of map.mapFX.getListFX()) {
                if (!FX.identifier?.includes('HOUSE')) {
                    map.mapFX.dispose(user, FX)
                }
            }
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
                .setTimestamp()
            await sender.send(embed)
        }
    }
}

export default ClearMap