import User from "../../../libs/blablaland/User"
import { ParamsFX } from "../../../interfaces/blablaland"

class Elephant {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const FX: ParamsFX|undefined = user.hasFX(3, `PAINT`)
        if (FX) {
            user.userFX.dispose(FX)
        }
    }
}

export default Elephant