import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// Lista de contraseñas comunes para rechazar
const contraseñasComunes = ["12345678", "password", "admin", "qwerty"];

// Función principal del modal
const ModalRegistroEmpleado = ({
  showModal,
  setShowModal,
  nuevoEmpleado,
  handleInputChange,
  handleFileChange,
  handleAddEmpleado,
}) => {
  // Validaciones
  const validarNombre = (nombre) => {
    if (!nombre) return "El nombre es obligatorio.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(nombre)) return "Debe tener solo letras, entre 2 y 50 caracteres.";
    return "";
  };

  const validarApellido = (apellido) => {
    if (!apellido) return "El apellido es obligatorio.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(apellido)) return "Debe tener solo letras, entre 2 y 50 caracteres.";
    return "";
  };

  const validarCorreo = (correo) => {
    if (!correo) return "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return "Correo inválido.";
    return "";
  };

  const validarTelefono = (telefono) => {
    if (!telefono) return "El teléfono es obligatorio.";
    if (!/^\d{4}-\d{4}$/.test(telefono)) return "Formato debe ser xxxx-xxxx.";
    return "";
  };

  const validarCedula = (cedula) => {
    if (!cedula) return "La cédula es obligatoria.";
    if (!/^\d{3}-\d{6}-\d{4}[A-Za-z]$/.test(cedula)) return "Formato inválido: xxx-xxxxxx-xxxxX.";
    return "";
  };

  const validarContraseña = (contraseña) => {
    if (!contraseña) return "La contraseña es obligatoria.";
    if (contraseña.length < 8) return "Debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(contraseña)) return "Debe contener mayúsculas.";
    if (!/[a-z]/.test(contraseña)) return "Debe contener minúsculas.";
    if (!/[0-9]/.test(contraseña)) return "Debe contener números.";
    if (!/[\W_]/.test(contraseña)) return "Debe contener símbolos.";
    if (contraseñasComunes.includes(contraseña)) return "No uses contraseñas comunes.";
    return "";
  };

  const validarConfirmarContraseña = (confirmar, contraseña) => {
    if (!confirmar) return "Confirmación requerida.";
    if (confirmar !== contraseña) return "No coincide con la contraseña.";
    return "";
  };

  const validarFechaNacimiento = (fecha) => {
    if (!fecha) return "La fecha es obligatoria.";
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    if (nacimiento >= hoy) return "No puede ser una fecha futura.";
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (edad < 18) return "Debe tener al menos 18 años.";
    return "";
  };

  const validarArchivo = (archivo) => {
    if (!archivo) return "Debe subir una foto.";
    if (!["image/jpeg", "image/png"].includes(archivo.type)) return "Solo se permite JPG o PNG.";
    if (archivo.size > 2 * 1024 * 1024) return "Máximo 2MB.";
    return "";
  };

  // Validaciones de estado
  const [valid, setValid] = useState(false);

  const isFormValid = () => {
    return (
      validarNombre(nuevoEmpleado.nombre) === "" &&
      validarApellido(nuevoEmpleado.apellido) === "" &&
      validarCorreo(nuevoEmpleado.correo) === "" &&
      validarTelefono(nuevoEmpleado.telefono) === "" &&
      validarCedula(nuevoEmpleado.cedula) === "" &&
      validarContraseña(nuevoEmpleado.contraseña) === "" &&
      validarConfirmarContraseña(nuevoEmpleado.confirmarContraseña, nuevoEmpleado.contraseña) === "" &&
      validarFechaNacimiento(nuevoEmpleado.fechaNacimiento) === "" &&
      validarArchivo(nuevoEmpleado.foto) === ""
    );
  };

  useEffect(() => {
    setValid(isFormValid());
  }, [nuevoEmpleado, showModal]);

  // Validación de teclado para teléfono
  const handleKeyPress = (e, field) => {
    if (field === "telefono") {
      const charCode = e.charCode;
      const isDigit = charCode >= 48 && charCode <= 57;
      const isDash = charCode === 45;
      if (!isDigit && !isDash) {
        e.preventDefault();
      }
    }
  };

  // Retorno visual del modal
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoEmpleado.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre"
              isInvalid={validarNombre(nuevoEmpleado.nombre) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarNombre(nuevoEmpleado.nombre)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoEmpleado.apellido}
              onChange={handleInputChange}
              placeholder="Ingresa el apellido"
              isInvalid={validarApellido(nuevoEmpleado.apellido) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarApellido(nuevoEmpleado.apellido)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={nuevoEmpleado.correo}
              onChange={handleInputChange}
              placeholder="Ingresa el correo"
              isInvalid={validarCorreo(nuevoEmpleado.correo) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarCorreo(nuevoEmpleado.correo)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono (xxxx-xxxx)</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={nuevoEmpleado.telefono}
              onChange={handleInputChange}
              onKeyPress={(e) => handleKeyPress(e, "telefono")}
              placeholder="Ejemplo: 1234-5678"
              isInvalid={validarTelefono(nuevoEmpleado.telefono) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarTelefono(nuevoEmpleado.telefono)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cédula (xxx-xxxxxx-xxxxX)</Form.Label>
            <Form.Control
              type="text"
              name="cedula"
              value={nuevoEmpleado.cedula}
              onChange={handleInputChange}
              placeholder="Ejemplo: 121-300897-0004Y"
              isInvalid={validarCedula(nuevoEmpleado.cedula) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarCedula(nuevoEmpleado.cedula)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="contraseña"
              value={nuevoEmpleado.contraseña}
              onChange={handleInputChange}
              placeholder="Ingresa la contraseña"
              isInvalid={validarContraseña(nuevoEmpleado.contraseña) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarContraseña(nuevoEmpleado.contraseña)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="confirmarContraseña"
              value={nuevoEmpleado.confirmarContraseña}
              onChange={handleInputChange}
              placeholder="Confirma la contraseña"
              isInvalid={validarConfirmarContraseña(nuevoEmpleado.confirmarContraseña, nuevoEmpleado.contraseña) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarConfirmarContraseña(nuevoEmpleado.confirmarContraseña, nuevoEmpleado.contraseña)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="fechaNacimiento"
              value={nuevoEmpleado.fechaNacimiento || ""}
              onChange={handleInputChange}
              isInvalid={validarFechaNacimiento(nuevoEmpleado.fechaNacimiento) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarFechaNacimiento(nuevoEmpleado.fechaNacimiento)}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Foto del Empleado</Form.Label>
            <Form.Control
              type="file"
              name="foto"
              onChange={handleFileChange}
              isInvalid={validarArchivo(nuevoEmpleado.foto) !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validarArchivo(nuevoEmpleado.foto)}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddEmpleado} disabled={!valid}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroEmpleado;
