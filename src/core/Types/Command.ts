import { makeId } from "../Util";

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

export function commandsEqual(a: Command, b: Command): boolean {
  return (
    a.name === b.name &&
    a.percent === b.percent
  );
}