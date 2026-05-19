import styled from "styled-components";
import { undraggableOnDesktop } from "../styles";

type Props = {
  width?: number | string;
  height?: number | string;
  size?: number;
  type?: "button" | "submit" | "reset";
};

const NudeButton = styled.button.attrs((props: Props) => ({
  type: "type" in props ? props.type : "button",
}))<Props>`
  width: ${(props) =>
    typeof props.width === "string"
      ? props.width
      : `${props.width || props.size || 24}px`};
  height: ${(props) =>
    typeof props.height === "string"
      ? props.height
      : `${props.height || props.size || 24}px`};
  background: none;
  border-radius: 4px;
  display: inline-block;
  line-height: 0;
  border: 0;
  padding: 0;
  cursor: var(--pointer);
  user-select: none;
  color: inherit;
  ${undraggableOnDesktop()}
`;

export default NudeButton;
