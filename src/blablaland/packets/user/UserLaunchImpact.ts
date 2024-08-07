import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class UserLaunchImpact {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param universeManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager): void {
        const FX_ID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_ID)
        const FX_OID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_OID)
        const positionX: number = packet.bitReadSignedInt(17)
        const positionY: number = packet.bitReadSignedInt(17)
        const speedX: number = packet.bitReadSignedInt(17)
        const speedY: number = packet.bitReadSignedInt(17)

        const map = universeManager.getMapById(user.mapId)
        if (map.isProtected()) {
            return user.interface.addInfoMessage(`Cette map est protégée contre les projectiles ^^`)
        }

        universeManager.getMapById(user.mapId).mapFX.writeChange(user,{
            id: 2,
            data: [FX_ID, FX_OID, positionX, positionY, speedX, speedY],
            isPersistant: false
        })
    }
}

export default UserLaunchImpact