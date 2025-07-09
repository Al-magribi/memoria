import "./confirm.scss";

const ConfirmBox = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
  open,
}) => {
  if (!open) return null;
  return (
    <div className='confirm-modal-overlay'>
      <div className='confirm-box'>
        <button className='close-btn' onClick={onCancel} aria-label='Close'>
          ×
        </button>
        <p className='confirm-message'>{message}</p>
        <div className='confirm-buttons'>
          <button className='confirm-btn confirm-yes' onClick={onConfirm}>
            {confirmText}
          </button>
          <button className='confirm-btn confirm-no' onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
