import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { ParamsFX } from "../../../interfaces/blablaland"

class Frozen {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const FX: ParamsFX|undefined = user.hasFX(6,`FROZEN`)
        const dateServer: number = Date.now()
        let intensity: number = 1

        if (FX) {
            intensity += FX.memory
            user.userFX.dispose(FX)
        }
        if (intensity < 11) {
            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(32, intensity * 100)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 15)

            user.userFX.writeChange({
                id: 6,
                identifier: `FROZEN`,
                data: [51, 0, socketMessage],
                duration: 15,
                memory: intensity
            })
        }
    }
}

export default Frozen