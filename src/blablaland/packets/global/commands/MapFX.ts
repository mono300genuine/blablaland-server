import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import {Command, ParamsFX} from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"

class MapFX extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const map = universeManager.getMapById(user.mapId)

            map.mapFX.getListFX().map((FX: ParamsFX): void => {
                user.interface.addInfoMessage(`ID: ${FX.id}, SID: ${FX.sid}, identifier: ${FX.identifier}`)
            })
        }
    }
}

export default MapFX