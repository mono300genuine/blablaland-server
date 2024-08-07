import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import universeManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SkinColor from "../../../libs/blablaland/SkinColor"

class Skin {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: universeManager, serverManager: ServerManager): void {
        let userId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        let skinId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SKIN_ID)
        let colors: number[] = SkinColor.readBinaryColor(packet)
        colors = colors.map(x => (x - 1))

        const userFound: User|undefined = serverManager.getUserById(userId, {
            inConsole: false
        })

        if (!userFound || userFound.skinColor == colors || universeManager.getMapById(userFound.mapId).isGame()) return
        for (let FX of userFound.userFX.getListFX()) {
            if (FX && FX.id == 4 && !FX.isProtected) {
                return userFound.interface.addInfoMessage('Impossible de changer de skin dans ces conditions !!')
            }
        }

        const listIdentifier: string[] = [`ASTRALBODY_${userId}`, `TOMB_${userId}`]
        listIdentifier.forEach((identifier: string): void => {
            const hasFX = serverManager.hasFX(5, identifier)
            if (hasFX && hasFX.item) hasFX.map.mapFX.dispose(user, hasFX.item)
        })

        userFound.skinId = skinId
        userFound.skinColor = colors
        userFound.userFX.writeChange({
            id: 4,
            identifier: `SKIN`,
            isProtected: true,
            data: {
                skinId: skinId,
                skinColor: colors
            }
        })
    }
}

export default Skin