import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Image, Video } from "lucide-react";
import clsx from "clsx";

export const MediaBlock: React.FC<BlockComponentProps> = ({
  id: _id,
  props = {},
  styles = {},
  isEditing: _isEditing,
}) => {
  const {
    src = "",
    mediaType = "image",
    alt = "HUD Media",
    autoplay = false,
    controls = true,
    loop = false,
    muted = false,
    aspectRatio = "16/9",
    objectFit = "cover",
  } = props;

  const aspectStyles = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "auto": "",
  }[aspectRatio as string] || "aspect-video";

  const renderPlaceholder = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-350 dark:border-neutral-800 text-neutral-450 dark:text-neutral-500 font-mono text-[10px] tracking-wider uppercase min-h-[140px]">
      {mediaType === "video" ? (
        <Video className="w-6 h-6 mb-2 opacity-60" />
      ) : (
        <Image className="w-6 h-6 mb-2 opacity-60" />
      )}
      <span>HUD {mediaType} Slot</span>
      <span className="text-[8px] text-neutral-400 dark:text-neutral-600 mt-1">
        Configure source url in inspector
      </span>
    </div>
  );

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2] && match[2].length === 11) {
          return `https://www.youtube.com/embed/${match[2]}`;
        }
      }
      if (url.includes("vimeo.com")) {
        const regExp = /vimeo\.com\/([0-9]+)/;
        const match = url.match(regExp);
        if (match) {
          return `https://player.vimeo.com/video/${match[1]}`;
        }
      }
    } catch {
      // Ignored
    }
    return url;
  };

  const renderMedia = () => {
    if (!src) return renderPlaceholder();

    if (mediaType === "youtube" || src.includes("youtube.com") || src.includes("youtu.be") || src.includes("vimeo.com")) {
      const embedUrl = getEmbedUrl(src);
      return (
        <iframe
          src={embedUrl}
          title={alt}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      );
    }

    if (mediaType === "video") {
      return (
        <video
          src={src}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          className={clsx("w-full h-full border-0", {
            "object-cover": objectFit === "cover",
            "object-contain": objectFit === "contain",
            "object-fill": objectFit === "fill",
          })}
        />
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={clsx("w-full h-full border-0", {
          "object-cover": objectFit === "cover",
          "object-contain": objectFit === "contain",
          "object-fill": objectFit === "fill",
        })}
      />
    );
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden w-full border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30 rounded-none p-1",
        aspectStyles,
        styles.className
      )}
      style={{
        width: styles.width,
        height: styles.height,
        marginTop: styles.marginTop,
        marginRight: styles.marginRight,
        marginBottom: styles.marginBottom,
        marginLeft: styles.marginLeft,
      }}
    >
      {/* HUD corner overlay decoration to match premium HUD styles */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />

      <div className="w-full h-full relative overflow-hidden bg-black/5 dark:bg-black/25">
        {renderMedia()}
      </div>
    </div>
  );
};

export const MediaBlockConfig: BlockConfig = {
  type: "media",
  name: "HUD Media Slot",
  description: "Display images, HTML5 videos, or YouTube stream frames.",
  icon: Image,
  component: MediaBlock,
  defaultProps: {
    src: "",
    mediaType: "image",
    alt: "HUD Graphic",
    autoplay: false,
    controls: true,
    loop: false,
    muted: false,
    aspectRatio: "16/9",
    objectFit: "cover",
  },
  defaultStyles: {
    width: "100%",
  },
  editorFields: [
    {
      name: "src",
      label: "Media Source URL",
      type: "text",
      defaultValue: "",
      placeholder: "https://example.com/image.jpg",
    },
    {
      name: "mediaType",
      label: "Media Format Type",
      type: "select",
      options: [
        { label: "Static Image", value: "image" },
        { label: "HTML5 Local Video", value: "video" },
        { label: "YouTube Embed", value: "youtube" },
      ],
      defaultValue: "image",
    },
    {
      name: "alt",
      label: "Alternative Description",
      type: "text",
      defaultValue: "HUD Graphic",
    },
    {
      name: "aspectRatio",
      label: "Layout Aspect Ratio",
      type: "select",
      options: [
        { label: "Widescreen 16:9", value: "16/9" },
        { label: "Standard 4:3", value: "4/3" },
        { label: "Square 1:1", value: "1/1" },
        { label: "Free Ratio", value: "auto" },
      ],
      defaultValue: "16/9",
    },
    {
      name: "objectFit",
      label: "Fitting Position",
      type: "select",
      options: [
        { label: "Fill Crop (Cover)", value: "cover" },
        { label: "Uniform Contain", value: "contain" },
        { label: "Stretch-to-Fit", value: "fill" },
      ],
      defaultValue: "cover",
    },
    {
      name: "autoplay",
      label: "Enable Autoplay (Videos)",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "controls",
      label: "Show Control Buttons",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
