/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type SetStateAction } from "react";
import { usePath } from "../../hooks/usePath";
import MotionList, { type ConstantListField } from "./MotionList";
import PathConfigHeader from "./PathHeader";
import type { Path } from "../../core/Types/Path";

export type Slot = "drive" | "heading" | "turn";

const updateConstants = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  slot: Slot,
  partial: Partial<any>
) => {
  setPath((prev) => ({
    ...prev,
    segments: prev.segments.map((s) => {
      if (s.id !== segmentId) return s;

      const constants: any = s.constants;
      const bucket = constants?.[slot];
      if (!bucket) return s;

      return {
        ...s,
        constants: {
          ...constants,
          [slot]: {
            ...bucket,
            ...(partial as any),
          },
        },
      };
    }),
  }));
};

const createDrivePIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  driveConstants: any,
  headingConstants: any
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "drive", partial);

  const onHeadingChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "heading", partial);

  return [
    {
      header: "Exit Conditions",
      slot: "drive",
      values: driveConstants,
      fields: [
        { key: "settleError", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
      ],
      onChange: onDriveChange,
    },
    {
      header: "Drive Constants",
      slot: "drive",
      values: driveConstants,
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onDriveChange,
    },
    {
      header: "Heading Constants",
      slot: "heading",
      values: headingConstants,
      fields: [
        { key: "maxSpeed", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onHeadingChange,
    },
  ];
};

const createDrivePosePIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  driveConstants: any,
  headingConstants: any
): ConstantListField[] => {

  const onDriveChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "drive", partial);

  const onHeadingChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "heading", partial);

  return [
    {
      header: "Exit Conditions",
      values: driveConstants,
      slot: "drive",
      fields: [
        { key: "settleError", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
      ],
      onChange: onDriveChange,
    },
    {
      header: "Drive Constants",
      values: driveConstants,
      slot: "drive",
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
        { key: "lead", label: "Lead", input: { bounds: [0, 1], stepSize: .1, roundTo: 2 } },
        { key: "setback", label: "Setback", input: { bounds: [0, 100], stepSize: .5, roundTo: 1 } },
      ],
      onChange: onDriveChange,
    },
    {
      header: "Heading Constants",
      values: headingConstants,
      slot: "heading",
      fields: [
        { key: "maxSpeed", label: "Max Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onHeadingChange,
    },
  ];
};

const createTurnPIDGroup = (
  setPath: React.Dispatch<SetStateAction<Path>>,
  segmentId: string,
  turnConstants: any
): ConstantListField[] => {

  const onTurnChange = (partial: Partial<any>) =>
    updateConstants(setPath, segmentId, "turn", partial);

  return [
    {
      header: "Exit Conditions",
      values: turnConstants,
      slot: "turn",
      fields: [
        { key: "settleError", label: "Settle Error", input: { bounds: [0, 100], stepSize: 0.5, roundTo: 2 } },
        { key: "settleTime", label: "Settle Time", input: { bounds: [0, 9999], stepSize: 10, roundTo: 0 } },
        { key: "timeout", label: "Timeout", input: { bounds: [0, 9999], stepSize: 100, roundTo: 0 } },
        { key: "minSpeed", label: "Min Speed", input: { bounds: [0, 1], stepSize: 0.1, roundTo: 2 } },
      ],
      onChange: onTurnChange,
    },
    {
      header: "Turn Constants",
      values: turnConstants,
      slot: "turn",
      fields: [
        { key: "kp", label: "kP", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "ki", label: "kI", input: { bounds: [0, 100], stepSize: 0.01, roundTo: 5 } },
        { key: "kd", label: "kD", input: { bounds: [0, 100], stepSize: 0.1, roundTo: 5 } },
        { key: "starti", label: "Starti", input: { bounds: [0, 100], stepSize: 1, roundTo: 2 } },
      ],
      onChange: onTurnChange,
    },
  ];
};


export default function PathConfig() {
  const [ path, setPath ] = usePath();
  const [ isOpen, setOpen ] = useState(false);
  
  return (
    <div className="bg-medgray w-[500px] h-[650px] rounded-lg p-[15px] flex flex-col">
      <PathConfigHeader isOpen={isOpen} setOpen={setOpen} />

      <div className="mt-[10px] flex-1 min-h-2 overflow-y-auto 
       flex-col items-center overflow-x-hidden space-y-2">
        {path.segments.map((c, idx) => (
          <>
            
            {/* DRIVE */}
            {idx > 0 && (c.kind === "pointDrive" || c.kind === "poseDrive") && (
              <MotionList
                name="Drive"
                startSpeed={c.constants.drive.maxSpeed * 100}
                field={
                  c.kind === "poseDrive" ? 
                  createDrivePosePIDGroup(setPath, c.id, c.constants.drive, c.constants.heading) :
                  createDrivePIDGroup(setPath, c.id, c.constants.drive, c.constants.heading)
                }
                segmentId={c.id}
                isOpenGlobal={isOpen}
              />
            )}

            {/* TURN */}
            {idx > 0 && (c.kind === "angleTurn" || c.kind === "pointTurn") && (
              <MotionList
                name="Turn"
                startSpeed={c.constants.turn.maxSpeed * 100}
                field={createTurnPIDGroup(setPath, c.id, c.constants.turn)}
                segmentId={c.id}
                isOpenGlobal={isOpen}
              />
            )}

            {/* START SEGMENT */}
            {idx === 0 && (
              <MotionList
                name="Start"
                startSpeed={0}
                field={[]}
                segmentId={c.id}
                isOpenGlobal={isOpen}
              />
            )}
            
          </>
        ))}

      </div>
    </div>
  );
}