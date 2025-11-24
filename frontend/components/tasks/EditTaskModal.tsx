'use client';

import CreateTaskModal from './CreateTaskModal';

interface EditTaskModalProps {
  isOpen: boolean;
  taskId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTaskModal({ isOpen, taskId, onClose, onSuccess }: EditTaskModalProps) {
  return (
    <CreateTaskModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      mode="edit"
      taskId={taskId}
    />
  );
}

