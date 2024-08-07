import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import ServerManager from "../../../../libs/manager/ServerManager"
import SocketMessage from "../../../../libs/blablaland/network/SocketMessage"
import { MessageBuilder, Webhook}  from "discord-webhook-node"

class GiveBBL extends BaseCommand {

    /**
     * @param user
     * @param command
     * @param params
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const amount: number = Number(params[2])
        if (isNaN(amount)) {
            return user.interface.addInfoMessage(`Le montant doit être un nombre valide !!`)
        } else if (amount > 3000) {
            return user.interface.addInfoMessage(`Le montant maximum est de 3000 BBL !!`)
        }
        const receiver = await global.db.select('*').from('players').where('pseudo', params[1]).first()
        if (receiver) {
            if (receiver.id === user.id) {
                return user.interface.addInfoMessage(`Impossible de se donner des BBL's !!`)
            }
            const updateBBL: number = await global.db('players').where(`user_id`, receiver.id).increment('blabillon', amount)
            if (updateBBL) {
                const userFound: User|undefined = serverManager.getUserByPseudo(params[1], {
                    inConsole: false
                })
                if (userFound) {
                    userFound.interface.addInfoMessage(`Tu viens de recevoir ${amount} BBL de la part de ${user.pseudo} !!`)
                    userFound.socketManager.send(new SocketMessage({ type: 2, subType: 13 }))
                }
                user.interface.addInfoMessage(`Le don de ${amount} BBL vient d'être effectué avec succès à ${receiver.pseudo} ;)`)

                const webhook: string|undefined = process.env.WEBHOOK_CMD
                if (webhook && !user.isAdmin()) {
                    const sender: Webhook = new Webhook(webhook)
                    const embed: MessageBuilder = new MessageBuilder()
                        .setColor(15844367)
                        .setTitle('Modération')
                        .setDescription(`Utilisation d'une commande`)
                        .setAuthor(`${user.username} (${user.pseudo})`)
                        .addField(`Commande`, command.name.toUpperCase())
                        .addField(`Commentaire`, `${amount} BBL à (${receiver.user_id}) ${receiver.pseudo} `)
                        .setTimestamp()
                    await sender.send(embed)
                }
            }
        } else {
            return user.interface.addInfoMessage(`${params[1]} est introuvable dans la base de données !!`)
        }
    }

}

export default GiveBBL