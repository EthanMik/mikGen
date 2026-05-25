import checkedBox from "../../assets/checked-box.svg"
import uncheckedBox from "../../assets/unchecked-box.svg"

type CheckBoxProps = {
    checked: boolean,
    setChecked: (state: boolean) => void,
    size?: number
}

export default function Checkbox({
    checked,
    setChecked,
    size
}: CheckBoxProps) {
    const handleMouseDown = () => {
        setChecked(!checked);
    }

    return (
        <div onMouseDown={handleMouseDown} className="hover:cursor-pointer hover:brightness-90" style={{ width: size, height: size }}>
            {checked ?
                <img src={checkedBox}/> :
                <img src={uncheckedBox}/>
            }
        </div>
    )
}