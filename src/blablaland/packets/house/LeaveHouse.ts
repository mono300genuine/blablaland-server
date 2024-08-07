import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import House from "../../../libs/blablaland/House"


class LeaveHouse {

    /**
     * @param user
     * @param packet
     * @param universeManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const house : House|undefined = universeManager.getHouseManager().getHouseById(user.mapId)
        if (house) {
            house.leave(user, 1, { isTeleport: true })
        }
    }
}

export default LeaveHouse