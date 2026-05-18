import FieldMacros from "../../macros/FieldMacros";
import { usePath, useFormat, fileFormatStore } from "../../hooks/useFileFormat";
import Separator from "../Util/Separator";
import ConfigButtonTemplate from "./ConfigButtonTemplate";
import KeybindButton from "../Util/KeybindButton";
import mouseLMB from "../../assets/mouse_left.svg"
import mouseRMB from "../../assets/mouse_right.svg"
import type { SegmentKind } from "../../simulation/FormatDefinition";

export default function AddSegmentButton() {
    const [, setPath] = usePath();
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
        addStrafeSegment,
    } = FieldMacros();

    const seg = (key: SegmentKind) => formatDef.segments[key];
    const segName = (key: SegmentKind) => String(formatDef.segments[key]?.name);
    const visible = (key: SegmentKind) => seg(key) && !seg(key)?.castTo;

    const lmb = <img src={mouseLMB} className="w-[14px] h-[12px]" />;
    const rmb = <img src={mouseRMB} className="w-[10px] h-[12px]" />;

    return (
        <ConfigButtonTemplate title="Segment">
            {visible("pointDrive") && <KeybindButton name={segName("pointDrive")} keybind={lmb} callback={() => addPointDriveSegment(null, format, { x: 0, y: 0 }, setPath)} />}
            {visible("poseDrive") && <KeybindButton name={segName("poseDrive")} keybind={<>Ctrl+{lmb}</>} callback={() => addPoseDriveSegment(null, format, { x: 0, y: 0, angle: 0 }, setPath)} />}
            <Separator name="" />
            {visible("distanceDrive") && <KeybindButton name={segName("distanceDrive")} keybind={<>Alt+{lmb}</>} callback={() => addDistanceSegment(null, format, { x: 0, y: 0, angle: null }, setPath)} />}
            {visible("strafeDrive") && <KeybindButton name={segName("strafeDrive")} keybind={<>Ctrl+Alt+{lmb}</>} callback={() => addStrafeSegment(null, format, { x: 0, y: 0, angle: null }, setPath)} />}
            <Separator name="" />
            {visible("pointTurn") && <KeybindButton name={segName("pointTurn")} keybind={rmb} callback={() => addPointTurnSegment(null, format, setPath)} />}
            {visible("angleTurn") && <KeybindButton name={segName("angleTurn")} keybind={<>Ctrl+{rmb}</>} callback={() => addAngleTurnSegment(null, format, setPath)} />}
            <Separator name="" />
            {visible("pointSwing") && <KeybindButton name={segName("pointSwing")} keybind={<>Alt+{rmb}</>} callback={() => addPointSwingSegment(null, format, setPath)} />}
            {visible("angleSwing") && <KeybindButton name={segName("angleSwing")} keybind={<>Ctrl+Alt+{rmb}</>} callback={() => addAngleSwingSegment(null, format, setPath)} />}
            <Separator name="" />
            {visible("start") && <KeybindButton name={segName("start")} keybind="" callback={() => addStartSegment(format, { x: 0, y: 0, angle: 0 }, setPath)} />}
        </ConfigButtonTemplate>
    );
}
