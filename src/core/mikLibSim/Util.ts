import { clamp, toRad } from "../Util";
import type { TurnDirection } from "./MikConstants";
import { kMikLibSpeed } from "./MikConstants";

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
    while (!(angle >= -180 && angle < 180)) {
        if (angle < -180) { angle += 360; }
        if (angle >= 180) { angle -= 360; }
    }
    return angle;
}

export function reduce_negative_90_to_90(angle: number) {
    while (!(angle >= -90 && angle < 90)) {
        if (angle < -90) { angle += 180; }
        if (angle >= 90) { angle -= 180; }
    }
    return angle;
}

export function is_line_settled(desired_X: number, desired_Y: number, desired_angle_deg: number, current_X: number, current_Y: number, exit_error: number): boolean {
    return (desired_Y - current_Y) * Math.cos(toRad(desired_angle_deg)) <= -(desired_X - current_X) * Math.sin(toRad(desired_angle_deg)) + exit_error;
}

export function slew_scaling(drive_output: number, prev_drive_output: number, slew: number, scale: boolean = true) {
    let change = drive_output - prev_drive_output;
    if (slew === 0 || !scale) return drive_output;
    if (change > slew) change = slew;
    else if (change < -slew) change = -slew;
    return prev_drive_output + change;
}

export function clamp_max_slip(drive_output: number,current_X: number, current_Y: number, current_angle_deg: number,
    desired_X: number, desired_Y: number, drift: number): number {
    const heading = toRad(current_angle_deg);
    const dx = desired_X - current_X;
    const dy = desired_Y - current_Y;

    const perpDist = Math.abs(Math.sin(heading) * dy - Math.cos(heading) * dx);
    const dist = Math.hypot(dx, dy);

    const radius = (dist * dist) / (2 * perpDist);
    const max_slip = Math.sqrt(drift * radius * 9.8);
    return clamp(drive_output, -max_slip, max_slip);
}

export function overturn_scaling(drive_output: number, heading_output: number, max_speed: number) {
    const overturn = Math.abs(heading_output) + Math.abs(drive_output) - max_speed;
    if (overturn > 0) {
        if (drive_output > 0) {
            return drive_output - overturn;
        } else if (drive_output < 0) {
            return drive_output + overturn;
        }
    }
    return drive_output;
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
