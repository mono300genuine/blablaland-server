import User from "../../libs/blablaland/User"
import {MountDefinition, ObjectDefinition, ParamsFX} from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SkinColor from "../../libs/blablaland/SkinColor"
import Mounts from "../../json/mounts.json"

class Mount {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const FX: ParamsFX|undefined = user.hasFX(4, '16')
        const astralBody: ParamsFX|undefined = user.hasFX(6, `ASTRALBODY`)
        const drive: ParamsFX|undefined = user.hasFX(4, `72`)

        if (type === 0 && !astralBody && !drive) {
            const color: number = item.packet.bitReadUnsignedInt(5)
            const mount: MountDefinition|undefined = Mounts.find(mount => mount.id === item.type.id)
            if (!mount) return

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, user.skinId)
            SkinColor.exportBinaryColor(socketMessage, user.skinColor)

            if (!FX) {
                const params: ParamsFX = {
                    id: 4,
                    sid: 16,
                    data: {
                        skinId: mount.skinId,
                        skinColor: mount.colors[color],
                        binary: socketMessage
                    },
                    memory: [mount.id],
                    isYourself: true
                }
                user.userFX.writeChange(params)
            } else {
                user.userFX.dispose(FX)
                if (mount.id !== FX.memory[0]) {
                    item.packet.bitPosition = 0
                    this.execute(user, item)
                }
            }
        } else if (type == 2 && FX) {
            user.userFX.dispose(FX)
        }
    }
}

export default Mount