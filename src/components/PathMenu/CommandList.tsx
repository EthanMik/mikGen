import { useEffect, useState } from "react";
import Slider from "../Util/Slider";
import { useCommand } from "../../hooks/useCommands";
import { type Command } from "../../core/Types/Command";
import { makeId } from "../../core/Util";
import type { DropdownItem } from "../Util/Dropdown";
import Dropdown from "../Util/Dropdown";

type CommandListProps = {
    command: Command;
    setCommand: React.Dispatch<React.SetStateAction<Command>>;
}

export default function CommandList({
    setCommand
}: CommandListProps) {
    const [ value, setValue ] = useState(0);
    const [ commands, setCommands ] = useCommand();

    const [ item, setItem ] = useState<DropdownItem>({name: "", id: makeId(10)})

    useEffect(() => {
        if (item.name === "") return;
        setCommand(prev => ({
            ...prev, 
            percent: item.name === "" ? 0 : value,
            name: item.name
        }));

    }, [item, value, commands.length])

    // useEffect(() => {
    // if (item.name === "") return;

    // const timeoutId = setTimeout(() => {
    //     setCommand(prev => ({
    //     ...prev,
    //     percent: value,
    //     name: item.name,
    //     }));
    // }, 300); // run 300ms after value stops changing

    // return () => clearTimeout(timeoutId); // cancel if value changes again
    // }, [item.name, value]);

    return (
        <div className="flex flex-row items-center gap-4">
            <Dropdown 
                width={180} 
                height={30} 
                items={commands}
                setSelectedItem={setItem} 
                defaultText="Add Command..."
                noneText="No Command..."
            />
                
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