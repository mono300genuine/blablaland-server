import { Command, CommandArgument } from "../../../../interfaces/blablaland"
import User from "../../../../libs/blablaland/User"

abstract class BaseCommand {
    abstract execute(...args: any[]): Promise<void>

    protected validateArguments(user: User, command: Command, args: string[]): boolean {
        const requiredArgumentCount: number = command.arguments?.filter((arg: CommandArgument) => arg.required)?.length ?? 0
        if (!this.isValidArgumentCount(args, requiredArgumentCount)) {
            user.interface.addInfoMessage(`La commande '${command.name}' requiert ${requiredArgumentCount} arguments !!`)
            return false
        }

        return this.validateRequiredArguments(user, command.arguments ?? [], args.slice(1))
    }

    private isValidArgumentCount(args: string[], expectedCount: number): boolean {
        return args.length - 1 >= expectedCount
    }

    private validateRequiredArguments(user: User, commandArgs: CommandArgument[], args: string[]): boolean {
        let areArgsValid: boolean = true

        args.forEach((arg: string, index: number): void => {
            const argument: CommandArgument = commandArgs[index]
            if (argument && argument.required && !arg) {
                user.interface.addInfoMessage(`L'argument ${argument.name} est obligatoire.`)
                areArgsValid = false
            }
        })

        return areArgsValid
    }
}

export default BaseCommand