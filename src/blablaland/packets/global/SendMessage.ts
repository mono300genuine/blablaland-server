import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import BadWord from "../../../libs/blablaland/tracker/BadWord"
import { BadWordDefinition, Command } from "../../../interfaces/blablaland"
import TrackerUser from "../../../libs/blablaland/tracker/TrackerUser"
import Commands from '../../../json/commands.json'
import House from "../../../libs/blablaland/House"
import FileLoader from "../../../libs/FileLoader"

class SendMessage {
    private isSendMessage: boolean = true

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
   async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (user.isTouriste || !user.getCamera()?.mapReady) return
        let text: string = packet.bitReadString()
        const action: number = packet.bitReadUnsignedInt(3)
        const map = universeManager.getMapById(user.mapId)
        if (text.trim().length === 0) return

        if (text.startsWith('!')) {
            await this.executeCommand(text, user, universeManager, serverManager)
        }

        if (this.isSendMessage) {
            if (user.experience < 5) {
                return user.interface.addInfoMessage(`Pour des raisons de sécurité, vous aurez besoin de ${5 - user.experience} XP supplémentaires pour envoyer des messages !`)
            } else if (!map.isMessageAllowed && (!user.isModerator() && !map.bypassAllowed.includes(user.id))) {
                return user.interface.addInfoMessage(`L'envoi de messages est temporairement désactivés sur cette map :p`)
            }

            user.interface.onFlood()

            if (!map.isHouse()) {
                const badWordFound: BadWordDefinition | undefined = serverManager.getListBadWord().find((badword: BadWordDefinition) => {
                    const query: string = badword.query.toLowerCase()
                    let isFound: boolean = text.toLowerCase().includes(query)

                    if (!isFound && badword.extraChar) {
                        const normalizedQuery: string = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        isFound = text.toLowerCase().includes(normalizedQuery)
                    }
                    return isFound && badword.public
                })

                if (badWordFound) {
                    const badWord: BadWord = new BadWord(user, badWordFound, text)
                    const socketMessage: SocketMessage = badWord.alert(map.isHouse(), map.getPercentageOfFriends(user))
                    text = badWord.replace()
                    if (!badWordFound.censorship || !badWordFound.censorshipAll) {
                        for (let item of serverManager.getListUserConsole()) {
                            item.socketManager.send(socketMessage)
                        }
                    }
                }
            }

            if (map.isHouse()) {
                const house: House|undefined = universeManager.getHouseManager().getHouseById(user.mapId)
                if (house) {
                    house.intercom(user, text)
                }
            }

            user.interface.addLocalMessage(text, {
                action: action,
                isMap: true
            })

            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    const userTracker: TrackerUser|undefined = item.tracker.getInstanceByUser(instance, user)
                    if (userTracker) item.tracker.sendMessage(instance, userTracker, text)
                }
            }
            user.clearIntervalDodo(true)
        }
    }

    async executeCommand(text: string, user: User, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const params: string[] = text.slice(1).split(' ')
        const command: Command|undefined = Commands.find((command: Command): boolean => command.name.toLowerCase() === params[0].toLowerCase())
        if (command && user.grade >= command.grade) {
            this.isSendMessage = false
            const fileLoader: FileLoader<Command> = new FileLoader<Command>(__dirname + '/commands')
            await fileLoader.loadAndExecute(`${command.filename}.js`, user, command, params, universeManager, serverManager)
        }
    }
}

export default SendMessage