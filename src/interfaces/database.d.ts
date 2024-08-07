export interface UserDatabase {
    player_id: number;
    username: string;
    pseudo: string;
    session: string;
    experience: number;
    experience_daily: number;
    experience_ban: number;
    rewarded_at: number|undefined;
    spooky_at: number|undefined;
    secret_chat: number;
    secret_tracker: number;
    clan: string;
    gender: number;
    grade_id: number;
    positionX: number;
    positionY: number;
    direction: boolean;
    shine: number|undefined;
    chat_color: string;
    skin_id: number;
    map_id: number;
    server_id: number;
    color: string;
}

export interface BadWordDatabase {
    id: number;
    query: string;
    replace: string;
    point: number;
    public: boolean;
    private: boolean;
    extra_char: boolean;
    censorship: boolean;
    censorship_all: boolean;
}

export interface ObjectDatabase {
    id: number;
    objectId: number;
    quantity: number;
}

export interface AffinityDatabase {
    sender_id: number;
    receiver_id: number;
    sender_pseudo: string;
    receiver_pseudo: string;
    accepted: boolean;
    type: string;
}

export interface MiniMonsterDatabase {
    id: number;
    player_id: number;
    power_id: number;
    name: string;
    typeX: number;
    typeY: number;
    worm: number;
    apple: number;
    ant: number;
    created_at: Date|null;
    updated_at: Date|null;
}

export interface RecipeDatabase {
    id: number;
    name: string;
    range_min: number|null;
    range_max: number|null;
    give: number|null;
    ingredient_a: number;
    ingredient_b: number;
    ingredient_c: number;
    created_at: Date|null;
    updated_at: Date|null;
}

export interface RecipeUserDatabase {
    id: number;
    recipe_id: number;
    player_id: number;
    name: string;
    range_min: number|null;
    range_max: number|null;
    give: number|null;
    ingredient_a: number;
    ingredient_b: number;
    ingredient_c: number;
    created_at: Date|null;
    updated_at: Date|null;
}

export interface BeaconDatabase {
    beacon_id: number;
    player_id: number;
    skin_id: number;
    map_id: number;
    server_id: number;
}