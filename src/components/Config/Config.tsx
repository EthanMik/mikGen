import FileButton from "../File/FileButton";
import SettingsButton from "../Settings/SettingsButton";
import EditButton from "./EditButton";
import FieldButton from "./FieldButton";
import FormatButton from "./FormatButton";
import RobotButton from "./RobotButton";

export default function Config() {
    return (
        <div className="bg-medgray w-[575px] h-[65px] rounded-lg flex items-center gap-1 pl-[15px]">
            <FileButton />
            <EditButton />
            <FieldButton/>
            <FormatButton />
            <RobotButton/>
            <SettingsButton />
            {/* <HelpButton /> */}
        </div>
    );
}