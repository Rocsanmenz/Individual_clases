import React from "react";
import { Table } from "react-bootstrap";
import Paginacion from "../ordenamiento/Paginacion";
import { motion } from "framer-motion";

const TablaEmpleados = ({
  empleados,
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <>
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
            empleados.map((emp, index) => (
              <motion.tr
                key={emp.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={rowVariants}
              >
                <td>{emp.nombre}</td>
                <td>{emp.apellido}</td>
                <td>{emp.correo}</td>
                <td>{emp.telefono}</td>
                <td>{emp.cedula}</td>
                <td>{emp.fechaNacimiento}</td>
              </motion.tr>
            ))
          )}
        </tbody>
      </Table>

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
