import type {
  CustomBoardItem,
  ResolvedBoardRow,
} from "../customBoard.types";

function buildTimeSubtitle(
  startTime: string | null,
  endTime: string | null
) {
  if (
    startTime &&
    endTime
  ) {
    return `${startTime}–${endTime}`;
  }

  return (
    startTime ||
    endTime ||
    undefined
  );
}

export function resolveManualBoardRow(
  item: CustomBoardItem
): ResolvedBoardRow {
  const {
    manual,
  } = item;

  const subtitle =
    item.subtitle ||
    buildTimeSubtitle(
      manual.startTime,
      manual.endTime
    );

  const row:
    ResolvedBoardRow = {
      id: item.id,

      label: item.label,

      displayType:
        item.type,

      editable: true,
    };

  if (subtitle) {
    row.subtitle =
      subtitle;
  }

  if (
    manual.value !==
    null
  ) {
    row.value =
      manual.value;
  }

  if (
    manual.capacity !==
    null
  ) {
    row.capacity =
      manual.capacity;
  }

  if (
    manual.text
  ) {
    row.text =
      manual.text;
  }

  if (
    manual.status
  ) {
    row.status =
      manual.status;
  }

  if (
    manual.startTime
  ) {
    row.startTime =
      manual.startTime;
  }

  if (
    manual.endTime
  ) {
    row.endTime =
      manual.endTime;
  }

  return row;
}