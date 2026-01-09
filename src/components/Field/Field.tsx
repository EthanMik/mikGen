import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { robotConstantsStore } from "../../core/Robot";
import type { Coordinate } from "../../core/Types/Coordinate";
import { type Path } from "../../core/Types/Path";
import homeButton from "../../assets/home.svg"
import { segmentsEqual, type Segment } from "../../core/Types/Segment";
import { FIELD_IMG_DIMENSIONS, FIELD_REAL_DIMENSIONS, toInch, toPX, vector2Add, vector2Subtract, type Rectangle } from "../../core/Util";
import { usePath } from "../../hooks/usePath";
import { usePathVisibility } from "../../hooks/usePathVisibility";
import { usePose } from "../../hooks/usePose";
import { useRobotVisibility } from "../../hooks/useRobotVisibility";
import { PathSimMacros } from "../../macros/PathSimMacros";
import FieldMacros from "../../macros/FieldMacros";
import { useFormat } from "../../hooks/useFormat";
import { useRobotPose } from "../../hooks/useRobotPose";
import { getPressedPositionInch, pointerToSvg } from "./FieldUtils";
import RobotLayer from "./RobotLayer";
import PathLayer from "./PathLayer";
import ControlsLayer from "./ControlsLayer";
import CommandLayer from "./CommandLayer";
import { getFieldSrcFromKey, useField } from "../../hooks/useField";

