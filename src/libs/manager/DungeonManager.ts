import User from "../blablaland/User"
import Dungeon from "../blablaland/games/Dungeon/Dungeon"
import DungeonUser from "../blablaland/games/Dungeon/DungeonUser"

class DungeonManager {

    lastDungeonId: number
    private listDungeon: Array<Dungeon>

    constructor() {
        this.lastDungeonId = 0
        this.listDungeon = new Array<Dungeon>()
    }

    getListDungeon(): Array<Dungeon> {
        return this.listDungeon
    }

    addListDungeon(dungeon: Dungeon): void {
        this.listDungeon.push(dungeon)
    }

    setLastDungeonId(): void {
        this.lastDungeonId++
    }

    getLastDungeonId(): number {
        return this.lastDungeonId
    }

    getDungeonByGameId(gameId: number): Dungeon|undefined {
        return this.getListDungeon().find((dungeon: Dungeon): boolean => dungeon.id === gameId)
    }

    getDungeonByOwner(user: User): Dungeon|undefined {
        return this.getListDungeon().find((dungeon: Dungeon): boolean => dungeon.getOwner()?.id == user.id)
    }

    getDungeonByUser(user: User): Dungeon|undefined {
        return this.getListDungeon().find((dungeon: Dungeon): boolean => {
            const userFound: DungeonUser|undefined = dungeon.getListUser().find((u: DungeonUser): boolean => u.getUser().pid == user.pid)
            return !!userFound
        })
    }
    removeDungeon(dungeon: Dungeon): void {
        this.listDungeon = this.getListDungeon().filter((d: Dungeon): boolean => d.id !== dungeon.id)
    }
}

export default DungeonManager