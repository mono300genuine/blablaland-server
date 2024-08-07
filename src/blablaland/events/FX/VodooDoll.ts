import User from "../../../libs/blablaland/User"
import { ParamsFX } from "../../../interfaces/blablaland"

class VodooDoll {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `VOODOO_DOLL`)
        if (FX) {
            user.userFX.dispose(FX)
        }
    }
}

export default VodooDoll