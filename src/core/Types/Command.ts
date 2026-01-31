import { makeId } from "../Util";

export type CommandString = {
    name: string,
    color: string
};  

export const builtInCommands: CommandString[] = [
    { name: "wait", color: "#dcdcaa" },
    { name: "sleep", color: "#dcdcaa" },
    { name: "delay", color: "#dcdcaa" },

    { name: "number", color: "#b5cea8" },
    { name: "string", color: "#ce9178" },

    { name: "task", color: "#4ec9b0" },
    { name: "pros", color: "#4ec9b0" },

    { name: "()", color: "#569cd6"}
]  

export interface Command {
    name: string,
    percent: number,
    color: string,
    id: string,
}

export function createCommand(name: string, percent = 0): Command {
    return {
        name: name,
        percent: percent,
        color: "#1566bd",
        id: makeId(10)
    }
}

export function commandsEqual(a: Command, b: Command): boolean {
    return (
        a.name === b.name &&
        a.percent === b.percent
    );
}