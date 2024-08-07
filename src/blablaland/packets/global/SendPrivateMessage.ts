import ServerManager from "../../../libs/manager/ServerManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import UniverseManager from "../../../libs/manager/UniverseManager"
import { BadWordDefinition } from "../../../interfaces/blablaland"
import BadWord from "../../../libs/blablaland/tracker/BadWord"

class SendPrivateMessage {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        if (user.isTouriste || !user.getCamera()?.mapReady) return
        const pseudo: string = packet.bitReadString()
        let text: string = packet.bitReadString()
        user.interface.onFlood()

        const userFound: User|undefined = serverManager.getUserByPseudo(pseudo, { inConsole: false })
        if (userFound) {
            if (user.experience < 5) {
                return user.interface.addInfoMessage(`Pour des raisons de sécurité, vous aurez besoin de ${5 - user.experience} XP supplémentaires pour envoyer des messages !`)
            } else if (user.mapId === 10) {
                return user.interface.addInfoMessage(`Impossible d'envoyer un message privé dans ces conditions !!`)
            }
            
            const badWordFound: BadWordDefinition | undefined = serverManager.getListBadWord().find((badword: BadWordDefinition) => {
                const query: string = badword.query.toLowerCase()
                let isFound: boolean = text.toLowerCase().includes(query)

                if (!isFound && badword.extraChar) {
                    const normalizedQuery: string = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    isFound = text.toLowerCase().includes(normalizedQuery)
                }
                return isFound && badword.private
            })

            if (badWordFound) {
                const isFriend: boolean = user.getListFriend().some(friend => friend.userId === userFound.id && friend.isAccepted)
                const badWord: BadWord = new BadWord(user, badWordFound, text, userFound.pseudo, isFriend)
                text = badWord.replace()
                if (!badWordFound.censorship || !badWordFound.censorshipAll) {
                    const map = universeManager.getMapById(user.mapId)
                    const socketMessage: SocketMessage = badWord.alert(map.isHouse(), map.getPercentageOfFriends(user))
                    for (let item of serverManager.getListUserConsole()) {
                        item.socketManager.send(socketMessage)
                    }
                }
            }

            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    let userTracker = item.tracker.getInstanceByUser(instance, user)
                    if (userTracker) {
                        item.tracker.sendPrivateMessage(instance, userTracker, text, {
                            isReceived: false,
                            pseudo: userFound.pseudo
                        })
                    }
                }
            }
            for (let item of serverManager.getListUserConsole()) {
                for (let instance of item.tracker.getListInstance()) {
                    let userTracker = item.tracker.getInstanceByUser(instance, userFound)
                    if (userTracker) {
                        item.tracker.sendPrivateMessage(instance, userTracker, text, {
                            isReceived: true,
                            pseudo: user.pseudo
                        })
                    }
                }
            }
        }

        if (userFound) {
            return userFound.interface.addUserMessage(text, {
                userPseudo: user.pseudo,
                userId: user.id,
                userPID: user.pid
            })
        }
        user.interface.addInfoMessage(`"${pseudo}" n'est pas connecté.`)
    }
}

export default SendPrivateMessage