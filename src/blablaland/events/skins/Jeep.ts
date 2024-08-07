import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class Jeep {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        if (event.type === 1) {
            const positionXFrom: number = event.packet.bitReadSignedInt(17)
            const positionYFrom: number = event.packet.bitReadSignedInt(17)
            const positionXTo: number = event.packet.bitReadSignedInt(17)
            const positionYTo: number = event.packet.bitReadSignedInt(17)

            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteSignedInt(17, positionXTo)
            socketMessage.bitWriteSignedInt(17, positionYTo)

            const params: ParamsFX = {
                id: 5,
                sid: 3,
                data: [2963147952, false, socketMessage],
                isPersistant: false,
            }
            user.userFX.writeChange(params)
        }
    }
}

export default Jeep