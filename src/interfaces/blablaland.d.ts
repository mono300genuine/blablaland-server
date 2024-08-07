import SocketMessage from "../libs/blablaland/network/SocketMessage"
import Binary from "../libs/blablaland/network/Binary"
import User from "../libs/blablaland/User"
import { ObjectDatabase } from "./database"

export interface UniverseDefinition {
    id: number;
    name: string;
    port: number;
}

export interface BadWordDefinition {
    id: number;
    query: string;
    replace: string;
    point: number;
    public: boolean;
    private: boolean;
    extraChar: boolean;
    censorship: boolean;
    censorshipAll: boolean;
}

export interface Packet {
    type: number;
    subType: number;
}

export interface ClientBytes {
    id: number;
    position: number;
    size: number;
}

export interface FXEvent {
    FX_ID: number;
    packet: SocketMessage;
    callback?: string;
}
export interface SkinEvent {
    skinId: number;
    type: number;
    packet: SocketMessage;
    callback?: string;
}

export interface MapEvent {
    mapId: number;
    type: number;
    packet: SocketMessage;
    callback?: string;
}


export interface MapDefinition {
    id: number;
    name: string;
    positionY: number;
    positionX: number;
    respawnY: number|null;
    respawnX: number|null;
    protected: number;
    individual: number;
    giftReceiver: number;
    fileId: number,
    meteoId: number;
    transportId: number;
    regionId: number;
    planetId: number;
    paradisId: number|null;
    gradeId: number;
    createdAt: string;
    updatedAt: string;
}

export interface Friend {
    userId: number;
    pseudo: string;
    isAccepted: boolean;
    isSender: boolean;
}

export interface Enemy {
    userId: number;
    pseudo: string;
}

export interface MiniMonster {
    id: number;
    objectId: number;
    name: string;
    typeX: number;
    typeY: number;
    worm: number;
    apple: number;
    ant: number;
}

export interface ObjectDefinition {
    type: ObjectType;
    database: ObjectDatabase;
    packet: SocketMessage;
}

export interface MountDefinition {
    id: number;
    skinId: number;
    colors: Array<Array<number>>;
}

export interface HouseDefinition {
    id: number;
    name: string;
    slots: number;
    maps: number[];
    positionX: number;
    positionY: number;
}

export interface ObjectType {
    id: number;
    fxFileId: number;
    visibility: number;
    genre: number;
    expireAt: number;
    callback?: string;
}

export interface Camera {
    id: number;
    mapId: number;
}

export interface Authorized {
    user: User;
    timeout?: NodeJS.Timeout;
}

export interface ParamsFX {
    id?: number;
    sid?: number;
    isActive?: boolean;
    isPersistant?: boolean;
    isYourself?: boolean;
    isSendOther?: boolean;
    isProtected?: boolean;
    identifier?: string;
    duration?: number;
    launchedAt?: number;
    close?: number;
    isForce?:boolean; 
    isMap?: boolean;
    data?: any;
    memory?: any;
    binary?: Binary;
    timeout?: NodeJS.Timeout
}

export interface Right {
    name: string;
    gradeId: number;
}

export interface CommandArgument {
    name: string;
    description: string;
    required: boolean;
}

export interface Command {
    name: string;
    filename: string;
    description: string;
    grade: number;
    arguments?: CommandArgument[];
}