import { useEffect, useState } from "react";
import styled from "styled-components";
import { s } from "@shared/styles";
import { t } from "i18next";
import { InputSelect } from "./components/InputSelect";
import Button from "./components/Button";
import useDebounce from "./hooks/useDebounce";
import { getUrlsSrc } from "../extensions/PlantUMLEditor";
import { Editor as EditorView } from "~/editor";
import { EditorStyleHelper } from "../styles/EditorStyleHelper";
import { Error } from "../components/Image";
import { CrossIcon } from "outline-icons";
import Flex from "@shared/components/Flex";

const timeoutDebounce = 250;

interface PlantUMLEditorProps {
  codeSchema: string;
  typeImg: string;
  url: string;
  editSchemaCodeSchema: (codeSchema: string) => void;
  editSchemaTypeImg: (typeImg: string) => void;
  editSchemaEditOpen: (editOpen: boolean) => void;
  editor: EditorView;
}

function PlantUMLEditor({
  codeSchema: codeSchemaAttr,
  typeImg: typeImgAttr,
  url,
  editSchemaCodeSchema,
  editSchemaTypeImg,
  editSchemaEditOpen,
  editor,
}: PlantUMLEditorProps) {
  const [codeSchema, setCodeSchema] = useState(codeSchemaAttr);
  const [typeImg, setTypeImg] = useState(typeImgAttr);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const [urlSrc, setUrlSrc] = useState(url);

  const debouncedValue = useDebounce(
    getUrlsSrc(editor, codeSchema, typeImg),
    timeoutDebounce
  );

  useEffect(() => {
    setUrlSrc(debouncedValue);
    setError(false);
  }, [debouncedValue]);

  const handleSaveAttr = () => {
    editSchemaCodeSchema(codeSchema);
    editSchemaTypeImg(typeImg);
    editSchemaEditOpen(false);
  };

  const handleCloseEditor = () => {
    editSchemaEditOpen(false);
  };

  const onChangeInputSelect = (e: string) => {
    setTypeImg(e);
  };

  return (
    <Editor>
      <Edit>
        <Textarea
          value={codeSchema}
          onChange={(e) => setCodeSchema(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <ImgDiv>
          {error ? (
            <Error className={EditorStyleHelper.imageHandle}>
              <Flex gap={4} align="center">
                <CrossIcon size={16} />
                {t("Image failed to load")}
              </Flex>
            </Error>
          ) : (
            <Img
              src={urlSrc}
              alt={"PlantUMLImg"}
              style={{
                display: loaded ? "block" : "none",
              }}
              onError={() => {
                setError(true);
                setLoaded(true);
              }}
              onLoad={() => {
                setLoaded(true);
              }}
            />
          )}
        </ImgDiv>
      </Edit>
      <SelectTypeImg>
        <InputSelect
          options={[
            { type: "item", label: "svg", value: "svg" },
            { type: "item", label: "png", value: "png" },
          ]}
          value={typeImg}
          onChange={onChangeInputSelect}
          label="Select type img"
          labelHidden
        />
      </SelectTypeImg>
      <ButtonsDiv>
        <Button onClick={handleSaveAttr}>{t("Save")}</Button>
        <Button onClick={handleCloseEditor}>{t("Close")}</Button>
      </ButtonsDiv>
    </Editor>
  );
}

const Img = styled.img`
  border-radius: 3px;
  width: 100%;
`;

const Editor = styled.div`
  border-radius: 3px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: ${s("backgroundSecondary")};
  padding: 8px;
  gap: 8px;
`;

const Edit = styled.div`
  border-radius: 16px;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  gap: 8px;
`;

const SelectTypeImg = styled.div`
  width: 100%;
`;

const ImgDiv = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonsDiv = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const Textarea = styled.textarea`
  border-radius: 3px;
  padding: 10px;
  width: 50%;
  min-height: 300px;
  max-height: 100%;
  resize: none;
  outline: none;
`;

export default PlantUMLEditor;
