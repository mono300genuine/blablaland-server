import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import NavalBattleManager from "../../../libs/manager/NavalBattleManager"
import NavalBattle from "../../../libs/blablaland/games/NavalBattle/NavalBattle"

class SeaBattle {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const type: number = packet.bitReadUnsignedInt(8)
        const navalBattleManager: NavalBattleManager = serverManager.getNavalBattleManager()

        if (type === 1) { // initFX
            const userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (!userFound || userFound.mapId === 10 || user.mapId === 10|| user.id === userFound.id) {
                return
            }

            const navalBattle: NavalBattle|undefined = navalBattleManager.getListNavalBattleByUsers(userFound, user)
            if (!navalBattle) {
                navalBattleManager.setLastNavalBattleId()
                const gameId: number = navalBattleManager.getLastNavalBattleId()
                const navalBattle: NavalBattle = new NavalBattle(gameId, user, userFound)
                navalBattleManager.addListNavalBattle(navalBattle)
                navalBattle.invite()
            } else {
                if (!navalBattle.isStart) {
                    if (navalBattle.sender.id !== user.id) {
                        navalBattle.open()
                    }
                }
            }
        } else if (type === 2) { // close
            const gameId: number = packet.bitReadUnsignedInt(16)
            const getNavalBattle: NavalBattle|undefined = navalBattleManager.getNavalBattleByGameId(gameId)
            if (getNavalBattle) {
                getNavalBattle.close(user, 3)
                navalBattleManager.removeNavalBattleByGameId(gameId)
            }
        } else if (type === 3) { // setReady
            const gameId: number = packet.bitReadUnsignedInt(16)
            const getNavalBattle: NavalBattle|undefined  = navalBattleManager.getNavalBattleByGameId(gameId)
            if (getNavalBattle) {
                getNavalBattle.ready(user, packet)
            }
        } else if (type === 4) { // sendSelectionChanged
            const gameId: number = packet.bitReadUnsignedInt(16)
            const getNavalBattle: NavalBattle|undefined  = navalBattleManager.getNavalBattleByGameId(gameId)
            if (getNavalBattle) {
                getNavalBattle.sendSelectionChanged(user, packet)
            }
        } else if (type === 5) { // sendMyShot
            const gameId: number = packet.bitReadUnsignedInt(16)
            const getNavalBattle: NavalBattle|undefined  = navalBattleManager.getNavalBattleByGameId(gameId)
            if (getNavalBattle) {
                getNavalBattle.sendMyShot(user, packet)
            }
        }
    }
}

export default SeaBattle