// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Productos = () => {
  // Estados
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Cargar datos
  useEffect(() => {
    const unsubscribeProductos = onSnapshot(productosCollection, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setProductos(fetched);
      setProductosFiltrados(fetched);
    });

    const unsubscribeCategorias = onSnapshot(categoriasCollection, (snapshot) => {
      setCategorias(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
      unsubscribeProductos();
      unsubscribeCategorias();
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Buscador
  const handeleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    const filtrados = productos.filter((p) =>
      p.nombre.toLowerCase().includes(text) ||
      p.precio.toString().toLowerCase().includes(text) ||
      p.categoria.toLowerCase().includes(text)
    );
    setProductosFiltrados(filtrados);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.categoria || !nuevoProducto.imagen) {
      alert("Completa todos los campos.");
      return;
    }

    setShowModal(false);
    const tempId = `temp_${Date.now()}`;
    const productoConId = { ...nuevoProducto, id: tempId, precio: parseFloat(nuevoProducto.precio) };

    try {
      setProductos((prev) => [...prev, productoConId]);
      setProductosFiltrados((prev) => [...prev, productoConId]);
      await addDoc(productosCollection, productoConId);
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
    } catch (error) {
      console.error("Error al agregar:", error);
    }
  };

  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria || !productoEditado.imagen) {
      alert("Completa todos los campos.");
      return;
    }

    setShowEditModal(false);
    const ref = doc(db, "productos", productoEditado.id);

    try {
      await updateDoc(ref, {
        ...productoEditado,
        precio: parseFloat(productoEditado.precio),
      });
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  const handleDeleteProducto = async () => {
    if (!productoAEliminar) return;
    setShowDeleteModal(false);
    try {
      await deleteDoc(doc(db, "productos", productoAEliminar.id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleCopy = (producto) => {
    const text = `Nombre: ${producto.nombre}\nPrecio: C$${producto.precio}\nCategoría: ${producto.categoria}`;
    navigator.clipboard.writeText(text).then(() => console.log("Copiado"), (err) => console.error(err));
  };

  // PDF tabla
  const generarPDFProductos = () => {
    const doc = new jsPDF();
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 20, "F");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Reporte de Productos", 105, 13, { align: "center" });

    autoTable(doc, {
      startY: 30,
      head: [["Nombre", "Precio", "Categoría"]],
      body: productos.map((p) => [
        p.nombre,
        `C$${parseFloat(p.precio).toFixed(2)}`,
        p.categoria,
      ]),
    });

    const fecha = new Date().toISOString().split("T")[0];
    doc.save(`Productos_${fecha}.pdf`);
  };

  // PDF con imagen individual
  const generarPDFDetalleProducto = (producto) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 88);
    doc.text("Reporte Detallado de Producto", 105, 20, { align: "center" });

    let y = 40;
    if (producto.imagen) {
      try {
        doc.addImage(producto.imagen, "JPEG", 15, y, 40, 40);
        y += 50;
      } catch (e) {
        console.warn("Error con imagen:", e);
      }
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${producto.nombre}`, 15, y + 5);
    doc.text(`Precio: C$${parseFloat(producto.precio).toFixed(2)}`, 15, y + 15);
    doc.text(`Categoría: ${producto.categoria}`, 15, y + 25);

    const fecha = new Date().toISOString().split("T")[0];
    doc.save(`Producto_${producto.nombre}_${fecha}.pdf`);
  };

  // Excel
  const exportarExcelProductos = () => {
    const datos = productos.map((p) => ({
      Nombre: p.nombre,
      Precio: parseFloat(p.precio).toFixed(2),
      Categoría: p.categoria,
    }));
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fecha = new Date().toISOString().split("T")[0];
    const archivo = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(archivo, `Productos_${fecha}.xlsx`);
  };

  const paginatedProductos = productosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container className="pt-5 mt-5">

      <h4>Gestión de Productos</h4>
      <div className="d-flex mb-3">
        <Button onClick={() => setShowModal(true)}>Agregar producto</Button>
        <Button className="ms-2" variant="danger" onClick={generarPDFProductos}>
          Generar reporte PDF
        </Button>
        <Button className="ms-2" variant="success" onClick={exportarExcelProductos}>
          Generar Excel
        </Button>
      </div>
      <CuadroBusquedas searchText={searchText} handeleSearchChange={handeleSearchChange} />
      <TablaProductos
        productos={paginatedProductos}
        openEditModal={(p) => {
          setProductoEditado(p);
          setShowEditModal(true);
        }}
        openDeleteModal={(p) => {
          setProductoAEliminar(p);
          setShowDeleteModal(true);
        }}
        totalItems={productos.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleCopy={handleCopy}
        generarPDFDetalleProducto={generarPDFDetalleProducto} // NUEVO
      />
      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={productosFiltrados.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <ModalRegistroProducto
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoProducto={nuevoProducto}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleAddProducto={handleAddProducto}
        categorias={categorias}
      />
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
      <ModalEliminacionProducto
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteProducto={handleDeleteProducto}
      />
    </Container>
  );
};

export default Productos;
