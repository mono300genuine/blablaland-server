import Camera from "../../../libs/blablaland/Camera"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import Map from "../../../libs/blablaland/Map"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import User from "../../../libs/blablaland/User"
import ServerManager from "../../../libs/manager/ServerManager"
import { Packet, ParamsFX } from "../../../interfaces/blablaland"
import Dungeon from "../../../libs/blablaland/games/Dungeon/Dungeon"
import House from "../../../libs/blablaland/House"
import TrackerUser from "../../../libs/blablaland/tracker/TrackerUser"
import StatGame, { Game } from "../../../libs/blablaland/games/StatGame"

class MapReady {

    /**
     *
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const cameraId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CAMERA_ID)
        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const cameraFound: Camera|undefined = user.getCamera(cameraId)

        if (cameraFound !== undefined) {
            const map: Map|undefined = serverManager.getUniverseById(cameraFound.serverId)?.universeManager.getMapById(mapId)
            if(map) {
                cameraFound.currMap = mapId
                user.mapId = mapId

                cameraFound.mapReady = false
                cameraFound.onMapReady(map)

                if (!user.inConsole) {
                    if (map.isGame() || map.isHouse() || map.isParadis() || mapId === 10) {
                        const house: House|undefined = serverManager.getUniverseById(user.serverId)?.universeManager.getHouseManager().getHouseByUser(user)
                        if (house && house.isDrive) {
                            house.drive(user, false, {
                                isTeleport: false,
                                mapId: cameraFound.prevMap && !universeManager.getMapById(cameraFound.prevMap).isSpecial() ? cameraFound.prevMap : mapId
                            })
                        }
                    }

                    if (map.isManor() || map.id === 490) {
                        const packetSender: Packet = {
                            type: 1,
                            subType: 16
                        }
                        const socketMessage: SocketMessage = new SocketMessage(packetSender)
                        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, 4)
                        socketMessage.bitWriteUnsignedInt(4, 1)
                        for (let i=0; i < 5;i++) {
                            socketMessage.bitWriteBoolean(true)
                            socketMessage.bitWriteUnsignedInt(16, i)
                        }
                        socketMessage.bitWriteBoolean(false)
                        socketMessage.bitWriteUnsignedInt(16, 25)
                        user.socketManager.send(socketMessage)
                    }

                    if (cameraFound.prevMap) {
                        const prevMap: Map|undefined = serverManager.getUniverseById(user.serverId)?.universeManager.getMapById(cameraFound.prevMap)
                        if (prevMap && prevMap.isHouse() && !map.isHouse()) {
                            const house: House|undefined = serverManager.getUniverseById(user.serverId)?.universeManager.getHouseManager().getHouseByUser(user)
                            if (house && !house.isDrive && typeof house.timeoutClose === "undefined") {
                                house.leave(user, 0, {
                                    isTeleport: false
                                })
                            }
                        }
                        if (prevMap?.isDungeon() && !map.isDungeon()) {
                            const dungeon: Dungeon|undefined = universeManager.getDungeonManager().getDungeonByUser(user)
                            if (dungeon) {
                                user.transform.clearAll(user.transform.clearBlibli([304]))
                                if (dungeon.getListUser().length === 1) {
                                    universeManager.getDungeonManager().removeDungeon(dungeon)
                                } else {
                                    dungeon.onInteractivEvent(user)
                                    dungeon.removeListUser(user)
                                }
                            }
                        }
                        if (prevMap && prevMap.id == 490 && map.isManor()) {
                            if (!user.hasFX(4, `CHAR`)) {
                                user.transform.char()
                            }
                        } else if (prevMap?.isManor() && !map.isManor()) {
                            const FX: ParamsFX|undefined = user.hasFX(4, `CHAR`)
                            const isWin: boolean = map.id == 129
                            const token: number = FX ? isWin ? FX.memory[1] + 25 : 0 : 0

                            if (FX) user.transform.char()

                            if (map.id == 129) {
                                const packetSender: Packet = {
                                    type: 1,
                                    subType: 16
                                }
                                const socketMessage: SocketMessage = new SocketMessage(packetSender)
                                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, 4)
                                socketMessage.bitWriteUnsignedInt(4, 2)
                                socketMessage.bitWriteUnsignedInt(10, token)
                                user.socketManager.send(socketMessage)
                            }

                            await StatGame.upsertPlayerStats(Game.HAUNTED_MANOR, user.id, isWin ? token : -3, isWin ? 1 : 0, isWin ? 0 : 1, token)
                        } else if (prevMap?.isPyramid() && !map.isPyramid()) {
                            if (user.hasFX(4, `PHARAOH`)) {
                                user.transform.pharaoh()

                                await StatGame.upsertPlayerStats(Game.PYRAMID, user.id, -3, 0, 1, 0)
                            }
                        }
                        const FX: ParamsFX|undefined = user.hasFX(4, `72`)
                        if (FX) {
                            const house: House|undefined = serverManager.getUniverseById(user.serverId)?.universeManager.getHouseManager().getHouseByUser(user)
                            if (house && house.isDrive) {
                                house.active(user, { isActive: false, isDispose: true })
                                house.active(user, { isActive: true, mapId: mapId })
                            }
                        }
                    }

                    if (!map.isParadis()) {
                        const FX: ParamsFX|undefined = user.hasFX(6, '1')
                        if (FX) user.userFX.dispose(FX)
                    }

                    for (let item of serverManager.getListUserConsole()) {
                        for (let instance of item.tracker.getListInstance()) {
                            if (instance.id == user.id && !user.inConsole) {
                                const userTracker = item.tracker.addTrackerInstance(user, instance).userTracker
                                if (userTracker) {
                                    item.tracker.refresh(instance, userTracker)
                                }
                            }
                        }
                    }

                   for (let friend of user.getListFriend()) {
                       if (friend.isAccepted) {
                           const userFound: User | undefined = serverManager.getUserById(friend.userId, {
                               inConsole: false
                           })
                           if (userFound) {
                               for (let instance of userFound.tracker.getListInstance()) {
                                   if (instance.id === user.id) {
                                       const userTracker: TrackerUser = userFound.tracker.addTrackerInstance(user, instance).userTracker
                                       userFound.tracker.refresh(instance, userTracker)
                                   }
                               }
                           }
                       }
                   }
               }
            }
        }
    }
}

export default MapReady 