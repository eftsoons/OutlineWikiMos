import {
  type NodeSpec,
  type NodeType,
  type Node as ProsemirrorNode,
} from "prosemirror-model";
import Node from "../nodes/Node";
import { Command, NodeSelection } from "prosemirror-state";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "../types";
import { encode as plantumlEncoder } from "plantuml-encoder";
import useDebounce from "./hooks/useDebounce";
import { setSrcImgCache } from "./utils";
import styled from "styled-components";
import { s } from "@shared/styles";
import Button from "./components/Button";
import { InputSelect } from "./components/InputSelect";
import type { MarkdownSerializerState } from "../lib/markdown/serializer";
import type Token from "markdown-it/lib/token.mjs";
import { t } from "i18next";

const urlPlantUML = "https://img.plantuml.biz/plantuml";
const timeoutDebounce = 250;

export default class PlantUMLEditor extends Node {
  get name() {
    return "plantUML_editor";
  }

  get schema(): NodeSpec {
    return {
      group: "block",
      atom: true,
      draggable: false,
      defining: true,
      isolating: true,
      code: true,
      marks: "",
      attrs: {
        codeSchema: { default: "Bob -> Alice" },
        typeImg: { default: "svg" },
        editOpen: { default: true },
      },
      parseDOM: [
        {
          tag: "div.component-plantUML_editor",
          getAttrs: (dom) => ({
            codeSchema: dom.getAttribute("data-code-schema") || "Bob -> Alice",
            typeImg: dom.getAttribute("data-type-img") || "svg",
            editOpen: dom.getAttribute("data-edit-open") === "true",
          }),
        },
      ],
      toDOM: (node) => {
        return [
          "div",
          {
            "data-code-schema": node.attrs.codeSchema,
            "data-type-img": node.attrs.typeImg,
            "data-edit-open": node.attrs.editOpen ? "true" : "false",
            class: "component-plantUML_editor",
          },
          0,
        ];
      },
    };
  }

  component = (props: ComponentProps) => {
    const {
      node: { attrs },
    } = props;

    const {
      codeSchema: codeSchemaAttr,
      typeImg: typeImgAttr,
      editOpen,
    } = attrs;

    const [codeSchema, setCodeSchema] = useState(codeSchemaAttr);
    const [typeImg, setTypeImg] = useState(typeImgAttr);

    const [isLoadImg, setIsLoadImg] = useState(true);

    const imgRef = useRef<HTMLImageElement>(null);

    const codeSchemaEncode = plantumlEncoder(codeSchema);

    const url = `${urlPlantUML}/${typeImg}/${codeSchemaEncode}`;

    const debouncedValue = useDebounce(url, timeoutDebounce);

    useEffect(() => {
      if (editOpen) setSrcImgCache(debouncedValue, imgRef);
    }, [debouncedValue, editOpen]);

    useEffect(() => {
      if (!editOpen) {
        setCodeSchema(codeSchemaAttr);
        setTypeImg(typeImgAttr);
      }
    }, [editOpen]);

    const handleSaveAttr = () => {
      this.editor.commands.editSchemaCodeSchema(codeSchema);
      this.editor.commands.editSchemaTypeImg(typeImg);
      this.editor.commands.editSchemaEditOpen(false);
    };

    const handleCloseEditor = () => {
      this.editor.commands.editSchemaEditOpen(false);
    };

    const handleOpenEditor = () => {
      this.editor.commands.editSchemaEditOpen(true);
    };

    const onChangeInputSelect = (e: string) => {
      setTypeImg(e);
    };

    if (!editOpen) {
      setSrcImgCache(url, imgRef);

      return (
        <Img
          ref={imgRef}
          alt={"PlantUMLImg"}
          // onClick={handleOpenEditor}
          $display={isLoadImg ? "none" : "block"}
          onLoad={() => setIsLoadImg(false)}
        />
      );
    }

    return (
      <Editor>
        <Edit>
          <Textarea
            value={codeSchema}
            onChange={(e) => setCodeSchema(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <ImgDiv>
            <Img
              ref={imgRef}
              alt={"PlantUMLImg"}
              $display={isLoadImg ? "none" : "block"}
              onLoad={() => setIsLoadImg(false)}
            />
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
  };

  commands({ type }: { type: NodeType }) {
    return {
      plantUML_editor: (): Command => (state, dispatch) => {
        dispatch?.(state.tr.replaceSelectionWith(type.create()));

        return true;
      },
      editSchemaCodeSchema:
        (codeSchema: string): Command =>
        (state, dispatch) => {
          if (!(state.selection instanceof NodeSelection)) {
            return false;
          }

          dispatch?.(
            state.tr.setNodeMarkup(state.selection.from, undefined, {
              ...state.selection.node.attrs,
              codeSchema: codeSchema,
            })
          );

          return true;
        },
      editSchemaTypeImg:
        (typeImg: string): Command =>
        (state, dispatch) => {
          if (!(state.selection instanceof NodeSelection)) {
            return false;
          }

          dispatch?.(
            state.tr.setNodeMarkup(state.selection.from, undefined, {
              ...state.selection.node.attrs,
              typeImg: typeImg,
            })
          );

          return true;
        },
      editSchemaEditOpen:
        (editOpen: boolean): Command =>
        (state, dispatch) => {
          if (!(state.selection instanceof NodeSelection)) {
            return false;
          }

          dispatch?.(
            state.tr.setNodeMarkup(state.selection.from, undefined, {
              ...state.selection.node.attrs,
              editOpen: editOpen,
            })
          );

          return true;
        },
    };
  }

  toMarkdown(state: MarkdownSerializerState, node: ProsemirrorNode) {
    if (!state.inTable) {
      state.ensureNewLine();
    }

    const { codeSchema, typeImg, editOpen } = node.attrs;

    state.write(
      `<div data-code-schema="${state.esc(
        (codeSchema || "").replace("\n", "") || "",
        false
      )}" data-type-img="${state.esc((typeImg || "").replace("\n", "") || "", false)}" data-edit-open="${state.esc((String(editOpen) || "").replace("\n", "") || "", false)}"></div>`
    );

    state.write(`[${codeSchema}](${typeImg})${editOpen}`);
    if (!state.inTable) {
      state.write("\n\n");
    }
  }

  parseMarkdown() {
    return {
      node: "plantUML_editor",
      getAttrs: (token: Token) => ({
        codeSchema: token.attrGet("data-code-schema"),
        typeImg: token.attrGet("data-type-img"),
        editOpen: token.attrGet("data-edit-open"),
      }),
    };
  }
}

const Img = styled.img<{ $display?: string }>`
  border-radius: 3px;
  width: 100%;
  display: ${(props) => props.$display || "block"};
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
