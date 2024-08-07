import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"

class N300 {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: MapEvent): void {
        if (event.type === 0) {
            user.getCamera()?.gotoMap(445)
        }
    }
}

export default N300