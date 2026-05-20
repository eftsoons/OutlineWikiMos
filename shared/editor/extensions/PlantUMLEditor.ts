import type { Node } from "prosemirror-model";
import Extension from "../lib/Extension";
import { Command, EditorState, NodeSelection } from "prosemirror-state";
import { ImageSource } from "../lib/FileHelper";
import { encode as plantumlEncoder } from "plantuml-encoder";

const urlPlantUML = "https://img.plantuml.biz/plantuml";

function getUrlsSrc(codeSchema: string, typeImg: string) {
  const codeSchemaEncode = plantumlEncoder(codeSchema);

  return `${urlPlantUML}/${typeImg}/${codeSchemaEncode}`;
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

        //type != "image"?
        const selectedNode = this.getSelectedImageNode(state);

        if (!selectedNode) {
          const type = this.editor.schema.nodes.image;
          const { tr } = state;
          const transaction = tr.insert(
            state.selection.from,
            type.create({
              width: 500,
              height: 500,
              source: ImageSource.PlantUML,
              src: getUrlsSrc("Bob -> Alice", "svg"),
              codeSchema: "Bob -> Alice",
              typeImg: "svg",
              editOpen: true,
            })
          );

          dispatch(transaction);
        }

        return true;
      },
      editPlantUML: (): Command => (state) => {
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
        src: getUrlsSrc(codeSchema, typeImg),
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
        src: getUrlsSrc(codeSchema, typeImg),
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

  /**
   * Uploads the plantUML file using the editor's upload handler.
   *
   * @param file - the plantUML file to upload.
   * @returns promise resolving to the uploaded file URL.
   * @throws Error if no upload handler is configured.
   */
  private async uploadPlantUMLUrl(file: string): Promise<string> {
    const { uploadFile } = this.editor.props;
    if (!uploadFile) {
      throw new Error("No upload handler configured");
    }

    return uploadFile(file);
  }

  /**
   * Opens the diagram editor for creating or editing a diagram.
   *
   * @param node - the selected image node, if any.
   */
  private openDiagramEditor(node?: Node) {
    const nodeSrc = node?.attrs.src ?? "";
  }
}

export { getUrlsSrc };
