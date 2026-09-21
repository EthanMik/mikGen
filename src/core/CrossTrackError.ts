import type { Coordinate } from "./Types/Coordinate";

/**
 * Cross track error: how far sideways a point sits from a path. Positive means it lies to the left
 * of the path's direction of travel. Sideways is the whole point; how far along the path the point
 * has got is a separate question this deliberately says nothing about, which is why a robot that
 * overshoots a target and comes back can read near zero the entire way.
 *
 * Used by the run overlay's hover readout, to measure how far the real robot was from the precise
 * path, the simulated trajectory of the whole open path.
 */

export type NearestResult = {
    /** The projected point itself, lying on the reference. */
    x: number,
    y: number,
    /** Unsigned distance from the query point to that projection. */
    distance: number,
    /** The same distance, signed positive when the query point is left of the travel direction. */
    signed: number,
    /**
     * Distance along the reference from its start to the projection. Not used by the overlay yet,
     * but it is what an along track measure would be built from, so it is returned rather than
     * thrown away.
     */
    arcLength: number,
};

/**
 * Closest point on a polyline, plus which side of it the query point falls on.
 *
 * Every segment of the polyline is tested in turn. For each one the query point is projected onto
 * the infinite line through it, that projection is clamped back into the segment so a point beyond
 * either end attaches to the end rather than to empty space, and the nearest result wins.
 *
 * The sign comes from the 2D cross product of the segment direction and the offset to the query
 * point. Field inches are y up, so a positive cross product puts the query point counter clockwise
 * from the direction of travel, which is the robot's left.
 *
 * Returns null when there is nothing to measure against: an empty reference, or one whose points
 * are all identical and so carries no direction to take a side from.
 */
export function nearestOnPolyline(reference: Coordinate[], x: number, y: number): NearestResult | null {
    if (reference.length === 0) return null;
    if (reference.length === 1) {
        const dx = x - reference[0].x;
        const dy = y - reference[0].y;
        const distance = Math.hypot(dx, dy);
        return { x: reference[0].x, y: reference[0].y, distance, signed: distance, arcLength: 0 };
    }

    let best: NearestResult | null = null;
    let travelled = 0;

    for (let i = 1; i < reference.length; i++) {
        const ax = reference[i - 1].x, ay = reference[i - 1].y;
        const bx = reference[i].x, by = reference[i].y;
        const dx = bx - ax, dy = by - ay;
        const lengthSq = dx * dx + dy * dy;
        const length = Math.sqrt(lengthSq);

        // Two identical points in a row give a zero length segment. It has no direction, so there
        // is no side to be on and no projection to make. Skipping it is not a loss: any real
        // neighbouring segment covers the same place on the field.
        if (lengthSq === 0) continue;

        // Where the query point lands along this segment, as a fraction from its start to its end.
        // Clamping to 0..1 is what turns an infinite line into a finite segment: a robot past the
        // end measures to the end point rather than to a spot that does not exist.
        const alpha = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSq));
        const px = ax + alpha * dx;
        const py = ay + alpha * dy;
        const distance = Math.hypot(x - px, y - py);

        if (best === null || distance < best.distance) {
            // Positive when the query point sits counter clockwise of the travel direction, which
            // in a y up frame is the robot's left. Only the sign is wanted; the magnitude comes
            // from the projection above, which is already the true perpendicular distance.
            const cross = dx * (y - ay) - dy * (x - ax);
            best = {
                x: px,
                y: py,
                distance,
                signed: cross === 0 ? 0 : Math.sign(cross) * distance,
                arcLength: travelled + alpha * length,
            };
        }

        travelled += length;
    }

    return best;
}
