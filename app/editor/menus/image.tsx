import {
  TrashIcon,
  DownloadIcon,
  ReplaceIcon,
  AlignImageLeftIcon,
  AlignImageRightIcon,
  AlignImageCenterIcon,
  AlignFullWidthIcon,
  EditIcon,
  CommentIcon,
  LinkIcon,
} from "outline-icons";
import type { EditorState } from "prosemirror-state";
import { isNodeActive } from "@shared/editor/queries/isNodeActive";
import type { TFunction } from "i18next";
import type { MenuItem } from "@shared/editor/types";
import { metaDisplay } from "@shared/utils/keyboard";
import { ImageSource } from "@shared/editor/lib/FileHelper";
import Desktop from "~/utils/Desktop";
import { isMarkActive } from "@shared/editor/queries/isMarkActive";

export default function imageMenuItems(
  state: EditorState,
  readOnly: boolean,
  t: TFunction
): MenuItem[] {
  if (readOnly) {
    return [];
  }
  const { schema } = state;
  const isLeftAligned = isNodeActive(schema.nodes.image, {
    layoutClass: "left-50",
  });
  const isRightAligned = isNodeActive(schema.nodes.image, {
    layoutClass: "right-50",
  });
  const isFullWidthAligned = isNodeActive(schema.nodes.image, {
    layoutClass: "full-width",
  });
  const isDiagram = isNodeActive(schema.nodes.image, {
    source: ImageSource.DiagramsNet,
  });
  const isEmptyDiagram = isNodeActive(schema.nodes.image, {
    source: ImageSource.DiagramsNet,
    src: "",
  });

  const isPlantUML = isNodeActive(schema.nodes.image, {
    source: ImageSource.PlantUML,
  });

  const isPlantUMLOpenEditor = isNodeActive(schema.nodes.image, {
    source: ImageSource.PlantUML,
    editOpen: true,
  });

  return [
    {
      name: "alignLeft",
      tooltip: t("Align left"),
      icon: <AlignImageLeftIcon />,
      active: isLeftAligned,
      visible: !isEmptyDiagram(state) && !isPlantUMLOpenEditor(state),
    },
    {
      name: "alignCenter",
      tooltip: t("Align center"),
      icon: <AlignImageCenterIcon />,
      active: (state) =>
        isNodeActive(schema.nodes.image)(state) &&
        !isLeftAligned(state) &&
        !isRightAligned(state) &&
        !isFullWidthAligned(state),
      visible: !isEmptyDiagram(state) && !isPlantUMLOpenEditor(state),
    },
    {
      name: "alignRight",
      tooltip: t("Align right"),
      icon: <AlignImageRightIcon />,
      active: isRightAligned,
      visible: !isEmptyDiagram(state) && !isPlantUMLOpenEditor(state),
    },
    {
      name: "alignFullWidth",
      tooltip: t("Full width"),
      icon: <AlignFullWidthIcon />,
      active: isFullWidthAligned,
      visible: !isEmptyDiagram(state) && !isPlantUMLOpenEditor(state),
    },
    {
      name: "separator",
    },
    {
      name: "dimensions",
      tooltip: `${t("Width")} × ${t("Height")}`,
      visible:
        !isFullWidthAligned(state) &&
        !isEmptyDiagram(state) &&
        !isPlantUMLOpenEditor(state),
      skipIcon: true,
    },
    {
      name: "separator",
    },
    {
      name: "editPlantUML",
      tooltip: t("Edit diagram"),
      icon: <EditIcon />,
      visible: isPlantUML(state) && !isPlantUMLOpenEditor(state),
    },
    {
      name: "editDiagram",
      tooltip: t("Edit diagram"),
      icon: <EditIcon />,
      visible: isDiagram(state) && !Desktop.isElectron(),
    },
    {
      name: "downloadImage",
      tooltip: t("Download image"),
      icon: <DownloadIcon />,
      visible:
        !!fetch && !isEmptyDiagram(state) && !isPlantUMLOpenEditor(state),
    },
    {
      tooltip: t("Replace image"),
      icon: <ReplaceIcon />,
      visible: !isDiagram(state) && !isPlantUML(state),
      children: [
        {
          name: "replaceImage",
          label: t("Upload an image"),
        },
        {
          name: "editImageUrl",
          label: t("Edit image URL"),
        },
      ],
    },
    {
      name: "deleteImage",
      tooltip: t("Delete image"),
      icon: <TrashIcon />,
    },
    {
      name: "separator",
    },
    {
      name: "linkOnImage",
      tooltip: t("Create link"),
      shortcut: `${metaDisplay}+K`,
      active: isMarkActive(schema.marks.link),
      icon: <LinkIcon />,
    },
    {
      name: "commentOnImage",
      tooltip: t("Comment"),
      shortcut: `${metaDisplay}+⌥+M`,
      icon: <CommentIcon />,
    },
  ];
}
