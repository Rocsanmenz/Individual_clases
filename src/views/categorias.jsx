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

import TablaCategorias from "../components/categorias/TablaCategorias";
import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "", descripcion: "" });
    const [categoriaEditada, setCategoriaEditada] = useState(null);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
    const [searchText, setSearchText] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    const categoriasCollection = collection(db, "categorias");

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

    useEffect(() => {
        const unsubscribe = onSnapshot(categoriasCollection, (snapshot) => {
            const fetched = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setCategorias(fetched);
            setCategoriasFiltradas(filtrarCategorias(searchText, fetched));

            if (isOffline) console.log("Datos de categorías obtenidos desde caché.");
        });

        return () => unsubscribe();
    }, [searchText, isOffline]);

    const filtrarCategorias = (texto, lista) => {
        const txt = texto.toLowerCase();
        return lista.filter((cat) =>
            cat.nombre.toLowerCase().includes(txt) ||
            cat.descripcion.toLowerCase().includes(txt)
        );
    };

    const handleSearchChange = (e) => {
        const text = e.target.value;
        setSearchText(text);
        setCategoriasFiltradas(filtrarCategorias(text, categorias));
        setCurrentPage(1);
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

        setShowModal(false);

        const tempId = `temp_${Date.now()}`;
        const categoriaConId = { ...nuevaCategoria, id: tempId };

        try {
            setCategorias((prev) => [...prev, categoriaConId]);
            setCategoriasFiltradas((prev) => [...prev, categoriaConId]);
            setNuevaCategoria({ nombre: "", descripcion: "" });
            await addDoc(categoriasCollection, nuevaCategoria);

            if (isOffline) {
                console.log("Categoría agregada localmente (sin conexión).");
            } else {
                console.log("Categoría agregada exitosamente en la nube.");
            }
        } catch (error) {
            console.error("Error al agregar la categoría:", error);

            if (isOffline) {
                console.log("Offline: Categoría almacenada localmente.");
            } else {
                setCategorias((prev) => prev.filter((cat) => cat.id !== tempId));
                setCategoriasFiltradas((prev) => prev.filter((cat) => cat.id !== tempId));
                alert("Error al agregar la categoría: " + error.message);
            }
        }
    };

    const handleEditCategoria = async () => {
        if (!categoriaEditada?.nombre || !categoriaEditada?.descripcion) {
            alert("Por favor, completa todos los campos antes de actualizar.");
            return;
        }
        try {
            const categoriaRef = doc(db, "categorias", categoriaEditada.id);
            await updateDoc(categoriaRef, categoriaEditada);
            setShowEditModal(false);
        } catch (error) {
            console.error("Error al actualizar la categoría:", error);
        }
    };

    const handleDeleteCategoria = async () => {
        if (!categoriaAEliminar) return;

        setShowDeleteModal(false);

        try {
            setCategorias((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));
            setCategoriasFiltradas((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));

            const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
            await deleteDoc(categoriaRef);

            if (isOffline) {
                console.log("Categoría eliminada localmente (sin conexión).");
            } else {
                console.log("Categoría eliminada exitosamente en la nube.");
            }
        } catch (error) {
            console.error("Error al eliminar la categoría:", error);

            if (isOffline) {
                console.log("Offline: Eliminación almacenada localmente.");
            } else {
                setCategorias((prev) => [...prev, categoriaAEliminar]);
                setCategoriasFiltradas((prev) => [...prev, categoriaAEliminar]);
                alert("Error al eliminar la categoría: " + error.message);
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

    const currentItems = categoriasFiltradas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCopy = (categoria) => {
        const rowData = `Nombre: ${categoria.nombre}\nDescripción: ${categoria.descripcion}`;

        navigator.clipboard
            .writeText(rowData)
            .catch((err) => {
                console.error("Error al copiar al portapapeles:", err);
            });
    };

    return (
        <Container className="mt-5">
            <br />
            <h4>Gestión de Categorías</h4>
            <Button className="mb-3" onClick={() => setShowModal(true)}>
                Agregar categoría
            </Button>

            <CuadroBusquedas
                searchText={searchText}
                handleSearchChange={handleSearchChange}
            />

            <TablaCategorias
                categorias={currentItems}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
                handleCopy={handleCopy}
            />

            <Paginacion
                itemsPerPage={itemsPerPage}
                totalItems={categoriasFiltradas.length}
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
        </Container>
    );
};

export default Categorias;