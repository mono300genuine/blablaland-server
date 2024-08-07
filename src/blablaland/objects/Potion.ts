import User from "../../libs/blablaland/User"
import { ObjectDefinition } from "../../interfaces/blablaland"

class Potion {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        if (!user.hasFX(6, `POTION_${item.type.id}`)) {
            user.transform.potion(item.type.id)
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }
}

export default Potion