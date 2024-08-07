import User from "../../../libs/blablaland/User"
import { Packet, ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import { BeaconDatabase } from "../../../interfaces/database"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import ServerManager from "../../../libs/manager/ServerManager"
import Maps from "../../../json/maps.json"

class N300 {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager, serverManager: ServerManager): void {
        const map = universeManager.getMapById(user.mapId)

        if (event.type === 0) { // init
            const winPID: number = event.packet.bitReadUnsignedInt(16)
            this.teleportationBeacon(user, winPID, -1, event.type, universeManager).then()
        } else if (event.type === 1) { // balisePlaceClickEvt
            const winPID: number = event.packet.bitReadUnsignedInt(16)
            const beaconId: number = event.packet.bitReadUnsignedInt(3)
            this.teleportationBeacon(user, winPID, beaconId, event.type, universeManager).then()
        } else if (event.type === 2) { // BaliseTeleport
            const winPID: number = event.packet.bitReadUnsignedInt(16)
            const beaconId: number = event.packet.bitReadUnsignedInt(3)
            this.teleportationBeacon(user, winPID, beaconId, event.type, universeManager).then()
        } else if (event.type === 3) { // onHomeAction
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteSignedInt(17, user.walker.positionX / 100)
            socketMessage.bitWriteSignedInt(17, user.walker.positionY / 100)

            const FX: ParamsFX|undefined = map.hasFX(5, `PLATFORM_${user.id}_`)
            if (FX) {
                return user.interface.addInfoMessage(`Impossible de poser une nouvelle balise pour le moment !`)
            }
            map.mapFX.writeChange(user,{
                id: 5,
                identifier: `PLATFORM_${user.id}`,
                data: [20, 3, socketMessage],
                duration: 60
            })
        }
    }

    private async teleportationBeacon(user: User, winPID: number, beaconId: number, type: number, universeManager: UniverseManager): Promise<void> {
        const beacon: BeaconDatabase = await this.getTeleportationBeacon(user, beaconId)
        const map = universeManager.getMapById(user.mapId)
        const mapFound = Maps.find(m => m.id == user.mapId)

        let status: number = 0
        if (type === 1) {
            if (map.isSpecial() || mapFound?.gradeId !== 0) {
                status = 0
            } else {
                if (beacon?.map_id == user.mapId) {
                    status = 1
                } else if (await this.upsertTeleportationBeacon(user, beaconId)) {
                    status = 2
                }
            }
        } else if (type === 2) {
            if (beacon.map_id === user.mapId && beacon.server_id === user.serverId) {
                status = 1
            } else if (map.isSpecial() || mapFound?.gradeId !== 0) {
                status = 0
            } else {
                status = 2
                user.getCamera()?.gotoMap(beacon.map_id, {
                    serverId: beacon.server_id
                })
            }
        }

        const packetSender: Packet = {
            type: 1,
            subType: 13
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(16, winPID)
        socketMessage.bitWriteUnsignedInt(3, type)

        if (type === 0 || type === 1) {
            for (const beaconId of  [0, 1]) {
                const beacon: BeaconDatabase = await this.getTeleportationBeacon(user, beaconId)
                socketMessage.bitWriteSignedInt(16, beacon ? beacon.map_id : -1)
                socketMessage.bitWriteSignedInt(8, beacon ? beacon.server_id : -1)
            }
        }

        socketMessage.bitWriteUnsignedInt(3, status)
        user.socketManager.send(socketMessage)
    }

    private async getTeleportationBeacon(user: User, beaconId: number): Promise<BeaconDatabase> {
        return global.db.select('*').from('beacons')
            .where('player_id', user.id)
            .where('skin_id', user.skinId)
            .where('beacon_id', beaconId)
            .first()
    }

    private async upsertTeleportationBeacon(user: User, beaconId: number) {
        return await global.db.transaction(async (trx) => {
            const updateResult = await trx('beacons')
                .where({player_id: user.id, skin_id: user.skinId, beacon_id: beaconId})
                .update({map_id: user.mapId, server_id: user.serverId});
            return updateResult > 0
                ? updateResult
                : await trx('beacons')
                    .insert({
                        beacon_id: beaconId,
                        player_id: user.id,
                        skin_id: user.skinId,
                        map_id: user.mapId,
                        server_id: user.serverId
                    })
                    .returning('*')
        })
    }
}

export default N300