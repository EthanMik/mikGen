import Checkbox from "./Checkbox";

type CheckboxButtonProps = {
    name: string;
    checked: boolean;
    setChecked: (state: boolean) => void;
};

export default function CheckboxButton({ name, checked, setChecked }: CheckboxButtonProps) {
    return (
        <div className="flex flex-row pr-1 pl-2 py-0.5 items-center justify-between rounded-sm">
            <span className="text-[14px]">{name}</span>
            <Checkbox checked={checked} setChecked={setChecked} size={18} />
        </div>
    );
}
