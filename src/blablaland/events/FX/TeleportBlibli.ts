import User from "../../../libs/blablaland/User"
import { FXEvent } from "../../../interfaces/blablaland"

class TeleportBlibli {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: FXEvent): void {
        const teleportTo: number|undefined = {
            11: 193,
            13: 193,
            28: 486,
            31: 501,
            38: 30
        }[event.FX_ID]

        if (teleportTo && user.mapId !== teleportTo) {
            user.getCamera()?.gotoMap(teleportTo)
        } else {
            user.interface.addInfoMessage(`Impossible de vous téléporter, vous êtes actuellement sur la map !`)
        }
    }
}

export default TeleportBlibli