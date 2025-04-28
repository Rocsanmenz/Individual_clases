import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import TablaProductos from "../components/productos/TablaProductos";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import Cuadrobusqueda from "../components/busquedas/CuadroBusquedas";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: ""
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
              const handleOnline = () => {
                setIsOffline(false);
              };
              const handleOffline = () => {
                setIsOffline(true);
              };
              window.addEventListener("online", handleOnline);
              window.addEventListener("offline", handleOffline);
              setIsOffline(!navigator.onLine);
              return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
              };
            }, []);
            
  const fetchData = () => {
    // Escuchar productos
    const unsubscribeProductos = onSnapshot(productosCollection, (snapshot) => {
      const fetchedProductos = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProductos(fetchedProductos);
      setProductosFiltrados(fetchedProductos);
      if (isOffline) {
        console.log("Offline: Productos cargados desde caché local.");
      }
    }, (error) => {
      console.error("Error al escuchar productos:", error);
      if (isOffline) {
        console.log("Offline: Mostrando datos desde caché local.");
      } else {
        alert("Error al cargar productos: " + error.message);
      }
    });
  // Escuchar categorías
      const unsubscribeCategorias = onSnapshot(categoriasCollection, (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
        if (isOffline) {
          console.log("Offline: Categorías cargadas desde caché local.");
        }
      }, (error) => {
        console.error("Error al escuchar categorías:", error);
        if (isOffline) {
          console.log("Offline: Mostrando categorías desde caché local.");
        } else {
          alert("Error al cargar categorías: " + error.message);
        }
      });

      return () => {
        unsubscribeProductos();
        unsubscribeCategorias();
      };
    };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);

    const filtrados = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(text) ||
      producto.descripcion?.toLowerCase().includes(text) || // opcional
      producto.categoria?.toLowerCase().includes(text)
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
    // Validar campos requeridos
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio ||
      !nuevoProducto.categoria ||
      !nuevoProducto.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }

    // Cerrar modal
    setShowModal(false);

    // Crear ID temporal y objeto del producto
    const tempId = `temp_${Date.now()}`;
    const productoConId = {
      ...nuevoProducto,
      id: tempId,
      precio: parseFloat(nuevoProducto.precio), // Asegurar que precio sea número
    };

    try {
      // Actualizar estado local
      setProductos((prev) => [...prev, productoConId]);
      setProductosFiltrados((prev) => [...prev, productoConId]);

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto agregado localmente (sin conexión).");
        alert("Sin conexión: Producto agregado localmente. Se sincronizará al reconectar.");
      } else {
        console.log("Producto agregado exitosamente en la nube.");
      }
      // Limpiar formulario
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });

      // Guardar en Firestore
      await addDoc(productosCollection, {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        categoria: nuevoProducto.categoria,
        imagen: nuevoProducto.imagen,
      });

    } catch (error) {
      console.error("Error al agregar el producto:", error);
      if (isOffline) {
        console.log("Offline: Producto almacenado localmente.");
      } else {
        // Revertir cambios locales si falla en la nube
        setProductos((prev) => prev.filter((prod) => prod.id !== tempId));
        setProductosFiltrados((prev) => prev.filter((prod) => prod.id !== tempId));
        alert("Error al agregar el producto: " + error.message);
      }
    }
  };

  const handleEditProducto = async () => {
    // Validar campos requeridos
    if (
      !productoEditado.nombre ||
      !productoEditado.precio ||
      !productoEditado.categoria ||
      !productoEditado.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }

    // Cerrar modal
    setShowEditModal(false);

    const productoRef = doc(db, "productos", productoEditado.id);

    try {
      // Actualizar estado local
      setProductos((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id
            ? { ...productoEditado, precio: parseFloat(productoEditado.precio) }
            : prod
        )
      );
      setProductosFiltrados((prev) =>
        prev.map((prod) =>
          prod.id === productoEditado.id
            ? { ...productoEditado, precio: parseFloat(productoEditado.precio) }
            : prod
        )
      );

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto actualizado localmente (sin conexión).");
        alert("Sin conexión: Producto actualizado localmente. Se sincronizará al reconectar.");
      } else {
        console.log("Producto actualizado exitosamente en la nube.");
      }

      // Actualizar en Firestore
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: parseFloat(productoEditado.precio),
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      if (isOffline) {
        console.log("Offline: Producto actualizado localmente.");
      } else {
        // Revertir cambios locales si falla en la nube
        setProductos((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id ? { ...prod } : prod
          )
        );
        setProductosFiltrados((prev) =>
          prev.map((prod) =>
            prod.id === productoEditado.id ? { ...prod } : prod
          )
        );
        alert("Error al actualizar el producto: " + error.message);
      }
    }
  };

  const handleDeleteProducto = async () => {
    if (!productoAEliminar) return;

    // Cerrar modal
    setShowDeleteModal(false);

    try {
      // Actualizar estado local
      setProductos((prev) => prev.filter((prod) => prod.id !== productoAEliminar.id));
      setProductosFiltrados((prev) => prev.filter((prod) => prod.id !== productoAEliminar.id));

      // Mensaje según estado de conexión
      if (isOffline) {
        console.log("Producto eliminado localmente (sin conexión).");
        alert("Sin conexión: Producto eliminado localmente. Se sincronizará al reconectar.");
      } else {
        console.log("Producto eliminado exitosamente en la nube.");
      }

      // Eliminar en Firestore
      const productoRef = doc(db, "productos", productoAEliminar.id);
      await deleteDoc(productoRef);

    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      if (isOffline) {
        console.log("Offline: Eliminación almacenada localmente.");
      } else {
        // Restaurar producto en estado local si falla en la nube
        setProductos((prev) => [...prev, productoAEliminar]);
        setProductosFiltrados((prev) => [...prev, productoAEliminar]);
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Productos</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar producto
      </Button>

      <Cuadrobusqueda
        searchText={searchText}
        handeleSearchChange={handleSearchChange}
      />

      <TablaProductos
        productos={productosFiltrados}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
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
