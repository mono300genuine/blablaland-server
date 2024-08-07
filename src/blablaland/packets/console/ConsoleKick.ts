import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class ConsoleKick {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.hasRight(`KICKCONSOLE`)) return
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        let text: string = packet.bitReadString()

        const userFound: User|undefined = serverManager.getListUserConsole().find(user => user.pid === userPID)
        if (!userFound || userFound && userFound.grade >= user.grade) return

        if (!text) {
            text = `Vous avez été kické(e) de la console par ${user.pseudo}.`
        }
        userFound.socketManager.close(text)
    }
}

export default ConsoleKick