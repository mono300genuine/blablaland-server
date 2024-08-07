import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import {Command, CommandArgument} from "../../../../interfaces/blablaland"
import Commands from '../../../../json/commands.json'

class Help extends BaseCommand {

    async execute(user: User, command: Command, params: string[]): Promise<void> {
        if (params[1]) {
            await this.displayCommandHelp(user, params[1])
        } else {
            await this.displayAllCommands(user)
        }
    }

    private async displayCommandHelp(user: User, commandName: string): Promise<void> {
        const command: Command|undefined = this.findCommandByName(commandName);

        if (command && user.grade >= command.grade) {
            let message: string = `<span class=\"message_modo\">Aide pour la commande !${command.name} :\n`
            message += `Description :</span> </span><span class=\"user\">${command.description}</span>\n`

            if (command.arguments && command.arguments.length > 0) {
                message += "<span class=\"message_modo\">Liste des arguments :</span>\n";
                command.arguments.forEach((arg: CommandArgument): void => {
                    message += `<span class=\"message_modo\">${arg.name}${arg.required ? '' : '?'} :</span><span class=\"user\"> ${arg.description}</span>\n`
                })
            }

            user.interface.addInfoMessage(message.trim(), {
                isHtml: true
            })
        } else {
            user.interface.addInfoMessage(`La commande "${commandName}" n'existe pas.`);
        }
    }

    private async displayAllCommands(user: User): Promise<void> {
        let message: string = "<span class=\"message_modo\">Liste des commandes disponibles :\n</span>";
        Commands.forEach((command: Command, index: number): void => {
            if (user.grade >= command.grade) {
                message += `<span class=\"message_modo\">!${command.name}`
                if (command.arguments && command.arguments.length > 0) {
                    message += ` ${this.formatArguments(command.arguments)}`
                }
                message += ` :</span><span class=\"user\"> ${command.description}</span>`
                if (index !== Commands.length - 1) {
                    message += "\n"
                }
            }
        })

        user.interface.addInfoMessage(message, {
            isHtml: true
        })
    }

    private findCommandByName(commandName: string): Command | undefined {
        return Commands.find((command: Command): boolean => {
            const name: string = command.name || ''
            return name.toLowerCase() === commandName.toLowerCase()
        })
    }

    private formatArguments(args: CommandArgument[] | undefined): string {
        if (!args || args.length === 0) {
            return ''
        }

        return args.map((arg: CommandArgument): string => `${arg.name}${arg.required ? '' : '?'}`).join(' ')
    }
}

export default Help