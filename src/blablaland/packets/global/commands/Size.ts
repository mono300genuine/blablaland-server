import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command, ParamsFX } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import ServerManager from "../../../../libs/manager/ServerManager"

class Size extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const userFound: User|undefined = serverManager.getUserByPseudo(params[1], {
                inConsole: false
            })

            if (userFound) {
                const FX: ParamsFX|undefined = userFound.hasFX(4, `SIZE_SKIN`)
                if (FX) {
                    userFound.userFX.dispose(FX)
                }
                const size: number = [0, 600, 500, 450, 400, 350, 300, 280, 10, 20, 30, 40, 50, 60, 70, 80][parseInt(params[2])] ?? 0
                if (size === 0) {
                    if (FX) {
                        userFound.userFX.dispose(FX)
                    }
                    return
                }
                userFound.userFX.writeChange({
                    id: 4,
                    identifier: `SIZE_SKIN`,
                    data: {
                        size: size
                    }
                })
            }
        }
    }
}

export default Size