import FieldMacros from "../../macros/FieldMacros";
import { usePath, useFormat, fileFormatStore } from "../../hooks/useFileFormat";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigKeybindButton } from "../Util/KeybindButton";
import type { SegmentKind } from "../../simulation/FormatDefinition";
import Tooltip from "../Util/Tooltip";

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
            {visible("pointDrive") && <Tooltip label="Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("pointDrive")} callback={() => addPointDriveSegment(null, format, { x: 0, y: 0 }, setPath, path)} />
            </Tooltip>}
            {visible("poseDrive") && <Tooltip label="Ctrl+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("poseDrive")} callback={() => addPoseDriveSegment(null, format, { x: 0, y: 0, angle: 0 }, setPath, path)} />
            </Tooltip>}
            {(visible("distanceDrive") || visible("strafeDrive")) && <Section />}
            {visible("distanceDrive") && <Tooltip label="Alt+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("distanceDrive")} callback={() => addDistanceSegment(null, format, { x: 0, y: 0, angle: null }, setPath, path)} />
            </Tooltip>}
            {visible("strafeDrive") && <Tooltip label="Ctrl+Alt+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("strafeDrive")} callback={() => addStrafeSegment(null, format, { x: 0, y: 0, angle: null }, setPath, path)} />
            </Tooltip>}
            <Section />
            {visible("pointTurn") && <Tooltip label="Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("pointTurn")} callback={() => addPointTurnSegment(null, format, setPath, path)} />
            </Tooltip>}
            {visible("angleTurn") && <Tooltip label="Ctrl+Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("angleTurn")} callback={() => addAngleTurnSegment(null, format, setPath, path)} />
            </Tooltip>}
            {(visible("pointSwing") || visible("angleSwing")) && <Section />}
            {visible("pointSwing") && <Tooltip label="Alt+Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("pointSwing")} callback={() => addPointSwingSegment(null, format, setPath, path)} />
            </Tooltip>}
            {visible("angleSwing") && <Tooltip label="Ctrl+Alt+Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("angleSwing")} callback={() => addAngleSwingSegment(null, format, setPath, path)} />
            </Tooltip>}
            <Section />
            {visible("start") && <ConfigKeybindButton name={segName("start")} callback={() => addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath)} />}
            {visible("wait") && <ConfigKeybindButton name={segName("wait")} callback={() => addWaitSegment(format, setPath, path)} />}
        </ConfigButtonTemplate>
    );
}
