import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"

class SerpentDragon {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        if (event.type === 0) {
            const FX: ParamsFX|undefined = user.hasFX(3, `PAINT`)
            if (FX) {
                user.userFX.dispose(FX)
            }
        }
    }
}

export default SerpentDragon