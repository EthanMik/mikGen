import { MenuKeybindButton } from "../Util/KeybindButton";
import MenuButtonTemplate from "../Util/MenuButtonTemplate";
import folderIcon from "../../assets/file.svg"
import github from "../../assets/github.svg"
import discord from "../../assets/discord.svg"


export default function HelpButton() {
    return (
        <>
            <MenuButtonTemplate title="Help" width={27}>
                <MenuKeybindButton name="Docs" callback={() => {
                    window.open("https://mikgen.com/docs")
                }}
                    keybind={<img src={folderIcon} className="w-3.5 h-3.5" />}
                    />
                
                <MenuKeybindButton name="Github" callback={() => {
                    window.open("https://github.com/ethanmik/mikgen")
                }}
                    keybind={<img className="w-3.5 h-3.5" src={github}/>}
                />
                
                <MenuKeybindButton name="Discord" callback={() => {
                    window.open("https://discord.gg/UKbzef8GrA")
                }}
                keybind={<img className="w-3.5 h-3.5" src={discord}/>}
                />


            </MenuButtonTemplate>
        </>
    );
}
