import User from "../../../libs/blablaland/User"

class Reaper {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        user.transform.dead()
    }
}

export default Reaper