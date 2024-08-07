import User from "../../../libs/blablaland/User"

class Caterpillar {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        user.transform.butterfly()
    }
}

export default Caterpillar