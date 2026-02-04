import { makeId } from "../Util";
import type { Format } from "../../hooks/appStateDefaults";

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

    { name: "()", color: "#569cd6" },

    { name: "sec", color: "#9cdcfe" },
    { name: "msec", color: "#9cdcfe" },

    
]

export const DEFAULT_COMMANDS: Record<Format, Command[]> = {
    mikLib: [
        createCommand("wait(number, msec)"),
        createCommand("wait(number, sec)"),
        createCommand("task::sleep(number)")
    ],
    ReveilLib: [
        createCommand("pros::delay(number)")
    ],
    "JAR-Template": [

    ],
    LemLib: [

    ],
    "RW-Template": [

    ]
}

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