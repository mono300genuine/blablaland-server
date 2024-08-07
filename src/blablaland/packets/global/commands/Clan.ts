import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command, ParamsFX } from "../../../../interfaces/blablaland"

class Clan extends BaseCommand {

    async execute(user: User, command: Command, params: string[]): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const name: string = params[1]
            if (name && (name.length < 3 || name.length > 6)) {
                return user.interface.addInfoMessage(`Oops ! Le nom du clan doit être compris entre 3 et 6 caractères ! Trouve celui qui t'ira comme un gant :)`)
            }
            user.transform.clan(name)

            await global.db('players')
                .where('user_id', user.id)
                .update({
                    clan: name ?? null
                })
        }
    }
}

export default Clan