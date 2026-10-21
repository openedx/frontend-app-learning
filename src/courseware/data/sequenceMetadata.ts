import { camelCaseObject } from '@edx/frontend-platform';

// The sequence metadata (GET /api/courseware/sequence/), as `normalizeSequenceMetadata` shapes it.

export interface SequenceGatedContent {
  gated: boolean;
  prereqId: string | null;
  prereqUrl: string | null;
  prereqSectionName: string | null;
  gatedSectionName: string;
}

export interface SequenceMetadata {
  id: string;
  blockType: string;
  unitIds: string[];
  bannerText: string | null;
  format: string | null;
  title: string;
  gatedContent: SequenceGatedContent;
  isTimeLimited: boolean;
  isProctored: boolean;
  isHiddenAfterDue: boolean;
  activeUnitIndex: number;
  saveUnitPosition: boolean;
  showCompletion: boolean;
  allowProctoringOptOut?: boolean;
  navigationDisabled: boolean;
}

export interface SequenceUnit {
  id: string;
  sequenceId: string;
  bookmarked: boolean;
  complete?: boolean;
  title: string;
  contentType: string;
  graded: boolean;
  containsContentTypeGatedContent: boolean;
  bookmarkedUpdateState?: 'loading' | 'loaded' | 'failed';
}

export interface SequenceMetadataData {
  sequence: SequenceMetadata;
  units: SequenceUnit[];
}

// Names only the fields `normalizeSequenceMetadata` reads; the endpoint returns more, left reachable as `unknown`.

interface SequenceMetadataResponseUnit {
  id: string;
  bookmarked: boolean;
  complete?: boolean; // only sent for a signed-in user
  page_title: string;
  type: string;
  graded: boolean;
  contains_content_type_gated_content: boolean;
  [key: string]: unknown;
}

interface SequenceMetadataResponse {
  item_id: string;
  tag: string;
  items: SequenceMetadataResponseUnit[];
  banner_text: string | null;
  format: string | null;
  display_name: string;
  gated_content: {
    gated: boolean;
    prereq_id: string | null;
    prereq_url: string | null;
    prereq_section_name: string | null;
    gated_section_name: string;
  };
  is_time_limited: boolean;
  is_proctored: boolean;
  is_hidden_after_due: boolean;
  position: number | null;
  save_position: boolean;
  show_completion: boolean;
  allow_proctoring_opt_out?: boolean; // not in the payload SequenceBlock.get_metadata builds
  navigation_disabled: boolean;
  [key: string]: unknown;
}

export function normalizeSequenceMetadata(sequence: SequenceMetadataResponse): SequenceMetadataData {
  return {
    sequence: {
      id: sequence.item_id,
      blockType: sequence.tag,
      unitIds: sequence.items.map(unit => unit.id),
      bannerText: sequence.banner_text,
      format: sequence.format,
      title: sequence.display_name,
      gatedContent: camelCaseObject(sequence.gated_content),
      isTimeLimited: sequence.is_time_limited,
      isProctored: sequence.is_proctored,
      isHiddenAfterDue: sequence.is_hidden_after_due,
      // Position comes back from the server 1-indexed. Adjust here.
      activeUnitIndex: sequence.position ? sequence.position - 1 : 0,
      saveUnitPosition: sequence.save_position,
      showCompletion: sequence.show_completion,
      allowProctoringOptOut: sequence.allow_proctoring_opt_out,
      navigationDisabled: sequence.navigation_disabled,
    },
    units: sequence.items.map(unit => ({
      id: unit.id,
      sequenceId: sequence.item_id,
      bookmarked: unit.bookmarked,
      complete: unit.complete,
      title: unit.page_title,
      contentType: unit.type,
      graded: unit.graded,
      containsContentTypeGatedContent: unit.contains_content_type_gated_content,
    })),
  };
}
