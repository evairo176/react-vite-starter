import { useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  galleryReducer,
  initialGalleryState,
  type GalleryAction,
  type GalleryEditorImage,
  type GalleryEditorState,
} from "@/core/utils/gallery";

export interface GalleryEditorProps {
  /** Current ordered images (url + position) coming from the parent form. */
  value?: GalleryEditorImage[];
  /** Emits the ordered image array (url + contiguous position) on every edit. */
  onChange: (images: GalleryEditorImage[]) => void;
}

/** Stable signature used to detect external `value` changes (e.g. edit reset). */
function signature(images: GalleryEditorImage[]): string {
  return JSON.stringify(
    images.map((img) => ({
      url: img.url,
      alt: img.alt ?? null,
      position: img.position,
    }))
  );
}

/** Local reducer: delegates add/remove/reorder to `galleryReducer` and adds a
 * `reset` action so the editor can re-seed from the parent form on edit. */
type EditorAction = GalleryAction | { type: "reset"; images: GalleryEditorImage[] };

function editorReducer(
  state: GalleryEditorState,
  action: EditorAction
): GalleryEditorState {
  if (action.type === "reset") {
    return {
      images: action.images.map((img, index) => ({
        url: img.url,
        alt: img.alt ?? null,
        position: index,
      })),
    };
  }
  return galleryReducer(state, action);
}

/**
 * Add / remove / reorder image editor backed by `galleryReducer`
 * (`core/utils/gallery`). Each image carries a `url` and a contiguous
 * `position`; the ordered array is emitted to the parent form on every edit.
 * (Req 11.8)
 */
export default function GalleryEditor({ value, onChange }: GalleryEditorProps) {
  const [state, dispatch] = useReducer(
    editorReducer,
    value && value.length > 0
      ? { images: value.map((img, i) => ({ ...img, position: i })) }
      : initialGalleryState
  );

  const [draftUrl, setDraftUrl] = useState("");
  const [draftAlt, setDraftAlt] = useState("");

  // Track whether the latest state change originated from a user edit so we
  // only push changes upward in that case (avoids feedback loops with `value`).
  const internalUpdate = useRef(false);
  // Signature of the value last synced into the reducer.
  const syncedSignature = useRef(signature(state.images));

  /** Dispatch a user edit and flag it so the change is emitted upward. */
  const apply = (action: GalleryAction) => {
    internalUpdate.current = true;
    dispatch(action);
  };

  // Re-seed from the parent when an external value (different record) arrives.
  useEffect(() => {
    const incoming = value ?? [];
    const incomingSig = signature(
      incoming.map((img, i) => ({ ...img, position: i }))
    );
    if (incomingSig !== syncedSignature.current) {
      syncedSignature.current = incomingSig;
      internalUpdate.current = false;
      dispatch({ type: "reset", images: incoming });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Emit ordered images upward whenever a user edit changes the state.
  useEffect(() => {
    if (internalUpdate.current) {
      internalUpdate.current = false;
      syncedSignature.current = signature(state.images);
      onChange(state.images);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.images]);

  const handleAdd = () => {
    const url = draftUrl.trim();
    if (!url) return;
    apply({ type: "add", url, alt: draftAlt.trim() || null });
    setDraftUrl("");
    setDraftAlt("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ImageIcon className="w-4 h-4" />
        Project Gallery
      </div>

      {/* Add new image row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end p-4 rounded-lg border bg-background/30">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Image URL</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="https://..."
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Alt Text</Label>
          <div className="relative">
            <Type className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={draftAlt}
              onChange={(e) => setDraftAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Image description"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!draftUrl.trim()}
          className="h-9 gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* Existing images, ordered by position */}
      <div className="space-y-3">
        {state.images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="grid grid-cols-[auto,1fr,auto] gap-3 items-center p-3 rounded-lg border bg-background/30"
          >
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground"
                aria-label={`Position ${image.position}`}
              >
                {image.position}
              </span>
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  disabled={index === 0}
                  aria-label="Move image up"
                  onClick={() =>
                    apply({ type: "reorder", from: index, to: index - 1 })
                  }
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  disabled={index === state.images.length - 1}
                  aria-label="Move image down"
                  onClick={() =>
                    apply({ type: "reorder", from: index, to: index + 1 })
                  }
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{image.url}</p>
              {image.alt ? (
                <p className="truncate text-xs text-muted-foreground">
                  {image.alt}
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Remove image"
              onClick={() => apply({ type: "remove", index })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {state.images.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground/50 text-sm">
            No images added yet. Add a URL above to start.
          </div>
        )}
      </div>
    </div>
  );
}
