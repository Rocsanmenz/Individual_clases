import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import ModalInstalacionIOS from "../components/inicio/ModalInstalacionIOS";

const Inicio = () => {
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  const abrirModalInstrucciones = () => setMostrarModalInstrucciones(true);
  const cerrarModalInstrucciones = () => setMostrarModalInstrucciones(false);

  // Detectar si el dispositivo es iOS
  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  // Capturar el evento beforeinstallprompt
  useEffect(() => {
    const manejarSolicitudInstalacion = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener("beforeinstallprompt", manejarSolicitudInstalacion);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarSolicitudInstalacion);
    };
  }, []);

  // Función para lanzar el prompt de instalación
  const instalacion = async () => {
    if (!solicitudInstalacion) return;

    try {
      await solicitudInstalacion.prompt();
      const { outcome } = await solicitudInstalacion.userChoice;
      console.log(outcome === "accepted" ? "Instalación aceptada" : "Instalación rechazada");
    } catch (error) {
      console.error("Error al intentar instalar la PWA:", error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  return (
    <Container className="text-center mt-5">
      {/* Botón para Android/otros */}
      {!esDispositivoIOS && mostrarBotonInstalacion && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={instalacion}>
            Instalar app Ferretería Selva <i className="bi bi-download"></i>
          </Button>
        </div>
      )}

      {/* Botón para iOS */}
      {esDispositivoIOS && (
        <div className="text-center my-4">
          <Button className="sombra" variant="primary" onClick={abrirModalInstrucciones}>
            Cómo instalar Ferretería Selva en iPhone <i className="bi bi-phone"></i>
          </Button>
        </div>
      )}

      {/* Modal de instrucciones para iOS */}
      <ModalInstalacionIOS
        mostrar={mostrarModalInstrucciones}
        cerrar={cerrarModalInstrucciones}
      />
    </Container>
  );
};

export default Inicio;