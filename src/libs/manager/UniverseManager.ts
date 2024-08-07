import Map from "../blablaland/Map"
import HouseManager from "./HouseManager"
import DungeonManager from "./DungeonManager"

class UniverseManager {

    private readonly listMap: Array<Map>
    private readonly houseManager: HouseManager
    private readonly dungeonManager: DungeonManager
    private readonly serverId: number
    private lastPrivateMapId: number = 0

    constructor(serverId: number) {
        this.listMap = new Array<Map>()
        this.houseManager = new HouseManager(this)
        this.dungeonManager = new DungeonManager()
        this.serverId = serverId
    }
    
    /**
     * @returns Array
     */
    getListMap(): Array<Map> {
        return this.listMap
    }

    /**
     *
     * @param id
     * @param fileId
     * @param isPrivate
     */
    getMapById(id: number, fileId?: number, isPrivate?: boolean): Map {
        let map = undefined
        id = isPrivate ? id + 1000 : id
        for (let item of this.getListMap()) {
            if (item.id === id) return item
        }
        map = new Map(id, fileId)
        this.listMap.push(map)
        if (isPrivate) {
            this.lastPrivateMapId++
        }
        return map
    }

    getLastPrivateMapId(): number {
        return this.lastPrivateMapId
    }

    /**
     * @returns number
     */
    getServerId(): number {
        return this.serverId
    }

    getHouseManager(): HouseManager {
        return this.houseManager
    }

    getDungeonManager(): DungeonManager {
        return this.dungeonManager
    }
}

export default UniverseManager