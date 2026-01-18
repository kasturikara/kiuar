// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white text-gray-900">
        {title && <h3 className="font-bold text-lg text-gray-900">{title}</h3>}
        {children}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop bg-black/50"
        onClick={onClose}
      >
        <button>close</button>
      </form>
    </dialog>
  );
};
