import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import { ObjectDatabase } from "../../../interfaces/database"
import House from "../../../libs/blablaland/House"

class CreateHouse {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const objectId: number = packet.bitReadUnsignedInt(32)
        const houseFound: House|undefined = universeManager.getHouseManager().getHouseByUser(user)

        const map = universeManager.getMapById(user.mapId)
        const object: ObjectDatabase|undefined = user.inventory.getObjectById(objectId)
        if ((object || objectId == 1) && !houseFound && (!map.isSpecial() || map.id === 60) && user.getCamera()?.mapReady) {
            const houseId: number = universeManager.getHouseManager().getLastHouseId()
            const house: House = new House(houseId, objectId === 1 ? 1 : object?.objectId!, user, universeManager)
            universeManager.getHouseManager().addListHouse(house)
            house.create()
        } else {
            return user.interface.addInfoMessage(`Impossible d'utiliser ses pouvoirs dans ces conditions !!`)
        }
    }
}

export default CreateHouse