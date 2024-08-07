import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"

class Kitsune {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        if (event.skinId == 618) {
            user.transform.kitsune(event.type)
        } else {
            const FX: ParamsFX|undefined = user.hasFX(4, `KITSUNE`)
            if (FX) {
                user.userFX.dispose(FX)
            }
        }
    }
}

export default Kitsune