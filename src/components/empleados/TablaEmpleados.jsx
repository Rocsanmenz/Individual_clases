import React from "react";
import { Table } from "react-bootstrap";
import Paginacion from "../ordenamiento/Paginacion";
import { Zoom } from "react-awesome-reveal";

const TablaEmpleados = ({
  empleados,
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <>
      <Zoom cascade triggerOnce delay={10} duration={600}>
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Cédula</th>
              <th>Fecha de nacimiento</th>
            </tr>
          </thead>
          <tbody>
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay empleados para mostrar.
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.nombre}</td>
                  <td>{emp.apellido}</td>
                  <td>{emp.correo}</td>
                  <td>{emp.telefono}</td>
                  <td>{emp.cedula}</td>
                  <td>{emp.fechaNacimiento}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Zoom>

      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default TablaEmpleados;
