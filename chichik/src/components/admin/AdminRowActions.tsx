"use client";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;
};

export function AdminRowActions({ onEdit, onDelete, deleteLabel = "Удалить" }: Props) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" className="btn btn-secondary px-2 py-1 text-xs" onClick={onEdit}>
        Изменить
      </button>
      <button
        type="button"
        className="btn btn-secondary px-2 py-1 text-xs text-[var(--weak)]"
        onClick={onDelete}
      >
        {deleteLabel}
      </button>
    </div>
  );
}
