import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import TrackerInstance from "../../../libs/blablaland/tracker/TrackerInstance"
import TrackerUser from "../../../libs/blablaland/tracker/TrackerUser"

class CreateTracker {

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const IPAddress: number = packet.bitReadUnsignedInt(32)
        const userID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const userPID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_PID)
        const isSendMap: boolean = packet.bitReadBoolean()
        const isSendMsg: boolean = packet.bitReadBoolean()
        let userFound: User|undefined

        let instanceFound: TrackerInstance|undefined = user.tracker.listInstance.find(instance => instance.id === userID && instance.pid === userPID && instance.IP === IPAddress)
        let trackerInstance: TrackerInstance

        if (user.inConsole) {
            if (!instanceFound) {
                const newInstanceTracker: TrackerInstance = new TrackerInstance(userID, userPID, IPAddress)
                user.tracker.listInstance.push(newInstanceTracker)
                trackerInstance = newInstanceTracker
            } else {
                trackerInstance = instanceFound
            }

            trackerInstance.isMapInformed = isSendMap
            trackerInstance.isMessageInformed = isSendMsg

            if (userID) { // User connected and ID
                const userByIdFound: User|undefined = serverManager.getUserById(userID, {
                    inConsole: false
                })
                if (userByIdFound) {
                    userFound = userByIdFound
                    trackerInstance = user.tracker.addTrackerInstance(userFound, trackerInstance).trackerInstance
                }
            } else if (userPID) { // User connected and PID
                const userByPidFound: User|undefined = serverManager.getUserByPid(userPID)
                if (userByPidFound) {
                    userFound = userByPidFound
                    trackerInstance = user.tracker.addTrackerInstance(userFound, trackerInstance).trackerInstance
                }
            }
            for (let item of serverManager.getListUser()) {
                if (!item.inConsole) {
                    if (item.IP === IPAddress) {
                        trackerInstance = user.tracker.addTrackerInstance(item, trackerInstance).trackerInstance
                    }
                }
            }
        } else {
            if (!instanceFound) {
                const newInstanceTracker: TrackerInstance = new TrackerInstance(userID, userPID, IPAddress)
                user.tracker.listInstance.push(newInstanceTracker)
                trackerInstance = newInstanceTracker
            } else {
                trackerInstance = instanceFound
            }
            trackerInstance.isMapInformed = isSendMap
            const userByIdFound: User|undefined = serverManager.getUserById(userID, {
                inConsole: false
            })
            if (userByIdFound) {
                trackerInstance = user.tracker.addTrackerInstance(userByIdFound, trackerInstance).trackerInstance
            }
        }

        user.tracker.send(trackerInstance)

        if (userFound && user.inConsole) {
            const spyModerator: Array<string> = new Array<string>()

            for (let item of serverManager.getListUserConsole()) {
                if (item.pseudo != user.pseudo) {
                    for (let instance of item.tracker.getListInstance()) {
                        const userTracker: TrackerUser|undefined = item.tracker.getInstanceByUser(instance, userFound)
                        if (userTracker) {
                            if (item.grade >= user.secretTracker) {
                                item.tracker.sendMessage(instance, userTracker, `${user.pseudo} est maintenant en poursuite`, { isModerator: true })
                            }
                            if (!spyModerator.find(psd => psd === item.pseudo) && user.grade >= item.secretTracker) spyModerator.push(item.pseudo)
                        }
                    }
                }
            }
            if (spyModerator.length) {
                const userTracker: TrackerUser|undefined = user.tracker.getInstanceByUser(trackerInstance, userFound)
                if (userTracker) user.tracker.sendMessage(trackerInstance, userTracker, `En poursuite : ${spyModerator}`, { isModerator: true })
            }
        }
    }
}

export default CreateTracker