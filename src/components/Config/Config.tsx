import FileButton from "../File/FileButton";
import SettingsButton from "../Settings/SettingsButton";
import AddSegmentButton from "./AddSegmentButton";
import EditButton from "./EditButton";
import ExportButton from "./ExportButton";
import FieldButton from "./FieldButton";
import FormatButton from "./FormatButton";
import RobotButton from "./RobotButton";
import ViewButton from "./ViewButton";

export default function Config() {
    return (
        <div className="flex pr-[6px] flex-col gap-2">
            <div className="w-[180px] flex bg-medgray rounded-sm pt-1 pr-1 pl-1 pb-1 gap-1">
                <FileButton />
                <EditButton />
                <ViewButton />
            </div>
            <div className="w-[180px] h-[685px] flex flex-col overflow-y-auto scrollbar-thin rounded-sm">
                <AddSegmentButton />
                <RobotButton/>
                <FieldButton/>
                <FormatButton />
                <ExportButton />
                <SettingsButton />
                {/* <HelpButton /> */}
            </div>
        </div>
    );
}