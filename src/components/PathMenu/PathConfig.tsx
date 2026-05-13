import { useState } from "react";
import { usePath, useFormat, useFormatDef, fileFormatStore } from "../../hooks/useFileFormat";
import MotionList, { type ConstantListField } from "./MotionList";
import PathConfigHeader from "./PathHeader";
import {
  FORMAT_REGISTRY,
  updatePathConstants,
  updateDefaultConstants,
  updatePathConstantsByKind,
  type ConstantsRecord,
  type FormatConstants,
  type Format,
} from "../../simulation/FormatDefinition";
import { moveMultipleSegments, buildDraggingIds, MOTION_KIND_SET } from "./PathConfigUtils";
import type { CycleImageButtonProps } from "../Util/CycleButton";

export default function PathConfig() {
  const [path, setPath] = usePath();
  const [draggingIds, setDraggingIds] = useState<string[]>([]);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [isTelemetryOpen, setTelemetryOpen] = useState(false);
  const [format] = useFormat();
  const formatDef = useFormatDef();

  const startDragging = (segmentId: string) => {
    setDraggingIds(buildDraggingIds(path.segments, segmentId));
  };

  const stopDragging = () => {
    setDraggingIds([]);
    setOverIndex(null);
  };

  const name = FORMAT_REGISTRY[format].formatPathName;

  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader name={name} isOpen={isOpen} setOpen={setOpen} isTelemetryOpen={isTelemetryOpen} onTelemetryToggle={() => setTelemetryOpen(p => !p)} />

      <div
        className="mt-[10px] flex-1 min-h-2 overflow-y-auto scrollbar-thin
        flex-col items-center overflow-x-hidden space-y-2 relative"
        onDrop={(e) => {
          if (draggingIds.length === 0) return;
          if (overIndex !== null && overIndex > 0) {
            e.preventDefault();
            moveMultipleSegments(setPath, draggingIds, overIndex);
            stopDragging();
          }
        }}
        onDragOver={(e) => {
          if (overIndex !== null) e.preventDefault();
        }}
      >
        {path.segments.map((c, idx) => {
          const segDef = FORMAT_REGISTRY[format].segments[c.kind];

          const constantsFields: ConstantListField[] = (segDef?.numberInputs ?? []).map(group => ({
            header: group.headerName,
            values: c.constants[group.constantsIdx] as unknown as ConstantsRecord,
            fields: group.fields.map(f => ({ key: String(f.key), label: f.label, units: f.units, input: f.input })),
            defaults: (formatDef.segments[c.kind]?.defaults[group.constantsIdx] ?? formatDef.constants[0]) as unknown as ConstantsRecord,
            onChange: (partial) => updatePathConstants(setPath, c.id, group.constantsIdx, partial as Partial<FormatConstants[Format]>),
            setDefault: (partial) => fileFormatStore.setState(prev => ({
              ...prev,
              formatDef: updateDefaultConstants(prev.formatDef, c.kind, group.constantsIdx, partial as Partial<FormatConstants[Format]>),
            })),
            onApply: (partial) => updatePathConstantsByKind(setPath, c.kind, group.constantsIdx, partial as Partial<FormatConstants[Format]>),
          }));

          const directionFields: CycleImageButtonProps[] = (segDef?.cycleButtons ?? []).map(btn => ({
            imageKeys: btn.keyValues.map(kv => ({ src: kv.srcImg, key: String(kv.value) })) as CycleImageButtonProps["imageKeys"],
            value: String((c.constants[btn.constantsIdx] as unknown as ConstantsRecord)[String(btn.key)]),
            onKeyChange: (newKey: string | null) => {
              const match = btn.keyValues.find(kv => String(kv.value) === newKey);
              if (match !== undefined) {
                updatePathConstants(setPath, c.id, btn.constantsIdx, { [String(btn.key)]: match.value } as Partial<FormatConstants[Format]>);
                const posePartial = btn.poseEffect?.(match.value as never);
                if (posePartial) {
                  setPath(prev => ({
                    ...prev,
                    segments: prev.segments.map(s =>
                      s.id === c.id ? { ...s, pose: { ...s.pose, ...posePartial } } : s
                    ),
                  }));
                }
              }
            },
          }));

          const showDropIndicator = overIndex === idx && draggingIds.length > 0 && idx > 0;

          return (
            <div
              key={c.id}
              className="w-full relative"
              onDragOver={(e) => {
                if (e.defaultPrevented) return;
                e.preventDefault();
                setOverIndex(idx);
              }}
            >
              {idx > 0 && (
                <div
                  className="absolute -top-2 left-0 w-full h-2 z-20"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOverIndex(idx);
                  }}
                />
              )}

              {showDropIndicator && (
                <div className="absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
              )}

              {idx > 0 && MOTION_KIND_SET.has(c.kind) && (
                <MotionList
                  name={segDef?.name ?? ""}
                  field={constantsFields}
                  directionField={directionFields}
                  segmentId={c.id}
                  index={idx}
                  isOpenGlobal={isOpen}
                  isTelemetryOpenGlobal={isTelemetryOpen}
                  draggable={true}
                  onDragStart={() => startDragging(c.id)}
                  onDragEnd={stopDragging}
                  onDragEnter={() => setOverIndex(idx)}
                  draggingIds={draggingIds}
                />
              )}

              {idx === 0 && (
                <MotionList
                  name="Start"
                  field={[]}
                  directionField={[]}
                  segmentId={c.id}
                  index={idx}
                  isOpenGlobal={isOpen}
                  start={true}
                  draggable={false}
                  draggingIds={draggingIds}
                />
              )}
            </div>
          );
        })}

        <div
          className="w-full relative h-4"
          onDragOver={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            setOverIndex(path.segments.length);
          }}
          onDrop={(e) => {
            if (e.defaultPrevented) return;
            e.preventDefault();
            moveMultipleSegments(setPath, draggingIds, path.segments.length);
            stopDragging();
          }}
        >
          {overIndex === path.segments.length && draggingIds.length > 0 && (
            <div className="absolute -top-1 left-2 w-[435px] h-[1px] bg-white rounded-full pointer-events-none z-10" />
          )}
        </div>
      </div>
    </div>
  );
}
