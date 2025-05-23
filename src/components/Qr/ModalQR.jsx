import { Modal, Button } from "react-bootstrap";
import QRCode from "react-qr-code";

const ModalQR = ({ show, handleClose, qrUrl }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Código QR del PDF</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {qrUrl ? (
          <div style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}>
            <QRCode
              value={qrUrl}
              style={{ width: "100%", height: "auto" }}
              title="Escanea para abrir el PDF"
              level="L"
            />
          </div>
        ) : (
          <p>No hay URL disponible para generar el QR.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQR;
