import { useCallback, useEffect, useState } from "react";
import Dropdown from "../Util/DropDown";
import Slider from "../Util/Slider";
import { useCommand } from "../../hooks/useCommands";
import { createCommand, type Command } from "../../core/Command";

type CommandListProps = {
    command: Command;
    setCommand: React.Dispatch<React.SetStateAction<Command>>;
}

export default function CommandList({
    setCommand
}: CommandListProps) {
    const [ value, setValue ] = useState(0);
    const [ commands, setCommands ] = useCommand();

    useEffect(() => (
        setCommand(prev => ({
            ...prev, percent: value
        }))
    ), [value])

    return (
        <div className="flex flex-row items-center gap-4">
            <Dropdown width={180} height={35} items={commands} setCommand={setCommand} text="Add Command..."/>
            <Slider 
                sliderWidth={150}
                sliderHeight={5}
                knobHeight={16}
                knobWidth={16}
                value={value} 
                setValue={setValue}
            />
            <span>
                {value.toFixed(0)}%
            </span>
        </div>

    )
}