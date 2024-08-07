import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import TournamentFury from "../games/TournamentFury"
import Camera from "../../../libs/blablaland/Camera"
import { Packet } from "../../../interfaces/blablaland"
import camera from "../../../libs/blablaland/Camera";

class MainCamera {

    /**
     * 
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): void {
        const nb: number = packet.bitReadUnsignedInt(32)
        if (nb != 22144568 || user.getCamera()) {
            return user.socketManager.close()
        }
        if (user.isTouriste) {
            return user.socketManager.close(`Connecte toi ou inscrit toi pour jouer !`)
        }

        this.checkAccountsJail(user.socketManager.IP).then(r => {
            if (r.length) {
                const jailedAccounts = r.map((row: any) => row['user_id'])
                if (!jailedAccounts.includes(user.id)) {
                    const pseudos = r.map((row: any) => row.pseudo)

                    serverManager.getListUser().map((item: User): void => {
                        if (item.isAdmin() && !item.inConsole)  {
                            const message: string = `Une tentative de contournement de bannissement a été détectée sur le compte ${user.pseudo}, associé à l'adresse IP ${user.socketManager.IP}. ${pseudos.length === 1 ? 'Le compte suivant est en prison' : 'Les comptes suivants sont en prison'} : ${pseudos.join(', ')}`
                            item.interface.addInfoMessage(message)
                        }
                    })
                    user.socketManager.close(`Merci de ne pas contourner ton bannissement. Tu ne peux pas te connecter pour le moment, car tu es en prison ! Merci de remplir ta peine sur ${pseudos.length === 1 ? pseudos[0] : 'les comptes suivants : ' + pseudos.join(', ')}.`);
                }
            }

            global.db('players').where('user_id', user.id).update({ online: 1 })
                .then(r => {
                    const camera: Camera = new Camera(1, user, true, 3)
                    camera.createMainCamera()
                    serverManager.addListCamera(camera)

                    const userFound: User|undefined = serverManager.getListUser().find(item => (user.id == item.id && item.pid != user.pid && !item.isTouriste && !item.inConsole))
                    if (userFound) {
                        userFound.socketManager.close()
                    }

                    if (process.env.BRANCH && process.env.COMMIT_SHA && process.env.COMMIT_DATE) {
                        user.interface.addInfoMessage(`<span class=\"user\"><span class=\"message_modo\">[BlablaTS]</span><span> Commit ${process.env.COMMIT_SHA.substr(0, 8)} - ${new Date(process.env.COMMIT_DATE).toLocaleDateString('fr-FR')} (Branch ${process.env.BRANCH})`, {
                            isHtml: true
                        })
                    }

                    if (process.env.WELCOME_MSG) {
                        user.interface.addInfoMessage(process.env.WELCOME_MSG.replace('psd', user.pseudo), {
                            isHtml: true
                        })
                    }

                    const nbFriends: number = user.getListFriend().filter(friend => !friend.isAccepted && !friend.isSender).length
                    if (nbFriends) {
                        user.interface.addInfoMessage(`Tu as ${nbFriends} demande(s) d'ajout d'amis en attente !`)
                    }

                    if (universeManager.getServerId() === 2) {
                        TournamentFury.sendPlayerInfo(user, {
                            isStarted: false
                        })
                        setTimeout((): void => {
                            TournamentFury.sendPlayerInfo(user, {
                                isStarted: true,
                                selectedGun: 6
                            })
                        }, 1000 * 10)
                    }

                    serverManager.addListUser(user)
                    user.clearIntervalDodo(true)

                    user.socketManager.send(serverManager.getUsersCount(user.serverId))

                    setInterval((): void => {
                        user.socketManager.send(serverManager.getUsersCount(user.serverId))
                    }, 5000)

                    const packetSender: Packet = {
                        type: 1,
                        subType: 18
                    }
                    const socketMessage: SocketMessage = new SocketMessage(packetSender)
                    socketMessage.bitWriteUnsignedInt(32, user.clientBytes.id)
                    socketMessage.bitWriteUnsignedInt(32, user.clientBytes.position)
                    socketMessage.bitWriteUnsignedInt(32, user.clientBytes.size)
                    user.socketManager.send(socketMessage)
                })
                .catch(r => console.log(`Err MainCamera online: ${r}`))
        }).catch((error): void => {
            console.error("An error occurred while checking jailed accounts:", error)
        })
    }

    private checkAccountsJail(userIP: string): Promise<any> {
        return new Promise((resolve, reject): void => {
            global.db.select('logins.user_id', 'players.pseudo')
                .from('logins')
                .innerJoin('players', function(): void {
                    this.on('logins.user_id', '=', 'players.user_id')
                        .andOn('players.experience_ban', '>', 'players.experience')
                })
                .where('logins.ip_address', userIP)
                .distinct('logins.user_id')
                .then((rows) =>resolve(rows))
                .catch((error) => reject(error))
        })
    }
}

export default MainCamera