import { dirHandleStore } from "../../core/FileUtils";
import FileButton from "../File/FileButton";
import SettingsButton from "../Settings/SettingsButton";
import AddSegmentButton from "./AddSegmentButton";
import EditButton from "./EditButton";
import ExportButton from "./ExportButton";
import FieldButton from "./FieldButton";
import FolderButton from "./FolderButton";
import FormatButton from "./FormatButton";
import RobotButton from "./RobotButton";
import ViewButton from "./ViewButton";

type ConfigProps = { fillHeight?: boolean };

export default function Config({ fillHeight = false }: ConfigProps) {
    const dirHandle = dirHandleStore.useStore();
    return (
        <div className={`flex pr-[6px] flex-col gap-2 pl-[6px] ${fillHeight ? "h-full" : ""}`}>
            <div className="w-[180px] flex items-center bg-medgray rounded-sm px-1 py-0.5 gap-1">
                <FileButton />
                <EditButton />
                <ViewButton />
                <SettingsButton />
            </div>
            <div className={`w-[180px] ${fillHeight ? "flex-1" : "h-[685px]"} flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-sm`}>
                {dirHandle !== null && <FolderButton fileName=""/>}
                <AddSegmentButton />
                <RobotButton/>
                <FieldButton/>
                <FormatButton />
                {'showDirectoryPicker' in window && <ExportButton />}
                {/* <HelpButton /> */}
            </div>
        </div>
    );
}