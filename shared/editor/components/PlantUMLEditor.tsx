import { useEffect, useState } from "react";
import { encode as plantumlEncoder } from "plantuml-encoder";
// import { setSrcImgCache } from "./utils";
import styled from "styled-components";
import { s } from "@shared/styles";
import { t } from "i18next";
import { InputSelect } from "../custom/components/InputSelect";
import Button from "../custom/components/Button";
import useDebounce from "./hooks/useDebounce";
import { getUrlsSrc } from "../extensions/PlantUMLEditor";

const timeoutDebounce = 250;

interface PlantUMLEditorProps {
  codeSchema: string;
  typeImg: string;
  url: string;
  editSchemaCodeSchema: (codeSchema: string) => void;
  editSchemaTypeImg: (typeImg: string) => void;
  editSchemaEditOpen: (editOpen: boolean) => void;
}

function PlantUMLEditor({
  codeSchema: codeSchemaAttr,
  typeImg: typeImgAttr,
  url,
  editSchemaCodeSchema,
  editSchemaTypeImg,
  editSchemaEditOpen,
}: PlantUMLEditorProps) {
  const [codeSchema, setCodeSchema] = useState(codeSchemaAttr);
  const [typeImg, setTypeImg] = useState(typeImgAttr);

  const [urlSrc, setUrlSrc] = useState(url);

  const debouncedValue = useDebounce(
    getUrlsSrc(codeSchema, typeImg),
    timeoutDebounce
  );

  useEffect(() => {
    setUrlSrc(debouncedValue);
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
          <Img src={urlSrc} alt={"PlantUMLImg"} />
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
