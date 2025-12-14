import CommandButton from "./CommandButton";
import FieldButton from "./FieldButton";
import RobotButton from "./RobotButton";

export default function Config() {
    return (
        <div className="bg-medgray w-[575px] h-[65px] rounded-lg flex items-center gap-2 pl-6">
            <span className="text-[20px]">
                File
            </span>
            <FieldButton/>
            <RobotButton/>
            <CommandButton/>
            <span className="text-[20px]">
                Settings
            </span>
        </div>
    );
}