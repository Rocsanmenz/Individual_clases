import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import GraficoProductos from "../components/estadisticas/GraficoProductos";

const Estadisticas = () => {
    const [productos, setProductos] = useState([]);
    const productosCollection = collection(db, 'productos');

    useEffect(() => {
        const unsubscribe = onSnapshot(productosCollection, (snapshot) => {
        const fetchedProductos = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));
            setProductos(fetchedProductos);
        }, (error) => {
            console.error('Error al cargar productos:', error);
            alert('Error al cargar productos: ' + error.message);
        });

        return () => unsubscribe();
    }, []);

    // Corrección: campos deben ser "nombre" y "precio"
    const nombres = productos.map((producto) => producto.nombre);
    const precios = productos.map((producto) => parseFloat(producto.precio));

    return (
        <Container className="mt-5">
            <h4 className="text-center">Estadísticas</h4>
            <Row className="mt-4">
               <Col xs={12} ms={12} md={12} lg={6} className="mb-4">
                    <GraficoProductos nombres={nombres} precios={precios} />
                </Col>
            </Row>
        </Container>
    );
};

export default Estadisticas;