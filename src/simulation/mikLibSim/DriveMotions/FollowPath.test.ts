import { describe, it, vi } from "vitest";
import { Robot } from "../../../core/Robot";
import { bezierPointAt, bezierTangentAt, sampleBezier, type Bezier } from "../../../core/Types/Bezier";
import type { Coordinate } from "../../../core/Types/Coordinate";
import { toDeg, toRad } from "../../../core/Util";
import { kMikDrive, kMikHeading, type mikConstants } from "../MikConstants";
import { reduce_negative_180_to_180 } from "../Util";

const dt = 1 / 60;
const MAX_TICKS = 60 * 20;
const SAMPLES = 400;

type Pose = { x: number, y: number, angle: number };

function makeRobot(pose: Pose) {
    return new Robot(
        pose.x, pose.y, pose.angle,
        14, 12, 14, 6,
        0, 0,
        0, 0, 0, 0,
        0, 0, true,
        0, 0, true,
        0, 0, true,
        0, 0, true,
        0.2, 0.1,
    );
}

const curves = {
    nearStraight: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 16 }, c2: { x: 0, y: 32 }, p1: { x: 0, y: 48 } },
    gentle: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 24 }, c2: { x: 24, y: 24 }, p1: { x: 24, y: 48 } },
    sCurve: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 30 }, c2: { x: 24, y: 10 }, p1: { x: 24, y: 48 } },
    tight90: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 36 }, c2: { x: 12, y: 48 }, p1: { x: 48, y: 48 } },
    long: { p0: { x: 0, y: 0 }, c1: { x: 20, y: 60 }, c2: { x: 40, y: 80 }, p1: { x: 48, y: 120 } },
    hairpin: { p0: { x: 0, y: 0 }, c1: { x: 0, y: 60 }, c2: { x: -30, y: 60 }, p1: { x: -6, y: 6 } },
} satisfies Record<string, Bezier>;

function tangentDeg(b: Bezier, t: number): number {
    const tan = bezierTangentAt(b, t);
    return toDeg(Math.atan2(tan.x, tan.y));
}

function crossTrack(points: Coordinate[], x: number, y: number): number {
    let best = Infinity;
    for (const p of points) best = Math.min(best, Math.hypot(p.x - x, p.y - y));
    return best;
}

async function run(
    b: Bezier,
    opts: {
        start?: Pose,
        end_angle?: number | null,
        drive?: Partial<mikConstants>,
        heading?: Partial<mikConstants>,
    } = {},
) {
    vi.resetModules();
    const { follow_path } = await import("./FollowPath");

    const points = sampleBezier(b, SAMPLES);
    const reverse = opts.drive?.drive_direction === "reversed";
    const startPose = opts.start ?? { ...bezierPointAt(b, 0), angle: tangentDeg(b, 0) + (reverse ? 180 : 0) };
    const robot = makeRobot(startPose);
    const k: mikConstants[] = [{ ...kMikDrive, ...opts.drive }, { ...kMikHeading, ...opts.heading }];
    const end_angle = opts.end_angle ?? null;
    const expectedHeading = end_angle ?? tangentDeg(b, 1) + (reverse ? 180 : 0);

    let done = false;
    let ticks = 0;
    let maxCrossTrack = 0;
    let minForwardStep = Infinity;
    let maxForwardStep = -Infinity;

    while (!done && ticks < MAX_TICKS) {
        const prevX = robot.getX();
        const prevY = robot.getY();
        const prevAngle = robot.getAngle();
        const prevEndDist = Math.hypot(b.p1.x - prevX, b.p1.y - prevY);

        done = follow_path(robot, dt, points, end_angle, k);
        ticks++;

        if (prevEndDist > 6) {
            const step = (robot.getX() - prevX) * Math.sin(toRad(prevAngle)) + (robot.getY() - prevY) * Math.cos(toRad(prevAngle));
            minForwardStep = Math.min(minForwardStep, step);
            maxForwardStep = Math.max(maxForwardStep, step);
        }
        maxCrossTrack = Math.max(maxCrossTrack, crossTrack(points, robot.getX(), robot.getY()));
    }

    return {
        done,
        ticks,
        x: robot.getX(),
        y: robot.getY(),
        angle: robot.getAngle(),
        dist: Math.hypot(b.p1.x - robot.getX(), b.p1.y - robot.getY()),
        headErr: Math.abs(reduce_negative_180_to_180(robot.getAngle() - expectedHeading)),
        maxCrossTrack,
        minForwardStep,
        maxForwardStep,
    };
}

