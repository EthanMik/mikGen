import CommandButton from "./CommandButton";
import FieldButton from "./FieldButton";
import FormatButton from "./FormatButton";
import RobotButton from "./RobotButton";

export default function Config() {
    return (
        <div className="bg-medgray w-[575px] h-[65px] rounded-lg flex items-center gap-1 pl-[15px]">
            <span className="text-[20px] px-2 py-1">
                File
            </span>
            <FieldButton/>
            <FormatButton />
            <RobotButton/>
            <CommandButton/>
            <span className="text-[20px] px-2 py-1">
                Settings
            </span>
        </div>
    );
}