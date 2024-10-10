import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { X } from 'lucide-react';

function FeedbackModal({ isOpen, onClose, userEmail }) {
  const [state, handleSubmit] = useForm("xnnqarrb");

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content feedback-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        <h2>Feedback geben</h2>
        <p className="feedback-intro">
          Diese App ist ein MVP (Minimum Viable Product) und wir brauchen dein Feedback, um sie zu verbessern. Wir lesen jeden einzelnen Beitrag und schätzen deine Meinung sehr. Hilf uns, die App nach deinen Bedürfnissen zu gestalten!
        </p>
        {state.succeeded ? (
          <div className="success-message">
            <p>Vielen Dank für dein Feedback!</p>
            <button onClick={onClose} className="close-button">Schließen</button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="feedback-form">
            <input
              type="hidden"
              name="email"
              value={userEmail}
            />
            <div className="form-group">
              <label htmlFor="message">Deine Nachricht</label>
              <textarea
                id="message"
                name="message"
                required
                rows="6"
                placeholder="Bitte gib hier dein Feedback ein..."
              />
              <ValidationError 
                prefix="Message" 
                field="message"
                errors={state.errors}
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={state.submitting} className="submit-button">
                {state.submitting ? 'Wird gesendet...' : 'Absenden'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;