function show(name: string, r: Awaited<ReturnType<typeof run>>) {
    console.log(
        `${name.padEnd(38)} done=${r.done} ticks=${String(r.ticks).padStart(4)} ` +
        `pos=(${r.x.toFixed(2)}, ${r.y.toFixed(2)}) ang=${r.angle.toFixed(2)} ` +
        `dist=${r.dist.toFixed(2)} headErr=${r.headErr.toFixed(2)} xtrack=${r.maxCrossTrack.toFixed(2)} ` +
        `fwdStep=[${r.minForwardStep.toFixed(2)}, ${r.maxForwardStep.toFixed(2)}]`
    );
}

describe("probe", () => {
    it("scenarios", async () => {
        show("near straight", await run(curves.nearStraight));
        show("gentle", await run(curves.gentle));
        show("s-curve", await run(curves.sCurve));
        show("tight 90", await run(curves.tight90));
        show("long", await run(curves.long, { drive: { timeout: 8000 } }));
        show("hairpin", await run(curves.hairpin));

        show("gentle, end angle 0", await run(curves.gentle, { end_angle: 0 }));
        show("gentle, end angle 90", await run(curves.gentle, { end_angle: 90 }));
        show("tight90, end angle 45", await run(curves.tight90, { end_angle: 45 }));

        show("reversed gentle", await run(curves.gentle, { drive: { drive_direction: "reversed" } }));
        show("reversed s-curve", await run(curves.sCurve, { drive: { drive_direction: "reversed" } }));
        show("fastest, robot facing away", await run(curves.gentle, {
            start: { x: 0, y: 0, angle: 180 }, drive: { drive_direction: "fastest" },
        }));
        show("forwards forced", await run(curves.gentle, { drive: { drive_direction: "forwards" } }));

        show("start 12in off path", await run(curves.gentle, { start: { x: -12, y: 12, angle: 0 } }));
        show("start 12in off, s-curve", await run(curves.sCurve, { start: { x: 12, y: 6, angle: 0 } }));
        show("start past the end", await run(curves.gentle, { start: { x: 30, y: 56, angle: 0 } }));
        show("start mid path", await run(curves.gentle, { start: { x: 6, y: 30, angle: 30 } }));
        show("start facing sideways", await run(curves.gentle, { start: { x: 0, y: 0, angle: 90 } }));

        show("max_voltage 4", await run(curves.gentle, { drive: { max_voltage: 4 } }));
        show("max_voltage 12", await run(curves.gentle, { drive: { max_voltage: 12 } }));
        show("min_voltage 3", await run(curves.gentle, { drive: { min_voltage: 3 } }));
        show("min_voltage 3 exit 6", await run(curves.gentle, { drive: { min_voltage: 3, exit_error: 6 } }));
        show("slew 0", await run(curves.gentle, { drive: { slew: 0 } }));
        show("drift 0", await run(curves.gentle, { drive: { drift: 0 } }));
        show("drift 0.5", await run(curves.gentle, { drive: { drift: 0.5 } }));
        show("kp 3 kd 20", await run(curves.gentle, { drive: { kp: 3, kd: 20 } }));
        show("kp 0.6", await run(curves.gentle, { drive: { kp: 0.6, timeout: 8000 } }));
        show("heading kp 0.8", await run(curves.gentle, { heading: { kp: 0.8 } }));
        show("heading max 4", await run(curves.gentle, { heading: { max_voltage: 4 } }));
        show("timeout 500", await run(curves.long, { drive: { timeout: 500 } }));
        show("tight settle", await run(curves.gentle, { drive: { settle_error: 0.5, settle_time: 300, timeout: 8000 } }));
    });
});
