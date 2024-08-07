import User from "../../../libs/blablaland/User"
import { ParamsFX } from "../../../interfaces/blablaland"

class AsianGoat {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        let FX: ParamsFX|undefined = user.hasFX(4, `CHIMERA`)
        if (!FX) {
            user.transform.chimera()
        } else {
            user.userFX.dispose(FX)
        }
    }
}

export default AsianGoat