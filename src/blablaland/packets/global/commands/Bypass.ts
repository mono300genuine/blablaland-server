import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import ServerManager from "../../../../libs/manager/ServerManager"
import { MessageBuilder, Webhook } from "discord-webhook-node"

class Bypass extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const userFound: User|undefined = serverManager.getUserByPseudo(params[1], {
                inConsole: false
            })

            if (userFound) {
                const map = universeManager.getMapById(user.mapId)
                if (map.isObjectAllowed && map.isMessageAllowed) {
                    return user.interface.addInfoMessage(`Les pouvoirs de la map ainsi que les messages sont autorisés. Il est donc impossible d'ajouter un blabla !`)
                }
                if (map.bypassAllowed.includes(userFound.id)) {
                    map.bypassAllowed = map.bypassAllowed.filter((item: number): boolean => item !== userFound.id)
                    user.interface.addInfoMessage(`${userFound.pseudo} vient d'être retiré de la liste des exceptions ;)`)
                    userFound.interface.addInfoMessage(`${user.pseudo} vient de te retirer de la liste des exceptions sur la map :(`)

                } else {
                    map.bypassAllowed.push(userFound.id)
                    user.interface.addInfoMessage(`${userFound.pseudo} vient d'être ajouté à dans la liste des exceptions ;)`)
                    userFound.interface.addInfoMessage(`${user.pseudo} vient de t'ajouter à la liste des exceptions sur la map ! :D`)
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
                        .addField(`Commentaire`, params[1])
                        .setTimestamp()
                    await sender.send(embed)
                }
            } else {
                user.interface.addInfoMessage(`Le joueur n'est pas connecté ou n'existe pas.`)
            }
        }
    }
}

export default Bypass