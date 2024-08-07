import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { ParamsFX } from "../../../interfaces/blablaland"

class ShineModerator {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (!user.hasRight('LIGHTEFFECT')) return
        const isActive: boolean = packet.bitReadBoolean()
        const color: number = packet.bitReadUnsignedInt(24)

        const userFound: User|undefined = serverManager.getUserById(user.id, {
            inConsole: false
        })
        if (!userFound) return

        let FX: ParamsFX|undefined = userFound.hasFX(1, 'SHINE')
        if (FX && !isActive) {
            userFound.userFX.dispose(FX)
        } else {
            userFound.userFX.writeChange({
                id: 1,
                data: color,
                identifier: 'SHINE',
                isPersistant: true,
                isProtected: true,
                isActive: isActive
            })
        }
    }
}

export default ShineModerator