import Field from "./Field";
import { FIELD_IMG_DIMENSIONS } from "../core/Util";

export default function FieldContainer({src}: {src: string}) {

  return (
    <Field
      src={src}
      img={FIELD_IMG_DIMENSIONS}
      radius={15}
    />
  );
}