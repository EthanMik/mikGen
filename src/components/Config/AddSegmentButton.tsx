import FieldMacros from "../../macros/FieldMacros";
import { updatePath, useFormat, fileFormatStore } from "../../hooks/useFileFormat";
import Section from "../Util/Section";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import { ConfigKeybindButton } from "../Util/KeybindButton";
import type { SegmentKind } from "../../simulation/FormatDefinition";
import Tooltip from "../Util/Tooltip";
import { FIELD_COLORS } from "../Field/FieldColors";

export default function AddSegmentButton() {
    // The path is only needed inside click handlers; reading it at call time keeps this
    // always-mounted menu from re-rendering on every path write
    const setPath = updatePath;
    const getPath = () => fileFormatStore.getState().path;
    const [format] = useFormat();
    const formatDef = fileFormatStore.useSelector(s => s.formatDef);

    const {
        addPointDriveSegment,
        addPointTurnSegment,
        addPoseDriveSegment,
        addPoseDrive2Segment,
        addAngleTurnSegment,
        addAngleSwingSegment,
        addPointSwingSegment,
        addDistanceSegment,
        addStartSegment,
        addWaitSegment,
        addStrafeSegment,
        addBezierSegment,
    } = FieldMacros();

    const seg = (key: SegmentKind) => formatDef.segments[key];
    const segName = (key: SegmentKind) => String(formatDef.segments[key]?.name);
    const segColor = (key: SegmentKind) => FIELD_COLORS.segmentColors[key]?.[0]?.baseColor;
    const visible = (key: SegmentKind) => seg(key) && !seg(key)?.castTo;

    return (
        <ConfigButtonTemplate title="Segment">
            {visible("pointDrive") && <Tooltip label="Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("pointDrive")} color={segColor("pointDrive")} callback={() => addPointDriveSegment(null, format, { x: 0, y: 0 }, setPath, getPath())} />
            </Tooltip>}
            {visible("poseDrive") && <Tooltip label="Ctrl+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("poseDrive")} color={segColor("poseDrive")} callback={() => addPoseDriveSegment(null, format, { x: 0, y: 0, angle: 0 }, setPath, getPath())} />
            </Tooltip>}
            {visible("poseDrive2") && (
                <ConfigKeybindButton name={segName("poseDrive2")} color={segColor("poseDrive2")} callback={() => addPoseDrive2Segment(null, format, { x: 0, y: 0, angle: 0 }, setPath, getPath())} />
            )}
            {visible("bezierCurve") && <Tooltip label="Shift+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("bezierCurve")} color={segColor("bezierCurve")} callback={() => addBezierSegment(null, format, { x: 0, y: 0, angle: null }, setPath, getPath())} />
            </Tooltip>}
            {(visible("distanceDrive") || visible("strafeDrive")) && <Section />}
            {visible("distanceDrive") && <Tooltip label="Alt+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("distanceDrive")} color={segColor("distanceDrive")} callback={() => addDistanceSegment(null, format, { x: 0, y: 0, angle: null }, setPath, getPath())} />
            </Tooltip>}
            {visible("strafeDrive") && <Tooltip label="Ctrl+Alt+Left Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("strafeDrive")} color={segColor("strafeDrive")} callback={() => addStrafeSegment(null, format, { x: 0, y: 0, angle: null }, setPath, getPath())} />
            </Tooltip>}
            <Section />
            {visible("pointTurn") && <Tooltip label="Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("pointTurn")} color={segColor("pointTurn")} callback={() => addPointTurnSegment(null, format, setPath, getPath())} />
            </Tooltip>}
            {visible("angleTurn") && <Tooltip label="Ctrl+Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("angleTurn")} color={segColor("angleTurn")} callback={() => addAngleTurnSegment(null, format, setPath, getPath())} />
            </Tooltip>}
            {(visible("pointSwing") || visible("angleSwing")) && <Section />}
            {visible("pointSwing") && <Tooltip label="Alt+Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("pointSwing")} color={segColor("pointSwing")} callback={() => addPointSwingSegment(null, format, setPath, getPath())} />
            </Tooltip>}
            {visible("angleSwing") && <Tooltip label="Ctrl+Alt+Right Click" placement="right" speed="fast">
                <ConfigKeybindButton name={segName("angleSwing")} color={segColor("angleSwing")} callback={() => addAngleSwingSegment(null, format, setPath, getPath())} />
            </Tooltip>}
            <Section />
            {visible("start") && <ConfigKeybindButton name={segName("start")} color={segColor("start")} callback={() => addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath)} />}
            {visible("wait") && <ConfigKeybindButton name={segName("wait")} color={segColor("wait")} callback={() => addWaitSegment(format, setPath, getPath())} />}
        </ConfigButtonTemplate>
    );
}
