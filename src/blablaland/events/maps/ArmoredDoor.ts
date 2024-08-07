import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import Camera from "../../../libs/blablaland/Camera"

class ArmoredDoor {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: MapEvent): void {
        let code: string = ''
        for (let i = 0; i < 4; i++) {
            code += event.packet.bitReadUnsignedInt(4)
        }

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(3, 0)
        socketMessage.bitWriteBoolean(code === '7641')

        user.userFX.writeChange({
            id: 8,
            data: socketMessage,
            isMap: false,
            isPersistant: false
        })

        if (code === '7641') {
            let cameraFound: Camera|undefined = user.getCamera()
            if (cameraFound) {
                cameraFound.gotoMap(354, {
                    method: 1,
                    positionX: 66050,
                    positionY: 33950
                })
            }
        }
    }
}

export default ArmoredDoor