import FieldMacros from "../../macros/FieldMacros";
import { usePath, useFormat, fileFormatStore } from "../../hooks/useFileFormat";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigKeybindButton } from "../Util/KeybindButton";
import type { SegmentKind } from "../../simulation/FormatDefinition";

export default function AddSegmentButton() {
    const [path, setPath] = usePath();
    const [format] = useFormat();
    const formatDef = fileFormatStore.useSelector(s => s.formatDef);

    const {
        addPointDriveSegment,
        addPointTurnSegment,
        addPoseDriveSegment,
        addAngleTurnSegment,
        addAngleSwingSegment,
        addPointSwingSegment,
        addDistanceSegment,
        addStartSegment,
        addWaitSegment,
        addStrafeSegment,
    } = FieldMacros();

    const seg = (key: SegmentKind) => formatDef.segments[key];
    const segName = (key: SegmentKind) => String(formatDef.segments[key]?.name);
    const visible = (key: SegmentKind) => seg(key) && !seg(key)?.castTo;

    return (
        <ConfigButtonTemplate title="Segment">
            {visible("pointDrive") && <ConfigKeybindButton name={segName("pointDrive")} callback={() => addPointDriveSegment(null, format, { x: 0, y: 0 }, setPath, path)} />}
            {visible("poseDrive") && <ConfigKeybindButton name={segName("poseDrive")} callback={() => addPoseDriveSegment(null, format, { x: 0, y: 0, angle: 0 }, setPath, path)} />}
            {(visible("distanceDrive") || visible("strafeDrive")) && <Section />}
            {visible("distanceDrive") && <ConfigKeybindButton name={segName("distanceDrive")} callback={() => addDistanceSegment(null, format, { x: 0, y: 0, angle: null }, setPath, path)} />}
            {visible("strafeDrive") && <ConfigKeybindButton name={segName("strafeDrive")} callback={() => addStrafeSegment(null, format, { x: 0, y: 0, angle: null }, setPath, path)} />}
            <Section />
            {visible("pointTurn") && <ConfigKeybindButton name={segName("pointTurn")} callback={() => addPointTurnSegment(null, format, setPath, path)} />}
            {visible("angleTurn") && <ConfigKeybindButton name={segName("angleTurn")} callback={() => addAngleTurnSegment(null, format, setPath, path)} />}
            {(visible("pointSwing") || visible("angleSwing")) && <Section />}
            {visible("pointSwing") && <ConfigKeybindButton name={segName("pointSwing")} callback={() => addPointSwingSegment(null, format, setPath, path)} />}
            {visible("angleSwing") && <ConfigKeybindButton name={segName("angleSwing")} callback={() => addAngleSwingSegment(null, format, setPath, path)} />}
            <Section />
            {visible("start") && <ConfigKeybindButton name={segName("start")} callback={() => addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath)} />}
            {visible("wait") && <ConfigKeybindButton name={segName("wait")} callback={() => addWaitSegment(format, setPath, path)} />}
        </ConfigButtonTemplate>
    );
}
