import React, { useState, useEffect } from "react";
import { Container, Row, Form, Col } from "react-bootstrap";
import { db } from "../database/firebaseConfig";
import { collection, updateDoc, getDocs, doc } from "firebase/firestore";
import TarjetaProducto from "../components/catalogo/TarjetaProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import Cuadrobusqueda from "../components/busquedas/CuadroBusquedas";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoEditado, setProductoEditado] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [searchText, setSearchText] = useState("");

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const fetchData = async () => {
    try {
      const productosData = await getDocs(productosCollection);
      const fetchedProductos = productosData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(fetchedProductos);

      const categoriasData = await getDocs(categoriasCollection);
      const fetchedCategorias = categoriasData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const handeleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, productoEditado);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
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

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtro combinado (categoría + texto de búsqueda)
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "Todas" || producto.categoria === categoriaSeleccionada;

    const coincideBusqueda =
      producto.nombre?.toLowerCase().includes(searchText) ||
      producto.descripcion?.toLowerCase().includes(searchText) ||
      producto.categoria?.toLowerCase().includes(searchText);

    return coincideCategoria && coincideBusqueda;
  });

  return (
    <Container className="mt-5">
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />

      <h4>Catálogo de Productos</h4>

      <Row className="mb-3">
        <Col lg={4} md={6} sm={12}>
          <Form.Group>
            <Form.Label>Filtrar por categoría:</Form.Label>
            <Form.Select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nombre}>
                  {categoria.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col lg={6} md={6} sm={12}>
          <Form.Label>Buscar productos:</Form.Label>
          <Cuadrobusqueda
            searchText={searchText}
            handeleSearchChange={handeleSearchChange}
          />
        </Col>
      </Row>

      <Row>
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              openEditModal={openEditModal}
            />
          ))
        ) : (
          <p>No hay productos que coincidan con la búsqueda.</p>
        )}
      </Row>
    </Container>
  );
};

export default Catalogo;

