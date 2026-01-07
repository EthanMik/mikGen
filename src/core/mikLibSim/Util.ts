import { toRad } from "../Util";
import type { TurnDirection } from "./MikConstants";

export function angle_error(error: number, direction: TurnDirection | null) {
    if (direction === null) return reduce_negative_180_to_180(error);
    
    switch (direction) {
        case "clockwise":
            return error < 0 ? error + 360 : error;
        case "counterclockwise":
            return error > 0 ? error - 360 : error;
    }
}

export function reduce_negative_180_to_180(angle: number) {
    while(!(angle >= -180 && angle < 180)) {
        if(angle < -180) { angle += 360; }
        if(angle >= 180) { angle -= 360; }
    }
    return angle;
}

export function reduce_negative_90_to_90(angle: number) {
    while(!(angle >= -90 && angle < 90)) {
        if(angle < -90) { angle += 180; }
        if(angle >= 90) { angle -= 180; }
    }
    return angle;
}

export function is_line_settled(desired_X: number, desired_Y: number, desired_angle_deg: number, current_X: number, current_Y: number): boolean {
    return (desired_Y - current_Y) * Math.cos(toRad(desired_angle_deg)) <= -(desired_X - current_X) * Math.sin(toRad(desired_angle_deg));
}

export function left_voltage_scaling(drive_output: number, heading_output: number) {
    const ratio = Math.max(Math.abs(drive_output + heading_output), Math.abs(drive_output - heading_output)) / 12;
    if (ratio > 1) {
        return (drive_output + heading_output) / ratio;
    }
    return drive_output + heading_output;
}

export function right_voltage_scaling(drive_output: number, heading_output: number) {
    const ratio = Math.max(Math.abs(drive_output + heading_output), Math.abs(drive_output - heading_output)) / 12;
    if (ratio > 1) {
        return (drive_output - heading_output) / ratio;
    }
    return drive_output - heading_output;
}

export function clamp_min_voltage(drive_output: number, drive_min_voltage: number) {
    if (drive_output < 0 && drive_output > -drive_min_voltage) {
        return -drive_min_voltage;
    }
    if (drive_output > 0 && drive_output < drive_min_voltage) {
        return drive_min_voltage;
    }
    return drive_output;
}
