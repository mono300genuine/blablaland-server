import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import universeManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"

class Kick {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: universeManager, serverManager: ServerManager): void {
        const userID: number = packet.bitReadUnsignedInt(24)
        const message: string = packet.bitReadString()

        let userFound: User|undefined = serverManager.getUserById(userID, { inConsole: false })
        if (userFound) userFound.socketManager.close(message)

        userFound = serverManager.getUserById(userID, { inConsole: true })
        if (userFound) userFound.socketManager.close(message)
    }
}

export default Kick