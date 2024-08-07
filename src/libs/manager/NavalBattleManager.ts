import NavalBattle from "../blablaland/games/NavalBattle/NavalBattle"
import User from "../blablaland/User"

class NavalBattleManager {

    private listNavalBattle: Array<NavalBattle>
    lastNavalBattleId: number

    constructor() {
        this.listNavalBattle = new Array<NavalBattle>()
        this.lastNavalBattleId = 0
    }

    getListNavalBattle(): Array<NavalBattle> {
        return this.listNavalBattle
    }

    /**
     * @param user
     */
    getListNavalBattleByUser(user: User): NavalBattle[]|undefined {
        return this.getListNavalBattle().filter((navalBattle: NavalBattle) => navalBattle.sender.id === user.id || navalBattle.receiver.id === user.id)
    }

    /**
     * @param navalBattle
     */
    addListNavalBattle(navalBattle: NavalBattle): void {
        this.listNavalBattle.push(navalBattle)
    }

    getListNavalBattleByUsers(user: User, sender: User): NavalBattle|undefined {
        const navalBattles: NavalBattle[] = this.getListNavalBattle()
        return navalBattles.find((navalBattle: NavalBattle) =>
            (navalBattle.sender.id === user.id && navalBattle.receiver.id === sender.id) ||
            (navalBattle.sender.id === sender.id && navalBattle.receiver.id === user.id)
        )
    }

    getNavalBattleByGameId(gameId: number): NavalBattle|undefined {
        return this.getListNavalBattle().find((navalBattle: NavalBattle): boolean => navalBattle.id === gameId)
    }

    setLastNavalBattleId(): void {
        this.lastNavalBattleId++
    }

    getLastNavalBattleId(): number {
        return this.lastNavalBattleId
    }

    /**
     * @param gameId
     */
    removeNavalBattleByGameId(gameId: number): void {
        this.listNavalBattle = this.listNavalBattle.filter((navalBattle: NavalBattle) => navalBattle.id !== gameId)
    }

}

export default NavalBattleManager