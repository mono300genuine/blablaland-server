import House from "../blablaland/House"
import UniverseManager from "./UniverseManager"
import User from "../blablaland/User"

class HouseManager {

    private listHouse: Array<House>
    lastHouseId: number

    constructor(universeManager: UniverseManager) {
        this.listHouse = new Array<House>()
        this.lastHouseId = 0
    }

    /**
     * setLastHouseId
     */
    setLastHouseId(): void {
        this.lastHouseId++
    }

    getLastHouseId(): number {
        return this.lastHouseId
    }

    getListHouse(): House[] {
        return this.listHouse
    }

    /**
     * @param houseId
     */
    getHouseById(houseId: number): House|undefined {
        return this.getListHouse().find((house: House) => house.maps.includes(houseId))
    }

    /**
     * @param user
     */
    getHouseByUser(user: User): House|undefined {
        return this.getListHouse().find((house: House) => house.user.id === user.id && !user.inConsole || house.user.pid === user.pid)
    }

    addListHouse(house: House): void {
        this.listHouse.push(house)
    }

    /**
     * @param houseId
     */
    removeHouseById(houseId: number): void {
        this.listHouse = this.getListHouse().filter((house: House) => !(house.id === houseId))

    }
}

export default HouseManager