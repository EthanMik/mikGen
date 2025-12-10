import { makeId } from "./Util";

export interface Command {
    name: string,
    percent: number,
    id: string,
}

export function createCommand(name: string, percent = 0): Command {
    return {
        name: name,
        percent: percent,
        id: makeId(10)
    }
}