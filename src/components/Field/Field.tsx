import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Coordinate } from "../../core/Types/Coordinate";
import homeButton from "../../assets/home.svg";
import type { Segment } from "../../core/Types/Segment";
import { FIELD_IMG_DIMENSIONS, FIELD_REAL_DIMENSIONS, toInch, toRGBA } from "../../core/Util";
import { usePath, useFormat, useField, getFieldSrcFromKey, fileFormatStore, updatePath } from "../../hooks/useFileFormat";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import { useRobotVisibility } from "../../hooks/useRobotVisibility";
import { PathSimMacros } from "../../macros/PathSimMacros";
import FieldMacros from "../../macros/FieldMacros";
import { deselectControls, getPressedPositionInch, invalidateSvgCtm, pointerToSvg, selectControlInPath, selectionCount } from "./FieldUtils";
import { segmentControls } from "../../core/Types/Bezier";
import HoverButton from "../Util/HoverButton";
import { useBoxSelect } from "./useBoxSelect";
import { useMagnetSnap } from "./useMagnetSnap";
import RobotLayer from "./RobotLayer";
import PathLayer from "./PathLayer";
import ControlsLayer from "./ControlsLayer";
import { saveSnapshot } from "../../core/Undo/UndoHistory";
import { resolveHeading, getBackwardsSnapPose, getBackwardsSnapIdx, distanceToPosition, getSegmentDistance, type Path } from "../../core/Types/Path";
import { useSettings } from "../../hooks/useSettings";
import { queueFieldImg, useFieldImg } from "../../hooks/useFieldImg";
import { consumeSpacePan, markSpacePan, useSpaceHeld } from "../../hooks/useSpaceHeld";

const controlDragKey = (segmentId: string, controlIdx: number) => `${segmentId}:c${controlIdx}`;

