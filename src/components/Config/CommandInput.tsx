import { useState } from "react";
import { useCommand } from "../../hooks/useCommands";
import enter from "../../assets/enter.svg";
import { createCommand } from "../../core/Types/Command";

type CommandInputProps = {
    width: number,
    height: number,
}

export function CommmandInput({
    width,
    height
}: CommandInputProps) {
    const [ value, SetValue ] = useState<string>('');
    const [ edit, setEdit ] = useState<string | null>(null);
    const [ commands, setCommand ] = useCommand();

    const display: string = edit !== null ? edit : value

    const resetValue = () => {
        setEdit("");
    }

    const executeInput = () => {
        if (edit === null || edit === "" || commands.find((c) => c.name === edit)) return;
        SetValue(edit);

        setCommand((prev) => [...prev, createCommand(edit)])
        cancel();
    }

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEdit(evt.target.value)
    }

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {        
        if (evt.key === "Enter" || evt.key == "Tab") {
            executeInput()
        }
    }
    
    const handleOnClick = () => {
        executeInput();
    }

    const cancel = () => {
        resetValue();
    }

    return (
        <div className="flex flex-row gap-3">
            <input 
                className={`bg-blackgray
                outline-2 outline-transparent rounded-lg text-center text-white
                hover:outline-lightgray
                `}
                
                maxLength={20}

                style={{
                    fontSize: '16px', 
                    width: width, 
                    height : height,
                }}
                type="text"
                value={ display }
    
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <button className="hover:bg-blackgrayhover rounded-sm cursor-pointer"
                onClick={handleOnClick}>
                <img src={enter}/>
            </button>
        </div>
    );
}