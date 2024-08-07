import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"

class ValentineToyz {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        if (event.type === 0) {
            const positionX: number = event.packet.bitReadSignedInt(17)
            const positionY: number = event.packet.bitReadSignedInt(17)
        }
    }
}

export default ValentineToyz