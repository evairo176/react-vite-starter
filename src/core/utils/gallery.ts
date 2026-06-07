/**
 * Gallery ordering and editor helpers.
 *
 * `orderGallery` powers the public Project_Case_Study_View, rendering gallery
 * images in ascending `position` order (Req 2.6).
 *
 * `galleryReducer` backs the admin gallery editor (Req 11.8): add/remove/reorder
 * operations always yield a list whose `position` values form a contiguous
 * `0..n-1` sequence with no gaps or duplicates.
 */

/** Minimal shape required to order gallery images by position. */
export interface PositionedImage {
  position: number;
}

/**
 * Return a copy of `images` sorted by ascending `position`.
 *
 * The sort is stable (ties keep their original relative order) and the result
 * is a permutation of the input: same items, same count, none added or dropped.
 * (Req 2.6)
 */
export function orderGallery<T extends PositionedImage>(images: readonly T[]): T[] {
  return images
    .map((image, index) => ({ image, index }))
    .sort((a, b) => {
      if (a.image.position !== b.image.position) {
        return a.image.position - b.image.position;
      }
      // Preserve original order for equal positions (stable sort).
      return a.index - b.index;
    })
    .map((entry) => entry.image);
}

/** An image managed by the admin gallery editor. */
export interface GalleryEditorImage {
  url: string;
  alt?: string | null;
  position: number;
}

/** Editor state: the ordered list of images being edited. */
export interface GalleryEditorState {
  images: GalleryEditorImage[];
}

/** Actions the gallery editor supports. */
export type GalleryAction =
  | { type: "add"; url: string; alt?: string | null }
  | { type: "remove"; index: number }
  | { type: "reorder"; from: number; to: number };

/** The empty starting state for the gallery editor. */
export const initialGalleryState: GalleryEditorState = { images: [] };

/**
 * Renumber images so their `position` values form a contiguous `0..n-1`
 * sequence that matches their current array order.
 */
function renumber(images: GalleryEditorImage[]): GalleryEditorImage[] {
  return images.map((image, index) => ({ ...image, position: index }));
}

/** Clamp an index into the inclusive range `[0, length - 1]`. */
function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
}

/**
 * Gallery-editor reducer. Every transition returns a state whose image
 * positions are contiguous `0..n-1`. (Req 11.8)
 */
export function galleryReducer(
  state: GalleryEditorState,
  action: GalleryAction
): GalleryEditorState {
  switch (action.type) {
    case "add": {
      const next = [
        ...state.images,
        { url: action.url, alt: action.alt ?? null, position: state.images.length },
      ];
      return { images: renumber(next) };
    }
    case "remove": {
      if (action.index < 0 || action.index >= state.images.length) {
        // Out-of-range removal is a no-op (state already contiguous).
        return state;
      }
      const next = state.images.filter((_, index) => index !== action.index);
      return { images: renumber(next) };
    }
    case "reorder": {
      const length = state.images.length;
      if (length < 2) return state;
      const from = clampIndex(action.from, length);
      const to = clampIndex(action.to, length);
      if (from === to) return state;
      const next = [...state.images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { images: renumber(next) };
    }
    default:
      return state;
  }
}
