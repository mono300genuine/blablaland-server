import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import Variables from "../../../libs/blablaland/maps/Variables"
import UniverseManager from "../../../libs/manager/UniverseManager"

class GetVariables {

    /**
     * Sending variables (maps...)
     * @param user
     * @param packet
     * @param universeManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const variable: Variables = new Variables(universeManager.getServerId())
        user.socketManager.send(variable.getListVariables())
    }
}

export default GetVariables