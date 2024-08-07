import User from "../../libs/blablaland/User"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import { MapDefinition, ObjectDefinition}  from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import Maps from "../../json/maps.json"

class Teleporter {

    /**
     *
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const mapId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const mapFound: MapDefinition|undefined = Maps.find((m): boolean => m.id == mapId)
        const myMap: MapDefinition|undefined = Maps.find((m): boolean => m.id == user.mapId)
        const mapParadis: MapDefinition|undefined = Maps.find((m): boolean => m.paradisId == mapId)

        if(universeManager.getMapById(mapId).isSpecial() || mapParadis) {
            return
        }
        if (mapFound?.planetId != myMap?.planetId && !universeManager.getMapById(user.mapId).isHouse()) {
            return user.interface.addInfoMessage(`Impossible de se téléporter vers une autre planète !!`)
        }

        user.getCamera()?.gotoMap(mapId)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Teleporter
