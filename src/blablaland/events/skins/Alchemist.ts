import User from "../../../libs/blablaland/User"
import {Packet, SkinEvent} from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { RecipeDatabase, RecipeUserDatabase } from "../../../interfaces/database"
import UserDie from "../../packets/global/UserDie"

class Alchemist {

    recipes: RecipeDatabase[]|undefined
    userRecipes: RecipeUserDatabase[]|undefined

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    async execute(user: User, event: SkinEvent, universeManager: UniverseManager): Promise<void> {
        const winPID: number = event.packet.bitReadUnsignedInt(16)

        this.recipes = await db.select('*').from('recipes')
        this.userRecipes = await db.select('*')
            .from('player_recipe')
            .join('recipes', 'player_recipe.recipe_id', 'recipes.id')
            .where('player_id', user.id)

            let packetSender: Packet = {
                type: 1,
                subType: 13
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(16, winPID)
            socketMessage.bitWriteUnsignedInt(3, event.type)

            if (event.type === 0) {
                await this.onSendPotion(socketMessage, user, event, universeManager)
            } else if (event.type === 1) {
                this.onServerQueryRecipes(socketMessage, user)
            }
    }

    private async onSendPotion(socketMessage: SocketMessage, user: User, event: SkinEvent, universeManager: UniverseManager) {
        const ingredientA: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const ingredientB: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const ingredientC: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        if (!ingredientA || !ingredientB || !ingredientC || !this.recipes || !this.userRecipes) return

        user.inventory.reloadOrInsertObject(ingredientA, {isSubtraction: true})
        user.inventory.reloadOrInsertObject(ingredientB, {isSubtraction: true})
        user.inventory.reloadOrInsertObject(ingredientC, {isSubtraction: true})

        const recipe: RecipeDatabase|null = this.findMatchingRecipe(this.recipes, ingredientA, ingredientB, ingredientC)
        if (recipe) {
            const isNewRecipe: boolean = !this.userRecipes.some((r: RecipeUserDatabase): boolean => r.recipe_id === recipe?.id)
            if (isNewRecipe) {
                await global.db.insert({
                    player_id: user.id,
                    recipe_id: recipe.id,
                    created_at: global.db.fn.now(),
                    updated_at: global.db.fn.now()}
                ).into('player_recipe')
            }

            if (recipe.give === 0) return
            if (recipe.give === 2) {
                recipe.give = ingredientA
            }
            if (!recipe.give) {
                const errorMessage: string = `s'est fait exploser en jouant avec ses potions`
                return new UserDie().execute(user, this.createErrorMessage(errorMessage), universeManager)
            }

            if (Math.random() <= 0.3) {
                const errorMessage: string = `a mal étiqueté ses potions, ça lui a pété à la figure !`
                return new UserDie().execute(user, this.createErrorMessage(errorMessage), universeManager)
            }

            let nbRecipe: number = 0
            if (recipe.range_min && recipe.range_max) {
                nbRecipe = Math.floor(Math.random() * (recipe.range_max - recipe.range_min + 1)) + recipe.range_min
            }

            const successMessage: string = `Tu as réussi à créer ${nbRecipe} exemplaires de\n"${recipe.name}" !`
            socketMessage.bitWriteString(successMessage)
            socketMessage.bitWriteBoolean(isNewRecipe)

            user.socketManager.send(socketMessage)
            user.interface.addInfoMessage(successMessage)

            user.inventory.reloadOrInsertObject(recipe.give, {isSubtraction: false}, nbRecipe)
        }

    }

    private onServerQueryRecipes(socketMessage: SocketMessage, user: User): void {
        if (this.recipes && this.userRecipes) {
            for (let recipe of this.userRecipes) {
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(8, recipe.recipe_id) // id
                socketMessage.bitWriteUnsignedInt(8, recipe.recipe_id - 1) // order
                socketMessage.bitWriteSignedInt(GlobalProperties.BIT_FX_SID, recipe.ingredient_a) // ingredient
                socketMessage.bitWriteSignedInt(GlobalProperties.BIT_FX_SID, recipe.ingredient_b) // ingredient
                socketMessage.bitWriteSignedInt(GlobalProperties.BIT_FX_SID, recipe.ingredient_c) // ingredient
                socketMessage.bitWriteString(recipe.name) // name
                if (recipe.give || recipe.give === 0) {
                    socketMessage.bitWriteUnsignedInt(4, 2)
                    socketMessage.bitWriteUnsignedInt(5, recipe.range_min ?? 0)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, recipe.give)
                } else {
                    socketMessage.bitWriteUnsignedInt(4, 5)
                    socketMessage.bitWriteString(recipe.name)
                }
                if (recipe.range_min != recipe.range_max) {
                    socketMessage.bitWriteUnsignedInt(4, 4)
                    socketMessage.bitWriteUnsignedInt(5, recipe.range_min ?? 0)
                    socketMessage.bitWriteUnsignedInt(5, recipe.range_max ?? 0)
                }
                socketMessage.bitWriteUnsignedInt(4, 0)
            }
            socketMessage.bitWriteBoolean(false)
            socketMessage.bitWriteUnsignedInt(6, this.recipes.length)
            user.socketManager.send(socketMessage)
        }
    }

    private findMatchingRecipe(recipes: RecipeDatabase[], ingredientA: number, ingredientB: number, ingredientC: number): RecipeDatabase|null {
        for (const recipe of recipes) {
            const matchA: boolean = this.checkIngredientMatch(recipe.ingredient_a, ingredientA)
            const matchB: boolean = this.checkIngredientMatch(recipe.ingredient_b, ingredientB)
            const matchC: boolean = this.checkIngredientMatch(recipe.ingredient_c, ingredientC)

            const hasWildcard: boolean = [recipe.ingredient_c, recipe.ingredient_b, recipe.ingredient_a].includes(-2)
            const ingredientsMatch: boolean = matchA && matchB && matchC

            if (ingredientsMatch && (hasWildcard ? ingredientA === ingredientB : true)) {
                return recipe
            }
        }
        return null
    }

    private checkIngredientMatch(recipeIngredient: number, inputIngredient: number): boolean {
        return recipeIngredient === -1 || (recipeIngredient === -2 ? inputIngredient !== -1 && inputIngredient !== -2 : recipeIngredient === inputIngredient)
    }

    private createErrorMessage(message: string) {
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteString(message)
        socketMessage.bitWriteUnsignedInt(8, 8)
        return socketMessage
    }
}

export default Alchemist