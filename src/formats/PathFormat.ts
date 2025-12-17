import type { Coordinate } from "../core/Types/Coordinate";

export abstract class PathFormat {
    constructor() {};
    
    abstract startToString(position: Coordinate, heading: number): string;
    abstract driveToString(position: Coordinate, speed: number, callback: string, toPoint: boolean): string;
    abstract turnToString(position: Coordinate, speed: number, callback: string, toPoint: boolean): string;

}