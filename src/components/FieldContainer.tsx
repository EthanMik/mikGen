import Field from "./Field";
import { FIELD_IMG_DIMENSIONS } from "../core/Util";
import { useField } from "../hooks/useField";

export default function FieldContainer() {
  const { field } = useField();

  return (
    <Field
      src={field}
      img={FIELD_IMG_DIMENSIONS}
      radius={17}
    />
  );
}