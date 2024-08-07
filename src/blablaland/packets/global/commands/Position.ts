import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"

class Position extends BaseCommand {

    async execute(user: User, command: Command, params: string[]): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const positions: string = `X => ${user.walker.positionX}, Y => ${user.walker.positionY}`
            user.interface.addInfoMessage(positions)
        }
    }
}

export default Position