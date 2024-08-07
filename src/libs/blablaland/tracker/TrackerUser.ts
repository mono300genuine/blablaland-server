import User from "../User"

class TrackerUser {

    id: number = 0
    pid: number = 0
    username: string = ""
    pseudo: string = ""
    IP: number = 0
    grade: number = 0
    skinId: number = 0
    gender: number = 0
    mapId: number = 0
    serverId: number = 0
    skinColor: Array<number> = new Array<number>()

    constructor(user: User) {
        this.update(user)
    }

    /**
     * @param user
     */
    update(user: User): void {
        this.id = user.id
        this.pid = user.pid
        this.username = user.username
        this.pseudo = user.pseudo
        this.IP = user.IP
        this.grade = user.grade
        this.skinId = user.skinId
        this.gender = user.gender
        this.mapId = user.mapId
        this.serverId = user.serverId
        this.skinColor = user.skinColor
    }
}

export default TrackerUser