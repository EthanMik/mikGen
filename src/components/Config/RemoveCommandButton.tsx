import { useCommand } from "../../hooks/useCommands";
import cross from "../../assets/cross.svg"

type RemoveCommandButtonProps = {
    commandId: string
}

export function RemoveCommandButton({commandId}: RemoveCommandButtonProps) {
    const [ , setCommand ] = useCommand();

    const handleDeleteOnClick = () => {
        setCommand((prev) => prev.filter((c) => c.id !== commandId))
    }

    return (
        <div className="w-[25px] h-[25px]">
            <button 
                onClick={handleDeleteOnClick}
                className="cursor-pointer rounded-sm hover:bg-blackgrayhover"
            >
                <img src={cross}
                />
            </button>

        </div>

    );
}
