import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent } from "../../../interfaces/blablaland"

class FeatherBomb {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: FXEvent): void {
        const userId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        if (!user.hasEnemy(userId)) {
            user.transform.feather(30)
        }
    }
}

export default FeatherBomb