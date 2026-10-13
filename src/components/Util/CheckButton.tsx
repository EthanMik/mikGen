import check from "../../assets/icons/ui/check.svg"

type CheckButtonProps = {
    name: string,
    checked: boolean,
    setChecked: (state: boolean) => void;
    src?: string;
}

export function MenuCheckButton({
    name, checked, setChecked,
}: CheckButtonProps) {
    return (
        <button
            onClick={() => setChecked(true)}
            className={`flex pr-2 pl-2 py-0.5 items-center justify-between hover:bg-blackgrayhover cursor-pointer rounded-sm `}>
            <span className={`text-[14px]`}>{name}</span>
            {checked && (
                <img
                    src={check}
                    className="w-3 h-3"
                >
                </img>
            )}
        </button>
    )
}

export function ConfigCheckButton({
    name, checked, setChecked, src 
}: CheckButtonProps) {
    return (
            <button
                className={`relative flex w-full items-center justify-between px-2 py-1 bg-medgray hover:brightness-92 cursor-pointer rounded-sm ${checked ? "bg-medlightgray" : ""}`}
                onClick={() => setChecked(true)}
            >
                <span className="text-[14px]">{name}</span>
                {(checked || src) && (
                    <img
                        src={checked ? check : src}
                        style={{
                            width: `${src && !checked ? "16px" : "12px" }`,
                            height: `${src && !checked ? "16px" : "12px" }`,
                        }}
                        className="opacity-90"
                    >
                    </img>
                )}
            </button>
    )
}