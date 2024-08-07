import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent } from "../../../interfaces/blablaland"
import SkinColor from "../../../libs/blablaland/SkinColor"

class ColorVial {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: FXEvent): void {
        const colors: number[] = SkinColor.readBinaryColor(event.packet)
        event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        event.packet.bitReadUnsignedInt(8)
        user.transform.paint(colors)
    }
}

export default ColorVial