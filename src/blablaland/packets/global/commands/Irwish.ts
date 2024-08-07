import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"

class Irwish extends BaseCommand {

    async execute(user: User, command: Command, params: string[]): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const period: number = 75 * 60 * 1000
            const remainder: number = Math.floor(Date.now() / period) % 2
            const isClosed: boolean = remainder === 1

            if (isClosed) {
                const untilNextOpening: number = period - (Date.now() % period)
                const hoursUntilOpening: number = Math.floor(untilNextOpening / (1000 * 60 * 60))
                const minutesUntilOpening: number = Math.floor((untilNextOpening % (1000 * 60 * 60)) / (1000 * 60))

                user.interface.addInfoMessage(`La cheminée de l'Irwish ouvrira dans ${hoursUntilOpening > 0 ? `${hoursUntilOpening} heure${hoursUntilOpening !== 1 ? 's' : ''}` : ''}${hoursUntilOpening > 0 && minutesUntilOpening > 0 ? ' et ' : ''}${minutesUntilOpening > 0 ? `${minutesUntilOpening} minute${minutesUntilOpening !== 1 ? 's' : ''}` : ''}. ${(hoursUntilOpening === 0 && minutesUntilOpening <= 15) ? `Bientôt le moment de récupérer votre récompense !` : 'Encore un peu de patience ! :D'}`)
            } else {
                user.interface.addInfoMessage("La cheminée de l'Irwish est ouverte ! C'est le moment de récupérer votre récompense !")
            }
        }
    }
}

export default Irwish