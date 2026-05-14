import checkedBox from "../../assets/checked-box.svg"
import uncheckedBox from "../../assets/unchecked-box.svg"

type CheckBoxProps = {
    checked: boolean,
    setChecked: (state: boolean) => void
}

export default function Checkbox({
    checked,
    setChecked
}: CheckBoxProps) {
    const handleMouseDown = () => {
        setChecked(!checked);
    }

    return (
        <div onMouseDown={handleMouseDown} className="hover:cursor-pointer">
            {checked ?
                <img src={checkedBox}/> :
                <img src={uncheckedBox}/>
            }
        </div>
    )
}