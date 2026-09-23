import checkedBox from "../../assets/icons/toggles/checked-box.svg"
import uncheckedBox from "../../assets/icons/toggles/unchecked-box.svg"

type CheckBoxProps = {
    checked: boolean,
    setChecked: (state: boolean) => void,
    size?: number
    checkedSvg?: string,
    uncheckedSvg?: string,
}

export default function Checkbox({
    checked,
    setChecked,
    size,
    checkedSvg,
    uncheckedSvg
}: CheckBoxProps) {
    const handleMouseDown = () => {
        setChecked(!checked);
    }

    return (
        <div onMouseDown={handleMouseDown} className="hover:cursor-pointer hover:brightness-90" style={{ width: size, height: size }}>
            {checked ?
                <img src={checkedSvg === undefined ? checkedBox : checkedSvg}/> :
                <img src={uncheckedSvg === undefined ? uncheckedBox : uncheckedSvg}/>
            }
        </div>
    )
}