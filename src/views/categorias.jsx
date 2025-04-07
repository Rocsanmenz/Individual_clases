import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Importaciones de componentes personalizados
import TablaCategorias from "../components/categorias/TablaCategorias";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import Cuadrobusqueda from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Categorias = () => {
  // Estados para manejo de datos
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltradas, setCategoriaFiltradas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Referencia a la colección de categorías en Firestore
  const categoriasCollection = collection(db, "categorias");

  const fetchCategorias = async () => {
    try {
      const data = await getDocs(categoriasCollection);
      const fetchedCategorias = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
      setCategoriaFiltradas(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handeleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    setCurrentPage(1); // Reinicia la página al buscar

    const filtradas = categorias.filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(text) ||
        categoria.descripcion.toLowerCase().includes(text)
    );

    setCategoriaFiltradas(filtradas);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCategoriaEditada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategoria = async () => {
    if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }
    try {
      await addDoc(categoriasCollection, nuevaCategoria);
      setShowModal(false);
      setNuevaCategoria({ nombre: "", descripcion: "" });
      await fetchCategorias();
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
    }
  };

  const handleEditCategoria = async () => {
    if (!categoriaEditada.nombre || !categoriaEditada.descripcion) {
      alert("Por favor, completa todos los campos antes de actualizar.");
      return;
    }
    try {
      const categoriaRef = doc(db, "categorias", categoriaEditada.id);
      await updateDoc(categoriaRef, categoriaEditada);
      setShowEditModal(false);
      await fetchCategorias();
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
    }
  };

  const handleDeleteCategoria = async () => {
    if (categoriaAEliminar) {
      try {
        const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
        await deleteDoc(categoriaRef);
        setShowDeleteModal(false);
        await fetchCategorias();
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
      }
    }
  };

  const openEditModal = (categoria) => {
    setCategoriaEditada({ ...categoria });
    setShowEditModal(true);
  };

  const openDeleteModal = (categoria) => {
    setCategoriaAEliminar(categoria);
    setShowDeleteModal(true);
  };

  // Calcular categorías paginadas
  const paginatedCategorias = categoriaFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Renderizado del componente
  return (
    <Container className="mt-5">
      <>
        <h4>Gestión de Categorías</h4>
        <Button className="mb-3" onClick={() => setShowModal(true)}>
          Agregar categoría
        </Button>

        <Cuadrobusqueda
          searchText={searchText}
          handeleSearchChange={handeleSearchChange}
        />

        <TablaCategorias
          categorias={paginatedCategorias}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
          totalItems={categoriaFiltradas.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <Paginacion
          itemsPerPage={itemsPerPage}
          totalItems={categoriaFiltradas.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <ModalRegistroCategoria
          showModal={showModal}
          setShowModal={setShowModal}
          nuevaCategoria={nuevaCategoria}
          handleInputChange={handleInputChange}
          handleAddCategoria={handleAddCategoria}
        />
        <ModalEdicionCategoria
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          categoriaEditada={categoriaEditada}
          handleEditInputChange={handleEditInputChange}
          handleEditCategoria={handleEditCategoria}
        />
        <ModalEliminacionCategoria
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleDeleteCategoria={handleDeleteCategoria}
        />
      </>
    </Container>
  );
};

export default Categorias;
