import TrackerUser from "./TrackerUser"

class TrackerInstance {

    id: number
    pid: number
    IP: number

    isMapInformed: boolean = false
    isMessageInformed: boolean = false

    listUser: Array<TrackerUser>

    /**
     * @param id
     * @param pid
     * @param IP
     */
    constructor(id: number, pid: number, IP: number) {
        this.id = id
        this.pid = pid
        this.IP = IP
        this.listUser = new Array<TrackerUser>()
    }

    /**
     * @param user
     */
    addListUser(user: TrackerUser): void {
        this.listUser.push(user)
    }

    getListUser(): Array<TrackerUser> {
        return this.listUser
    }
}

export default TrackerInstance