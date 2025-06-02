import React from "react";
import { Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsClipboard, BsPencil, BsTrash } from "react-icons/bs";
import { BiSolidFilePdf } from "react-icons/bi"; // ✅ Icono PDF

const TablaProductos = ({
  productos,
  openEditModal,
  openDeleteModal,
  handleCopy,
  generarPDFDetalleProducto, // ✅ NUEVO
}) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center">
              No hay productos para mostrar.
            </td>
          </tr>
        ) : (
          productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>C${parseFloat(producto.precio).toFixed(2)}</td>
              <td>{producto.categoria}</td>
              <td>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Generar PDF</Tooltip>}
                >
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="me-1"
                    onClick={() => generarPDFDetalleProducto(producto)}
                  >
                    <BiSolidFilePdf />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Editar</Tooltip>}
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => openEditModal(producto)}
                  >
                    <BsPencil />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Eliminar</Tooltip>}
                >
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="me-1"
                    onClick={() => openDeleteModal(producto)}
                  >
                    <BsTrash />
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Copiar al portapapeles</Tooltip>}
                >
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleCopy(producto)}
                  >
                    <BsClipboard />
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default TablaProductos;
