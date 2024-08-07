import User from "../../../libs/blablaland/User"
import { FXEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import ServerManager from "../../../libs/manager/ServerManager"

class Wedding {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, event: FXEvent, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const type: number = event.packet.bitReadUnsignedInt(3)
        const isAccepted: boolean = event.packet.bitReadBoolean()

        if (type === 1 && isAccepted) {
            const userId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if (userFound)  {
                await global.db.insert({
                    sender_id: userFound.id,
                    receiver_id: user.id,
                    accepted: 1,
                    type: 'WEDDING',
                    created_at: global.db.fn.now(),
                    updated_at: global.db.fn.now()
                }).into('affinities')

                const text: string = `${userFound.pseudo} et ${user.pseudo} sont maintenant unis.`
                if (userFound.mapId != user.mapId) {
                    userFound.interface.addInfoMessage(text, { isMap: true})
                }
                user.interface.addInfoMessage(text, { isMap: true })

                user.wedding_id = userFound.id
                userFound.wedding_id = user.wedding_id

                user.inventory.reloadOrInsertObject(109)
                userFound.inventory.reloadOrInsertObject(109)
            }
        }
    }
}

export default Wedding