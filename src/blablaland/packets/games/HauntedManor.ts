import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { ParamsFX } from "../../../interfaces/blablaland"
import StatGame, { Game }  from "../../../libs/blablaland/games/StatGame"

class HauntedManor {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    async execute(user: User, packet: SocketMessage): Promise<void> {
        const type: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_STYPE)

        if (type === 1) { // hitMonster
            const id: number = packet.bitReadUnsignedInt(16)
            const FX: ParamsFX|undefined = user.hasFX(4, `CHAR`)
            if (FX) {
                await StatGame.upsertPlayerStats(Game.HAUNTED_MANOR, user.id, 0, 0, 0, 1)
            }
        } else if (type === 2) { // hitMonster
            const id: number = packet.bitReadUnsignedInt(16)
            const FX: ParamsFX|undefined = user.hasFX(4, `CHAR`)
            if (FX) FX.memory[1]++
        } else if (type === 3) { // Protect Cheat
            user.getCamera()?.gotoMap(490)
        }
    }
}

export default HauntedManor