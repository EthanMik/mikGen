export function reduce_0_to_360(angle: number) {
    while (!(angle >= 0 && angle < 360)) {
        if (angle < 0) angle += 360;
        if (angle >= 360) angle -= 360;
    }
    return angle;
}

export function reduce_negative_180_to_180(angle: number) {
    while (!(angle >= -180 && angle < 180)) {
        if (angle < -180) angle += 360;
        if (angle >= 180) angle -= 360;
    }
    return angle;
}

export function reduce_negative_90_to_90(angle: number) {
    while (!(angle >= -90 && angle < 90)) {
        if (angle < -90) angle += 180;
        if (angle >= 90) angle -= 180;
    }
    return angle;
}

export function to_rad(angle_deg: number) { return angle_deg * (Math.PI / 180); }
export function to_deg(angle_rad: number) { return angle_rad * (180 / Math.PI); }
export function clamp(input: number, min: number, max: number) { return Math.min(Math.max(input, min), max); }

export function deadband(input: number, width: number) {
    return Math.abs(input) < width ? 0 : input;
}

export function is_line_settled(desired_X: number, desired_Y: number, desired_angle_deg: number, current_X: number, current_Y: number) {
    return (desired_Y - current_Y) * Math.cos(to_rad(desired_angle_deg)) <= -(desired_X - current_X) * Math.sin(to_rad(desired_angle_deg));
}

export function left_voltage_scaling(drive_output: number, heading_output: number) {
    const ratio = Math.max(Math.abs(drive_output + heading_output), Math.abs(drive_output - heading_output)) / 12;
    return ratio > 1 ? (drive_output + heading_output) / ratio : drive_output + heading_output;
}

export function right_voltage_scaling(drive_output: number, heading_output: number) {
    const ratio = Math.max(Math.abs(drive_output + heading_output), Math.abs(drive_output - heading_output)) / 12;
    return ratio > 1 ? (drive_output - heading_output) / ratio : drive_output - heading_output;
}

export function clamp_min_voltage(drive_output: number, drive_min_voltage: number) {
    if (drive_output < 0 && drive_output > -drive_min_voltage) return -drive_min_voltage;
    if (drive_output > 0 && drive_output < drive_min_voltage) return drive_min_voltage;
    return drive_output;
}