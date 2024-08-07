import User from "../../libs/blablaland/User"

class Canon {

    /**
     * @param user
     */
    execute(user: User): void {
        user.transform.canon()
    }
}

export default Canon