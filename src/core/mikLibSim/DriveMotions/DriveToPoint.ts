import type { Robot } from "../../Robot";
import { clamp, toDeg, toRad } from "../../Util";
import type { PID } from "../PID";
import { clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling } from "../Util";

let pointStartHeading: number | null = null;
let pointPrevLineSettled: boolean | null = null;

export function driveToPoint(robot: Robot, dt: number, x: number, y: number, drivePID: PID, headingPID: PID) {
    
    if (pointStartHeading === null) {
        pointStartHeading = toDeg(Math.atan2(x - robot.getX(), y - robot.getY()));
        pointPrevLineSettled = is_line_settled(x, y, pointStartHeading, robot.getX(), robot.getY());
    }
    
    if (drivePID.isSettled()) {
        drivePID.reset();
        headingPID.reset();
        pointStartHeading = null;
        pointPrevLineSettled = null;
        return true;
    }
    
    const line_settled = is_line_settled(x, y, pointStartHeading, robot.getX(), robot.getY());
    if (line_settled && !pointPrevLineSettled!) {
        drivePID.reset();
        headingPID.reset();
        pointStartHeading = null;
        pointPrevLineSettled = null;
        return true;
    }
    pointPrevLineSettled = line_settled;
    
    const drive_error = Math.hypot(x - robot.getX(), y - robot.getY());

    let heading_error = reduce_negative_180_to_180(toDeg(Math.atan2(x - robot.getX(), y - robot.getY())) - robot.getAngle());
    let drive_output = drivePID.compute(drive_error);

    const heading_scale_factor = Math.cos(toRad(heading_error));
    drive_output *= heading_scale_factor;
    heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID.compute(heading_error);
    
    if (drive_error < drivePID.settleError) { heading_output = 0; }

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drivePID.maxSpeed, Math.abs(heading_scale_factor) * drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

    robot.tankDrive(left_voltage_scaling(drive_output, heading_output) / 12, right_voltage_scaling(drive_output, heading_output) / 12, dt);

    return false;
}
