import type { Coordinate } from "../core/Path";
import { PathFormat } from "../formats/PathFormat";

export class mikLibFormat extends PathFormat {

  startToString(position: Coordinate, heading: number): string {
    return (
    `    chassis.set_coordinates(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${heading.toFixed(2)});`
    );
  }

  driveToString(position: Coordinate, speed: number, callback: string, toPoint: boolean): string {
    return (
    `
    chassis.drive_to_point(${position.x.toFixed(2)}, ${position.y.toFixed(2)});`
    );
  }

  turnToString(position: Coordinate, speed: number, callback: string, toPoint: boolean): string {
    return (
    `
    chassis.turn_to_point(${position.x.toFixed(2)}, ${position.y.toFixed(2)});`
    );
  }
}