import Checkbox from "./Checkbox";
import Tooltip from "./Tooltip";

type CheckboxButtonProps = {
    name: string;
    checked: boolean;
    label?: string;
    setChecked: (state: boolean) => void;
};

export default function CheckboxButton({ name, checked, setChecked, label }: CheckboxButtonProps) {
    return (
        <div className="flex flex-row pr-2 pl-2 py-0.5 items-center justify-between rounded-sm">
            <span className="text-[14px]">{name}</span>
            <Tooltip label={label ?? ""}>
                <Checkbox checked={checked} setChecked={setChecked} size={18} />
            </Tooltip>
        </div>
    );
}
