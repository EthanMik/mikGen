import FileButton from "../File/FileButton";
import SettingsButton from "../Settings/SettingsButton";
import AddSegmentButton from "./AddSegmentButton";
import EditButton from "./EditButton";
import FieldButton from "./FieldButton";
import FormatButton from "./FormatButton";
import RobotButton from "./RobotButton";

export default function Config() {
    return (
        <div className=" w-[210px] h-[725px] flex flex-col gap-2 overflow-y-auto scrollbar-thin pr-[6px]">
            <FileButton />
            <EditButton />
            <AddSegmentButton />
            <FieldButton/>
            <FormatButton />
            <RobotButton/>
            <SettingsButton />
            {/* <HelpButton /> */}
        </div>
    );
}