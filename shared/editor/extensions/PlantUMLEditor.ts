import type { Node } from "prosemirror-model";
import Extension from "../lib/Extension";
import { Command, EditorState, NodeSelection } from "prosemirror-state";
import { ImageSource } from "../lib/FileHelper";
import { encode as plantumlEncoder } from "plantuml-encoder";
import { IntegrationService } from "@shared/types";
import { Editor } from "~/editor";

function getUrlsSrc(editor: Editor, codeSchema: string, typeImg: string) {
  const integration = editor.props.embeds?.find(
    (integ) => integ.name === IntegrationService.PlantUML
  );

  const settingsUrl =
    integration?.settings?.plantUML_editor?.url ||
    "https://img.plantuml.biz/plantuml/";

  const codeSchemaEncode = plantumlEncoder(codeSchema);

  return `${settingsUrl}${typeImg}/${codeSchemaEncode}`;
}

export default class PlantUMLEditor extends Extension {
  get name() {
    return "plantUML_editor";
  }

  commands() {
    return {
      plantUML_editor: (): Command => (state, dispatch) => {
        if (!dispatch) {
          return true;
        }

        const selectedNode = this.getSelectedImageNode(state);

        if (!selectedNode) {
          const type = this.editor.schema.nodes.image;
          const { tr } = state;
          const transaction = tr.insert(
            state.selection.from,
            type.create({
              width: 320,
              height: 300,
              source: ImageSource.PlantUML,
              src: getUrlsSrc(this.editor, "Bob -> Alice", "svg"),
              codeSchema: "Bob -> Alice",
              typeImg: "svg",
              editOpen: true,
            })
          );

          dispatch(transaction);
        }

        return true;
      },
      editPlantUMLOpen: (): Command => (state) => {
        return this.editSchemaEditOpen(state, true);
      },
      editSchemaCodeSchema:
        (codeSchema: string): Command =>
        (state) => {
          return this.editSchemaCodeSchema(state, codeSchema);
        },
      editSchemaTypeImg:
        (typeImg: string): Command =>
        (state) => {
          return this.editSchemaTypeImg(state, typeImg);
        },
      editSchemaEditOpen:
        (editOpen: boolean): Command =>
        (state) => {
          return this.editSchemaEditOpen(state, editOpen);
        },
    };
  }

  private editSchemaCodeSchema(state: EditorState, codeSchema: string) {
    const { dispatch } = this.editor.view;

    if (!(state.selection instanceof NodeSelection)) {
      return false;
    }

    const { typeImg } = state.selection.node.attrs;

    dispatch?.(
      state.tr.setNodeMarkup(state.selection.from, undefined, {
        ...state.selection.node.attrs,
        codeSchema: codeSchema,
        src: getUrlsSrc(this.editor, codeSchema, typeImg),
      })
    );

    return true;
  }

  private editSchemaTypeImg(state: EditorState, typeImg: string) {
    const { dispatch } = this.editor.view;

    if (!(state.selection instanceof NodeSelection)) {
      return false;
    }

    const { codeSchema } = state.selection.node.attrs;

    dispatch?.(
      state.tr.setNodeMarkup(state.selection.from, undefined, {
        ...state.selection.node.attrs,
        typeImg: typeImg,
        src: getUrlsSrc(this.editor, codeSchema, typeImg),
      })
    );

    return true;
  }

  private editSchemaEditOpen(state: EditorState, editOpen: boolean) {
    const { dispatch } = this.editor.view;

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
  }

  /**
   * Gets the currently selected image node if it exists.
   *
   * @param state - the editor state.
   * @returns the selected image node or undefined.
   */
  private getSelectedImageNode(state: EditorState) {
    if (state.selection instanceof NodeSelection) {
      const node = state.selection.node;
      if (node.type.name === "image") {
        return node;
      }
    }

    return;
  }
}

export { getUrlsSrc };
