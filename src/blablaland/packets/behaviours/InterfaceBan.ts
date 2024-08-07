import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import NavalBattleManager from "../../../libs/manager/NavalBattleManager"
import NavalBattle from "../../../libs/blablaland/games/NavalBattle/NavalBattle"

class InterfaceBan {

    /**
     * InterfaceBan
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (user.mapId === 10) return
        const text: string = `Visite de la prison pendant une minute ^^`
        user.experienceBan = user.experience + 1

        const userJail: number = await global.db('players')
                    .where('user_id', user.id)
                    .update({
                        reason_ban: text,
                        experience_ban: user.experienceBan,
                    })

        if (userJail) {
            user.interface.addInfoMessage(`${user.pseudo} est parti visiter la prison !`, {
                isMap: true
            })
            user.getCamera()?.gotoMap(10, { method: 6 })

            const navalBattleManager: NavalBattleManager = serverManager.getNavalBattleManager()
            const listNavalBattle: NavalBattle[]|undefined = navalBattleManager.getListNavalBattleByUser(user)
            if (listNavalBattle) {
                for (let navalBattle of listNavalBattle) {
                    navalBattle.close(user, 5)
                    navalBattleManager.removeNavalBattleByGameId(navalBattle.id)
                }
            }
        }
    }
}

export default InterfaceBan