export default function Field() {
  const [ img, setImg ] = useState<Rectangle>( { x: 0, y: 0, w: 575, h: 575 })
  const [ fieldKey ] = useField();

  const svgRef = useRef<SVGSVGElement | null>(null);

  const [path, setPath] = usePath();
  const [pose] = usePose();
  const [robotPose] = useRobotPose();
  const robot = useSyncExternalStore(robotConstantsStore.subscribe, robotConstantsStore.getState);
  const [robotVisible, setRobotVisibility] = useRobotVisibility();
  const [pathVisible] = usePathVisibility();
  const [format] = useFormat();

  const pathStorageRef = useRef<Path[]>([]);
  const pathStoragePtr = useRef<number>(0);
  const undo = useRef(false);
  const prevPath = useRef<Path>(path);
  const startDrag = useRef(false);
  const radius = 17;

  type dragProps = { dragging: boolean; lastPos: Coordinate };
  const [ drag, setDrag] = useState<dragProps>({ dragging: false, lastPos: { x: 0, y: 0 } });
  const [ middleMouseDown, setMiddleMouseDown ] = useState(false)
  const fieldDragRef = useRef<Coordinate>( { x: 0, y: 0} );
  const isFieldDragging = useRef(false);

  const pathChanged = (): boolean => {
    if (prevPath.current.segments.length !== path.segments.length) return true;
    for (let i = 0; i < path.segments.length; i++) {
      if (!segmentsEqual(path.segments[i], prevPath.current.segments[i])) return true;
    }
    return false;
  };

  useEffect(() => {
    const changed = pathChanged();

    if (undo.current) {
      undo.current = false;
      prevPath.current = path;
      return;
    }

    if (changed && pathStoragePtr.current < pathStorageRef.current.length - 1) {
      pathStorageRef.current = pathStorageRef.current.slice(0, pathStoragePtr.current + 1);
    }

    if (changed && (!drag.dragging || startDrag.current)) {
      startDrag.current = false;
      pathStorageRef.current = [
        ...pathStorageRef.current.slice(0, pathStorageRef.current.length - 1),
        prevPath.current,
        path,
      ];
      pathStoragePtr.current = pathStorageRef.current.length - 1;
    }

    prevPath.current = path;
  }, [path, drag.dragging]);

  const {
    moveControl, moveHeading, deleteControl, unselectPath, selectPath,
    selectInversePath, undoPath, redoPath, addPointDriveSegment,
    addPointTurnSegment, addPoseDriveSegment, addAngleTurnSegment,
    addAngleSwingSegment, addPointSwingSegment, fieldZoomKeyboard, fieldZoomWheel, 
    fieldPanWheel
  } = FieldMacros();

  const { toggleRobotVisibility } = PathSimMacros();

  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      const target = evt.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT") return;
      unselectPath(evt, setPath);
      moveControl(evt, setPath);
      deleteControl(evt, setPath);
      selectPath(evt, setPath);
      selectInversePath(evt, setPath);
      undoPath(evt, undo, pathStorageRef, pathStoragePtr, setPath);
      redoPath(evt, undo, pathStorageRef, pathStoragePtr, setPath);
      fieldZoomKeyboard(evt, setImg);
      toggleRobotVisibility(evt, setRobotVisibility);
    };

    const handleWheelDown = (evt: WheelEvent) => {
      const target = evt.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT") return;
      moveHeading(evt, setPath);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheelDown, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheelDown);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg === null) return;

    const onWheel = (evt: WheelEvent) => {
      fieldZoomWheel(evt, setImg, svgRef);
      fieldPanWheel(evt, setImg);
    };

    svg.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      svg.removeEventListener("wheel", onWheel);
    };
  }, []);
    

    const handleFieldPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
        if (evt.button !== 1) return;

        evt.preventDefault();
        svgRef.current?.setPointerCapture(evt.pointerId);

        fieldDragRef.current = { x: evt.clientX, y: evt.clientY };
    };

    const handleFieldDrag = (evt: React.PointerEvent<SVGSVGElement>) => {
        if (!(evt.buttons & 4)) return;

        const dx = evt.clientX - fieldDragRef.current.x;
        const dy = evt.clientY - fieldDragRef.current.y;

        setImg((prev) => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
        }));

        fieldDragRef.current = { x: evt.clientX, y: evt.clientY };
    };

  const handlePointerMove = (evt: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.dragging || !svgRef.current) return;

    const posSvg = pointerToSvg(evt, svgRef.current);
    const delta = vector2Subtract(posSvg, drag.lastPos);

    const next: Segment[] = (
      path.segments.map((c) => {
        if (!c.selected || c.locked || c.pose.x === null || c.pose.y === null) return c;

        const currentPx = toPX({ x: c.pose.x, y: c.pose.y }, FIELD_REAL_DIMENSIONS, img);
        const newPx = vector2Add(currentPx, delta);
        const newInch = toInch(newPx, FIELD_REAL_DIMENSIONS, img);

        // if (evt.ctrlKey) {
        //   newInch = {
        //     x: Math.round(newInch.x),
        //     y: Math.round(newInch.y)
        //   }
        // }

        return { ...c, pose: { ...c.pose, x: newInch.x, y: newInch.y } };
      })
    );

    setDrag((prev) => ({ ...prev, lastPos: posSvg }));
    setPath(prev => ({
      ...prev,
      segments: next
    }));
  };

  const endDrag = () => {
    isFieldDragging.current = false;
    setDrag({ dragging: false, lastPos: { x: 0, y: 0 } });
  }

  const selectSegment = (controlId: string, shifting: boolean) => {
    setPath((prevSegment) => {
      const prevSelectedIds = prevSegment.segments
        .filter((c) => c.selected)
        .map((c) => c.id);

      let nextSelectedIds: string[];
      if (!shifting && prevSelectedIds.length <= 1) {
        nextSelectedIds = [controlId];
      } else if (shifting && prevSegment.segments.find((c) => c.id === controlId && c.selected)) {
        nextSelectedIds = prevSelectedIds.filter((c) => c !== controlId);
      } else {
        nextSelectedIds = [...prevSelectedIds, controlId];
      }

      return {
        ...prevSegment,
        segments: prevSegment.segments.map((c) => ({
          ...c,
          selected: !c.locked && nextSelectedIds.includes(c.id),
        })),
      };
    });
  };

  const handleControlPointerDown = (evt: React.PointerEvent<SVGGElement>, controlId: string) => {
    if (evt.button !== 0 || !svgRef.current) return;
    evt.stopPropagation();
    (evt.currentTarget as Element).setPointerCapture(evt.pointerId);

    const posSvg = pointerToSvg(evt, svgRef.current);
    if (!drag.dragging) selectSegment(controlId, evt.shiftKey);

    startDrag.current = true;
    setDrag({ dragging: true, lastPos: posSvg });
  };

  const endSelection = () => {
    setPath((prev) => ({
      ...prev,
      segments: prev.segments.map((c) => ({ ...c, selected: false })),
    }));
  };

  const handleBackgroundPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
    if ((evt.button !== 0 && evt.button !== 2) || pathVisible) return;

    const selectedCount = path.segments.filter((c) => c.selected).length;
    if (selectedCount > 1) {
      endSelection();
      return;
    }

    const pos = getPressedPositionInch(evt, svgRef.current, img);

    if (path.segments.length <= 0) {
      addPoseDriveSegment(format, { x: pos.x, y: pos.y, angle: 0 }, setPath);
      return;
    }

    if (!evt.ctrlKey && evt.button === 0) addPointDriveSegment(format, pos, setPath);
    else if (evt.ctrlKey && evt.button === 0) addPoseDriveSegment(format, { x: pos.x, y: pos.y, angle: 0 }, setPath);
    else if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 2) addPointTurnSegment(format, setPath);
    else if (evt.ctrlKey && !evt.altKey && !evt.shiftKey && evt.button === 2) addAngleTurnSegment(format, setPath);
    else if (!evt.ctrlKey && evt.altKey && evt.button === 2) addPointSwingSegment(format, setPath);
    else if (evt.ctrlKey && evt.altKey && evt.button === 2) addAngleSwingSegment(format, setPath);
  };

  return (
    <div tabIndex={0} onMouseLeave={endDrag}>
      <svg
        ref={svgRef}
        viewBox={`${0} ${0} ${FIELD_IMG_DIMENSIONS.w} ${FIELD_IMG_DIMENSIONS.h}`}
        width={FIELD_IMG_DIMENSIONS.w}
        height={FIELD_IMG_DIMENSIONS.h}
        className={`${middleMouseDown ? `cursor-grab` : "cursor-default"}`}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onPointerDown={(e) => {
          if (e.button === 1) {
            setMiddleMouseDown(true);
          }
          handleFieldPointerDown(e);
          handleBackgroundPointerDown(e);
        }}
        onPointerMove={(e) => {
          setMiddleMouseDown((e.buttons & 4) !== 0);    
          handlePointerMove(e);
          handleFieldDrag(e);
        }}
        onPointerUp={() => {
          setMiddleMouseDown(false)
          endDrag()
        }}
      >
        <image href={getFieldSrcFromKey(fieldKey)} x={img.x} y={img.y} width={img.w} height={img.h} />
        
        <PathLayer path={path} img={img} visible={pathVisible} />

        <RobotLayer
          img={img}
          pose={pose}
          robotPose={robotPose}
          robotConstants={robot}
          visible={robotVisible}
          path={path}
        />

        <CommandLayer path={path} img={img} visible={pathVisible} />

        {!pathVisible && (
          <ControlsLayer
            path={path}
            img={img}
            radius={radius}
            format={format}
            onPointerDown={handleControlPointerDown}
          />
        )}
      </svg>
        {(img.x !== 0 || img.y !== 0 || img.w !== FIELD_IMG_DIMENSIONS.w || img.h !== FIELD_IMG_DIMENSIONS.h) && (
          <button
            onClick={() => setImg(prev => ({ ...prev, x: 0, y: 0, w: 575, h: 575 }))}
            className="
              absolute top-22 right-129
              flex
              opacity-50
              rounded-sm
              items-center
              justify-center
              w-[20px]
              h-[20px]
              bg-medgray
              z-50
              cursor-pointer
              transition
            "
          >
            <img
              className="
              w-[15px]
              h-[15px]" 
              src={homeButton}>
            
            </img>
          </button>
        )}
    </div>
  );
}