export default function Field({ showRightPanel = true, canvasWidth = FIELD_IMG_DIMENSIONS.w }: { showRightPanel?: boolean; canvasWidth?: number }) {
	const [img, setImg] = useFieldImg();
	const [fieldKey] = useField();

	const svgRef = useRef<SVGSVGElement | null>(null);
	const pathRef = useRef<Path | null>(null);
	const headingHistoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const moveHistoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [path, setPath] = usePath();
	pathRef.current = path;

	// Key covering every input the reposition effect reads: anchor poses come from non-distance
	// segments, while a distance segment's own distance and heading angle feed resolveHeading
	// and distanceToPosition. When it changes, reposition all distance segments.
	const repositionKey = useMemo(() =>
		path.segments
			.map(s =>
				s.kind === "distanceDrive" || s.kind === "strafeDrive"
					? `${s.id}:${s.kind}:d${s.distance},a${s.pose.angle}`
					: `${s.id}:${s.kind}:${s.pose.x},${s.pose.y},${s.pose.angle}`)
			.join('|'),
		[path.segments]
	);

	useEffect(() => {
		setPath(prev => {
			const segments = [...prev.segments];
			let changed = false;

			for (let segIdx = 0; segIdx < segments.length; segIdx++) {
				const c = segments[segIdx];
				if (c.kind !== "distanceDrive" && c.kind !== "strafeDrive") continue;

				const prevSegKind = segments[segIdx - 1]?.kind;
				const afterTurn = (prevSegKind === "pointSwing" || prevSegKind === "pointTurn") && c.kind !== "strafeDrive";
				const currentPath = { ...prev, segments };

				if (afterTurn) {
					const anchorPose = getBackwardsSnapPose(currentPath, segIdx - 1);
					if (!anchorPose || anchorPose.x === null || anchorPose.y === null) continue;
					// Signed projection so a turn's angle offset (e.g. 180) yields a negative distance
					const newDist = getSegmentDistance(currentPath, segIdx, 0);
					if (newDist === null) continue;
					if (Math.abs(newDist - c.distance) > 0.001) {
						segments[segIdx] = { ...c, distance: newDist };
						changed = true;
					}
					continue;
				}

				const newPos = distanceToPosition(currentPath, segIdx, c.distance, c.kind === "strafeDrive" ? 90 : 0);
				if (!newPos) continue;
				if (Math.abs(newPos.x - (c.pose.x ?? 0)) > 0.001 || Math.abs(newPos.y - (c.pose.y ?? 0)) > 0.001) {
					segments[segIdx] = { ...c, pose: { ...c.pose, x: newPos.x, y: newPos.y } };
					changed = true;
				}
			}

			return changed ? { ...prev, segments } : prev;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [repositionKey]);

	const robot = fileFormatStore.useSelector(s => s.robot);
	const [robotVisible, setRobotVisibility] = useRobotVisibility();
	const [pathVisible] = usePathVisibility();
	const [format] = useFormat();
	const [settings,] = useSettings();

	const startDrag = useRef(false);
	const radius = 15;

	type dragProps = { dragging: boolean; lastPos: Coordinate };
	const [drag, setDrag] = useState<dragProps>({ dragging: false, lastPos: { x: 0, y: 0 } });
	const dragHistoryActive = useRef(false);
	const dragDidMove = useRef(false);

	const dragStartSnapshot = useRef<Path | null>(null);
	const dragStartPushed = useRef(false);
	const lastReleasedSnapshot = useRef<Path | null>(null);
	const dragStartPointerInch = useRef<Coordinate | null>(null);
	const dragStartPositions = useRef<Record<string, { x: number | null; y: number | null }>>({});
	const shiftPendingSelectRef = useRef<string | null>(null);
	const pendingTurnCycleRef = useRef<string | null>(null);
	const suppressClickFallbackRef = useRef(false);

	const [spaceHeld] = useSpaceHeld();
	const [isPanning, setIsPanning] = useState(false)
	const fieldDragRef = useRef<Coordinate>({ x: 0, y: 0 });
	const isFieldDragging = useRef(false);

	const {
		boxSelectRect, isBoxSelecting,
		startBoxSelect, updateBoxSelect, finalizeBoxSelect, cancelBoxSelect,
	} = useBoxSelect();

	const { snapInfo, findSnap, clearSnap } = useMagnetSnap();

	const {
		moveControl, moveHeading, deleteControl, unselectPath, selectPath,
		selectInversePath, undo, redo, addPointDriveSegment, addStartSegment,
		addPointTurnSegment, addPoseDriveSegment, addAngleTurnSegment, addDistanceSegment, addStrafeSegment,
		addAngleSwingSegment, addPointSwingSegment, addBezierSegment, fieldZoomKeyboard, fieldZoomWheel,
		fieldPanWheel, cut, paste, copy,
	} = FieldMacros();

	const { toggleRobotVisibility } = PathSimMacros();

	const hiddenInputRef = useRef<HTMLInputElement | null>(null);

	const pasteRef = useRef<(evt: ClipboardEvent) => void>(() => { });
	pasteRef.current = (evt: ClipboardEvent) => {
		paste(evt, setPath);
		hiddenInputRef.current?.blur();
	};

	useEffect(() => {
		const handlePaste = (evt: ClipboardEvent) => pasteRef.current(evt);
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, []);

	useEffect(() => {
		const handleKeyDown = (evt: KeyboardEvent) => {
			const target = evt.target as HTMLElement | null;
			if (target?.isContentEditable || target?.tagName === "INPUT") return;
			if (evt.ctrlKey && evt.key.toLowerCase() === "r") return;
			if (evt.ctrlKey && evt.key.toLowerCase() === "v") {
				hiddenInputRef.current?.focus();
				return;
			}
			unselectPath(evt, updatePath);
			moveControl(evt, updatePath);
			if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evt.key)) {
				if (moveHistoryTimerRef.current) clearTimeout(moveHistoryTimerRef.current);
				moveHistoryTimerRef.current = setTimeout(() => {
					if (pathRef.current) saveSnapshot();
				}, 400);
			}
			copy(evt, pathRef.current!, () => { });
			copy(evt, pathRef.current!, () => { }, true);
			cut(evt, pathRef.current!, updatePath);
			deleteControl(evt, updatePath);
			selectPath(evt, updatePath);
			selectInversePath(evt, updatePath);
			undo(evt);
			redo(evt);

			fieldZoomKeyboard(evt, setImg);
			toggleRobotVisibility(evt, setRobotVisibility);
		};

		const handleWheelDown = (evt: WheelEvent) => {
			const target = evt.target as HTMLElement | null;
			if (target?.isContentEditable || target?.tagName === "INPUT") return;
			if (moveHeading(evt, pathRef.current!, updatePath)) {
				if (headingHistoryTimerRef.current) clearTimeout(headingHistoryTimerRef.current);
				headingHistoryTimerRef.current = setTimeout(() => {
					if (pathRef.current) saveSnapshot();
				}, 400);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("wheel", handleWheelDown, { passive: false });

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("wheel", handleWheelDown);
		};
	}, [
		moveControl,
		moveHeading,
		deleteControl,
		unselectPath,
		selectPath,
		selectInversePath,
		undo,
		redo,
		fieldZoomKeyboard,
		toggleRobotVisibility,
		cut,
		copy,
		setImg,
		setRobotVisibility,
	]);

	// Space turns a left drag into a field pan. Held state is global because PathSimulator has to
	// know, on release, whether the press was a pan or a tap that should toggle playback.
	useEffect(() => {
		const isTyping = (evt: KeyboardEvent) => {
			const target = evt.target as HTMLElement | null;
			return target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
		};

		const onKeyDown = (evt: KeyboardEvent) => {
			if (evt.code !== "Space" || isTyping(evt)) return;
			// Stops the page scrolling and stops Space from activating whatever button has focus
			evt.preventDefault();
			useSpaceHeld.setState(true);
		};

		const onKeyUp = (evt: KeyboardEvent) => {
			if (evt.code !== "Space") return;
			useSpaceHeld.setState(false);
		};

		// Losing focus means the matching keyup never arrives, so clear both or Space sticks down
		// and the stale pan mark swallows the next tap
		const onBlur = () => {
			useSpaceHeld.setState(false);
			consumeSpacePan();
		};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onBlur);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onBlur);
		};
	}, []);

	useEffect(() => {
		const svg = svgRef.current;
		if (svg === null) return;

		const onWheel = (evt: WheelEvent) => {
			fieldZoomWheel(evt, svgRef);
			fieldPanWheel(evt);
		};

		svg.addEventListener("wheel", onWheel, { passive: false });

		return () => {
			svg.removeEventListener("wheel", onWheel);
		};
	}, []);


	const handleFieldPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
		const spacePan = evt.button === 0 && spaceHeld;
		if (evt.button !== 1 && !spacePan) return;

		evt.preventDefault();
		svgRef.current?.setPointerCapture(evt.pointerId);

		// Marking on press, not on movement, so Space + click with no drag still counts as a pan
		// and does not fall through to a play/pause toggle when Space is released
		if (spacePan) markSpacePan();

		isFieldDragging.current = true;
		setIsPanning(true);
		fieldDragRef.current = { x: evt.clientX, y: evt.clientY };
	};

	const handleFieldDrag = (evt: React.PointerEvent<SVGSVGElement>) => {
		// Gated on the ref rather than spaceHeld, so letting go of Space mid-drag keeps panning
		const spacePan = (evt.buttons & 1) !== 0 && isFieldDragging.current;
		if (!(evt.buttons & 4) && !spacePan) return;

		const dx = evt.clientX - fieldDragRef.current.x;
		const dy = evt.clientY - fieldDragRef.current.y;

		queueFieldImg((prev) => ({
			...prev,
			x: prev.x + dx,
			y: prev.y + dy,
		}));

		fieldDragRef.current = { x: evt.clientX, y: evt.clientY };
	};

	const lastAppliedDelta = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

	const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
		if (!drag.dragging || !svgRef.current) return;

		const posSvg = pointerToSvg(evt, svgRef.current);
		const posInch = toInch(posSvg, FIELD_REAL_DIMENSIONS, img);

		const start = dragStartPointerInch.current;
		if (!start) return;

		const shiftHeld = evt.shiftKey;
		let effectivePosInch = posInch;

		if (shiftHeld) {
			// A control drives the snap just like a segment node when it owns the selection
			let refKey: string | null = path.segments.find(s => s.selected && !s.locked)?.id ?? null;
			if (refKey === null) {
				for (const s of path.segments) {
					if (s.locked) continue;
					const i = segmentControls(s).findIndex(c => c.selected);
					if (i !== -1) { refKey = controlDragKey(s.id, i); break; }
				}
			}
			const refStart = refKey !== null ? dragStartPositions.current[refKey] : null;
			if (refStart && refStart.x !== null && refStart.y !== null) {
				const rawDx = posInch.x - start.x;
				const rawDy = posInch.y - start.y;
				const segCurrentPos = { x: refStart.x + rawDx, y: refStart.y + rawDy };
				const snappedSegPos = findSnap(segCurrentPos, path, img);
				effectivePosInch = {
					x: posInch.x + (snappedSegPos.x - segCurrentPos.x),
					y: posInch.y + (snappedSegPos.y - segCurrentPos.y),
				};
			} else {
				clearSnap();
			}
		} else {
			clearSnap();
		}

		const dx = effectivePosInch.x - start.x;
		const dy = effectivePosInch.y - start.y;
		
		const snapEnabled = settings.snappingEnabled !== evt.ctrlKey;
		const snapValue = 1 / settings.snapToGrid;

		if (!snapEnabled && dx === lastAppliedDelta.current.dx && dy === lastAppliedDelta.current.dy) {
			return;
		}
		lastAppliedDelta.current = { dx, dy };

		if (dx !== 0 || dy !== 0) dragDidMove.current = true;

		const applyDelta = (startPos: { x: number | null; y: number | null } | undefined) => {
			if (!startPos) return null;
			let newX = startPos.x === null ? null : startPos.x + dx;
			let newY = startPos.y === null ? null : startPos.y + dy;
			if (snapEnabled) {
				if (newX !== null) newX = Math.round(newX * snapValue) / snapValue;
				if (newY !== null) newY = Math.round(newY * snapValue) / snapValue;
			}
			return { x: newX, y: newY };
		};

		setPath(prev => {
			// First pass: move all non-distance segments and any selected bezier controls by delta
			const firstPass: Segment[] = prev.segments.map((c) => {
				const controls = segmentControls(c);
				const movedControls = controls.some(ctrl => ctrl.selected) && !c.locked
					? controls.map((ctrl, i) => {
						if (!ctrl.selected) return ctrl;
						const moved = applyDelta(dragStartPositions.current[controlDragKey(c.id, i)]);
						return moved ? { ...ctrl, x: moved.x, y: moved.y } : ctrl;
					})
					: controls;
				const withControls = movedControls === controls ? c : { ...c, controls: movedControls };

				if (c.kind === "distanceDrive" || c.kind === "strafeDrive") return withControls;
				if (!c.selected || c.locked) return withControls;

				const moved = applyDelta(dragStartPositions.current[c.id]);
				if (!moved) return withControls;

				return { ...withControls, pose: { ...c.pose, x: moved.x, y: moved.y } };
			});

			// Second pass: update distance/strafe segments
			const next: Segment[] = [...firstPass];
			for (let segIdx = 0; segIdx < firstPass.length; segIdx++) {
				const c = firstPass[segIdx];
				if (c.kind !== "distanceDrive" && c.kind !== "strafeDrive") continue;

				const anchorPose = getBackwardsSnapPose({ ...prev, segments: next }, segIdx - 1);
				const prevSegKind = next[segIdx - 1]?.kind;
				const afterTurn = (prevSegKind === "pointSwing" || prevSegKind === "pointTurn") && c.kind !== "strafeDrive";

				if (afterTurn) {
					// After a point turn the turn always faces the next point, so the segment moves freely
					if (!anchorPose || anchorPose.x === null || anchorPose.y === null) continue;

					if (c.selected && !c.locked) {
						// Use delta from drag-start position so multi-select moves all segments uniformly
						const startPos = dragStartPositions.current[c.id];
						let newX = startPos?.x == null ? (c.pose.x ?? 0) : startPos.x + dx;
						let newY = startPos?.y == null ? (c.pose.y ?? 0) : startPos.y + dy;
						if (snapEnabled) {
							// Snap the distance itself to the grid, keeping the drag direction
							const mag = Math.hypot(newX - anchorPose.x, newY - anchorPose.y);
							if (mag > 0) {
								const snappedMag = Math.round(mag * snapValue) / snapValue;
								newX = anchorPose.x + (newX - anchorPose.x) / mag * snappedMag;
								newY = anchorPose.y + (newY - anchorPose.y) / mag * snappedMag;
							}
						}
						next[segIdx] = { ...c, pose: { ...c.pose, x: newX, y: newY } };
						const t = getSegmentDistance({ ...prev, segments: next }, segIdx, 0)
							?? Math.hypot(newX - anchorPose.x, newY - anchorPose.y);
						next[segIdx] = { ...next[segIdx], distance: t };
					} else {
						// Not selected: keep absolute position, update signed distance from moved anchor
						const newDist = getSegmentDistance({ ...prev, segments: next }, segIdx, 0)
							?? Math.hypot((c.pose.x ?? 0) - anchorPose.x, (c.pose.y ?? 0) - anchorPose.y);
						if (Math.abs(newDist - c.distance) > 0.001) {
							next[segIdx] = { ...c, distance: newDist };
						}
					}
					continue;
				}

				if (c.selected && !c.locked) {
					// Selected: project mouse onto heading and update distance
					const startPos = dragStartPositions.current[c.id];
					if (!anchorPose || anchorPose.x === null || anchorPose.y === null) {
						if (startPos) {
							let newX = startPos.x === null ? null : startPos.x + dx;
							let newY = startPos.y === null ? null : startPos.y + dy;
							if (snapEnabled) {
								if (newX !== null) newX = Math.round(newX * snapValue) / snapValue;
								if (newY !== null) newY = Math.round(newY * snapValue) / snapValue;
							}
							next[segIdx] = { ...c, pose: { ...c.pose, x: newX, y: newY } };
						}
						continue;
					}

					const resolved = resolveHeading({ ...prev, segments: next }, segIdx, c.kind === "strafeDrive" ? 90 : 0);

					let hx: number, hy: number;
					if (resolved) {
						hx = resolved.heading.x / resolved.headingMag;
						hy = resolved.heading.y / resolved.headingMag;
					} else {
						const ofsX = (startPos?.x ?? 0) - anchorPose.x;
						const ofsY = (startPos?.y ?? 0) - anchorPose.y;
						const mag = Math.sqrt(ofsX * ofsX + ofsY * ofsY);
						if (mag === 0) continue;
						hx = ofsX / mag;
						hy = ofsY / mag;
					}

					const segEffX = startPos?.x == null ? effectivePosInch.x : startPos.x + dx;
					const segEffY = startPos?.y == null ? effectivePosInch.y : startPos.y + dy;
					const fromAnchorX = segEffX - anchorPose.x;
					const fromAnchorY = segEffY - anchorPose.y;
					let t = fromAnchorX * hx + fromAnchorY * hy;
					// Snap the distance itself to the grid instead of the endpoint position
					if (snapEnabled) t = Math.round(t * snapValue) / snapValue;
					const newX = anchorPose.x + t * hx;
					const newY = anchorPose.y + t * hy;

					next[segIdx] = { ...c, pose: { ...c.pose, x: newX, y: newY }, distance: t };
					continue;
				}

				// Not selected: recompute position from geometric distance (using original poses) and updated anchor
				const geomDist = getSegmentDistance(prev, segIdx, c.kind === "strafeDrive" ? 90 : 0) ?? c.distance;
				const newPos = distanceToPosition({ ...prev, segments: next }, segIdx, geomDist, c.kind === "strafeDrive" ? 90 : 0);
				if (!newPos) continue;
				if (Math.abs(newPos.x - (c.pose.x ?? 0)) > 0.001
					|| Math.abs(newPos.y - (c.pose.y ?? 0)) > 0.001
					|| Math.abs(geomDist - c.distance) > 0.001) {
					next[segIdx] = { ...c, pose: { ...c.pose, x: newPos.x, y: newPos.y }, distance: geomDist };
				}
			}

			return { ...prev, segments: next };
		});
	};

	const endDrag = () => {
		clearSnap();
		shiftPendingSelectRef.current = null;
		pendingTurnCycleRef.current = null;
		setDrag({ dragging: false, lastPos: { x: 0, y: 0 } });
		dragHistoryActive.current = false;

		if (dragDidMove.current) {
			saveSnapshot();
			lastReleasedSnapshot.current = structuredClone(path);
		}

		dragDidMove.current = false;
		dragStartSnapshot.current = null;
		dragStartPushed.current = false;
		dragStartPointerInch.current = null;
		dragStartPositions.current = {};
		isFieldDragging.current = false;
		setIsPanning(false);
	}

	const selectSegment = (controlId: string, shifting: boolean) => {
		setPath((prevSegment) => {
			const prevSelectedIds = prevSegment.segments
				.filter((c) => c.selected)
				.map((c) => c.id);

			let nextSelectedIds: string[];
			let exclusive = false;
			// Counts controls too, so a node picked out of a mixed group extends rather than collapses
			if (!shifting && selectionCount(prevSegment.segments) <= 1) {
				nextSelectedIds = [controlId];
				exclusive = true;
			} else if (shifting && prevSegment.segments.find((c) => c.id === controlId && c.selected)) {
				nextSelectedIds = prevSelectedIds.filter((c) => c !== controlId);
			} else {
				nextSelectedIds = [...prevSelectedIds, controlId];
			}

			// Only an exclusive pick takes selection away from the controls. Extending a
			// multi-selection keeps them, so a mixed segment + control group drags together.
			const segments = exclusive ? deselectControls(prevSegment.segments) : prevSegment.segments;

			return {
				...prevSegment,
				segments: segments.map((c) => ({
					...c,
					selected: !c.locked && nextSelectedIds.includes(c.id),
				})),
			};
		});
	};

	/** Selects one bezier control exclusively, clearing every segment and every other control. */
	const selectControl = (segmentId: string, controlIdx: number) => {
		setPath((prev) => selectControlInPath(prev, segmentId, controlIdx, "exclusive"));
	};

	const handleControlPointerDown = (evt: React.PointerEvent<SVGGElement>, controlId: string) => {
		if (evt.button !== 0 || !svgRef.current) return;
		// Bail before stopPropagation so the press bubbles up and starts a pan instead
		if (spaceHeld) return;
		evt.stopPropagation();
		svgRef.current.setPointerCapture(evt.pointerId);

		if (!dragHistoryActive.current) {
			setPath((prev) => {
				dragStartSnapshot.current = structuredClone(prev);
				return prev;
			});
			dragStartPushed.current = false;
			dragHistoryActive.current = true;
			dragDidMove.current = false;
		}

		const posSvg = pointerToSvg(evt, svgRef.current);
		if (!drag.dragging) {
			if (evt.shiftKey) {
				shiftPendingSelectRef.current = controlId;
			} else {
				const clickedIdx = path.segments.findIndex(s => s.id === controlId);

				const turnsOnTop: string[] = [];
				for (let i = clickedIdx + 1; i < path.segments.length; i++) {
					const s = path.segments[i];
					if (s.pose.x !== null && s.pose.y !== null) break;
					if (["pointTurn", "angleTurn", "pointSwing", "angleSwing", "wait"].includes(s.kind) && getBackwardsSnapIdx(path, i) === clickedIdx) {
						turnsOnTop.push(s.id);
					}
				}

				if (turnsOnTop.length > 0) {
					const cycle = [controlId, ...turnsOnTop];
					const selectedCount = path.segments.filter(s => s.selected).length;
					const currentCycleIdx = selectedCount === 1
						? cycle.findIndex(id => path.segments.some(s => s.id === id && s.selected))
						: -1;

					if (currentCycleIdx >= 0) {
						pendingTurnCycleRef.current = cycle[(currentCycleIdx + 1) % cycle.length];
					} else {
						selectSegment(controlId, false);
					}
				} else {
					selectSegment(controlId, false);
				}
			}
		}

		snapshotDragStart(posSvg);
	};

	/** Records the pointer origin plus every segment and control position the drag may move. */
	const snapshotDragStart = (posSvg: Coordinate) => {
		const startInch = toInch(posSvg, FIELD_REAL_DIMENSIONS, img);
		dragStartPointerInch.current = structuredClone(startInch);
		const startPositions: Record<string, { x: number | null; y: number | null }> = {};
		for (const s of path.segments) {
			startPositions[s.id] = { x: s.pose.x, y: s.pose.y };
			segmentControls(s).forEach((c, i) => {
				startPositions[controlDragKey(s.id, i)] = { x: c.x, y: c.y };
			});
		}
		dragStartPositions.current = startPositions;

		startDrag.current = true;
		setDrag({ dragging: true, lastPos: posSvg });
	};

	const handleControlPointPointerDown = (evt: React.PointerEvent<SVGCircleElement>, segmentId: string, controlIdx: number) => {
		if (evt.button !== 0 || !svgRef.current) return;
		if (spaceHeld) return;
		evt.stopPropagation();
		svgRef.current.setPointerCapture(evt.pointerId);

		if (!dragHistoryActive.current) {
			setPath((prev) => {
				dragStartSnapshot.current = structuredClone(prev);
				return prev;
			});
			dragStartPushed.current = false;
			dragHistoryActive.current = true;
			dragDidMove.current = false;
		}

		if (!drag.dragging) {
			const seg = path.segments.find(s => s.id === segmentId);
			const alreadySelected = segmentControls(seg ?? ({} as Segment))[controlIdx]?.selected ?? false;
			if (evt.ctrlKey) {
				setPath(prev => selectControlInPath(prev, segmentId, controlIdx, "toggle"));
			} else if (evt.shiftKey) {
				setPath(prev => selectControlInPath(prev, segmentId, controlIdx, "range"));
			} else if (!(alreadySelected && selectionCount(path.segments) > 1)) {
				// Grabbing a handle already inside a group keeps the group so it drags together
				selectControl(segmentId, controlIdx);
			}
		}

		snapshotDragStart(pointerToSvg(evt, svgRef.current));
	};

	// Stable wrappers so the memoized ControlsLayer's props keep identity across Field renders;
	// the refs always point at the latest closures, so behavior is unchanged
	const controlPointerDownImpl = useRef(handleControlPointerDown);
	controlPointerDownImpl.current = handleControlPointerDown;
	const stableControlPointerDown = useCallback(
		(e: React.PointerEvent<SVGGElement>, id: string) => controlPointerDownImpl.current(e, id), []);

	const controlPointPointerDownImpl = useRef(handleControlPointPointerDown);
	controlPointPointerDownImpl.current = handleControlPointPointerDown;
	const stableControlPointPointerDown = useCallback(
		(e: React.PointerEvent<SVGCircleElement>, id: string, controlIdx: number) =>
			controlPointPointerDownImpl.current(e, id, controlIdx), []);

	const endSelection = () => {
		setPath((prev) => ({
			...prev,
			segments: deselectControls(prev.segments).map((c) => ({ ...c, selected: false })),
		}));
	};

	const handleBackgroundPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
		if ((evt.button !== 0 && evt.button !== 2) || pathVisible) return;

		const isBareLeftClick = evt.button === 0 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey;

		if (isBareLeftClick) {
			const selectedCount = selectionCount(path.segments);
			if (selectedCount > 1) {
				endSelection();
				suppressClickFallbackRef.current = true;
			}

			const pos = getPressedPositionInch(evt, svgRef.current, img);
			if (path.segments.length <= 0) {
				addStartSegment(format, { x: pos.x, y: pos.y, angle: 0 }, setPath);
				return;
			}
			const svgPos = pointerToSvg(evt, svgRef.current!);
			startBoxSelect(svgPos, pos);
			return;
		}

		const selectedCount = selectionCount(path.segments);
		if (selectedCount > 1) {
			endSelection();
			return;
		}

		const pos = getPressedPositionInch(evt, svgRef.current, img);

		if (path.segments.length <= 0) {
			addStartSegment(format, { x: pos.x, y: pos.y, angle: 0 }, setPath);
			return;
		}

		addPoseDriveSegment(evt, format, { x: pos.x, y: pos.y, angle: 0 }, setPath, path);
		addPointDriveSegment(evt, format, pos, setPath, path);
		addDistanceSegment(evt, format, { x: pos.x, y: pos.y, angle: null }, setPath, path);
		addStrafeSegment(evt, format, { x: pos.x, y: pos.y, angle: null }, setPath, path);
		addPointTurnSegment(evt, format, setPath, path);
		addAngleTurnSegment(evt, format, setPath, path);
		addPointSwingSegment(evt, format, setPath, path);
		addAngleSwingSegment(evt, format, setPath, path);
		addBezierSegment(evt, format, { x: pos.x, y: pos.y, angle: null }, setPath, path);
	};

	const handlePointerUp = (evt: React.PointerEvent<SVGSVGElement>) => {
		setIsPanning(false);
		if (shiftPendingSelectRef.current !== null && !dragDidMove.current) {
			selectSegment(shiftPendingSelectRef.current, true);
		}
		if (pendingTurnCycleRef.current !== null && !dragDidMove.current) {
			selectSegment(pendingTurnCycleRef.current, false);
		}
		endDrag();
		const suppress = suppressClickFallbackRef.current;
		suppressClickFallbackRef.current = false;
		finalizeBoxSelect(img, path, setPath, (startInch) => {
			if (!suppress && path.segments.length > 0) {
				addPointDriveSegment(evt, format, startInch, setPath, path);
			}
		});
	};

	return (
		<div
			tabIndex={0}
			// The nodes and handles set their own cursor inline, so panning has to override the
			// whole subtree rather than just the svg
			className={`select-none${isPanning ? " field-pan-active" : spaceHeld ? " field-pan-ready" : ""}`}
			onMouseLeave={() => { endDrag(); cancelBoxSelect(); }}
		>
			<input
				ref={hiddenInputRef}
				data-paste-proxy=""
				tabIndex={-1}
				style={{ position: "fixed", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
			/>
			<svg
				ref={svgRef}
				viewBox={`${-Math.floor((canvasWidth - FIELD_IMG_DIMENSIONS.w) / 2)} 0 ${canvasWidth} ${FIELD_IMG_DIMENSIONS.h}`}
				width={canvasWidth}
				height={FIELD_IMG_DIMENSIONS.h}
				className={`${drag.dragging ? "cursor-grabbing" : isBoxSelecting ? "cursor-crosshair" : "cursor-default"}`}
				onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
				onPointerDown={(e) => {
					// Cheap once per gesture, and guarantees the cached matrix matches the current layout
					invalidateSvgCtm();
					if (e.button === 1) e.preventDefault();
					handleFieldPointerDown(e);
					// While Space is held the field only pans, so no segment is added and no box select starts
					if (spaceHeld) return;
					handleBackgroundPointerDown(e);
				}}
				onPointerMove={(e) => {
					handlePointerMove(e);
					handleFieldDrag(e);
					if (svgRef.current) updateBoxSelect(e, svgRef.current, img, path, setPath);
				}}
				onPointerUp={handlePointerUp}
			>
				<image href={getFieldSrcFromKey(fieldKey)} x={img.x} y={img.y} width={img.w} height={img.h} />

				<PathLayer path={path} img={img} visible={pathVisible} precise={settings.precisePath} />

				<RobotLayer
					img={img}
					robotConstants={robot}
					visible={robotVisible}
					path={path}
				/>
				{!pathVisible && (
					<ControlsLayer
						path={path}
						img={img}
						radius={radius}
						onPointerDown={stableControlPointerDown}
						onControlPointerDown={stableControlPointPointerDown}
					/>
				)}
				{boxSelectRect && (
					<rect
						x={boxSelectRect.x}
						y={boxSelectRect.y}
						width={boxSelectRect.w}
						height={boxSelectRect.h}
						fill={toRGBA("#1560BD", 0.15)}
						stroke={toRGBA("#1560BD", 0.55)}
						strokeWidth={1.5}
						pointerEvents="none"
					/>
				)}
				{snapInfo && (
					<>
						{snapInfo.snapYpx !== null && (
							<line
								x1={-Math.floor((canvasWidth - FIELD_IMG_DIMENSIONS.w) / 2)} y1={snapInfo.snapYpx}
								x2={Math.ceil(canvasWidth - (canvasWidth - FIELD_IMG_DIMENSIONS.w) / 2)} y2={snapInfo.snapYpx}
								stroke={toRGBA("#ff0000", 0.9)}
								strokeWidth={1.5}
								pointerEvents="none"
							/>
						)}
						{snapInfo.snapXpx !== null && (
							<line
								x1={snapInfo.snapXpx} y1={0}
								x2={snapInfo.snapXpx} y2={FIELD_IMG_DIMENSIONS.h}
								stroke={toRGBA("#ff0000", 0.9)}
								strokeWidth={1.5}
								pointerEvents="none"
							/>
						)}
					</>
				)}
			</svg>
			{showRightPanel && (img.x !== 0 || img.y !== 0 || img.w !== FIELD_IMG_DIMENSIONS.w || img.h !== FIELD_IMG_DIMENSIONS.h) && (
				<HoverButton
					src={homeButton}
					onClick={() => fieldZoomKeyboard(null, setImg, "ZoomReset")}
					className="absolute top-3 right-129 z-10 w-[25px] h-[25px]"
				/>
			)}
		</div>
	);
}