
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  updateDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";

const ChatIA = ({ showChatModal, setShowChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const chatCollection = collection(db, "chat");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajesObtenidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(mensajesObtenidos);
    });
    return () => unsubscribe();
  }, []);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;
    const nuevoMensaje = {
      texto: mensaje,
      emisor: "usuario",
      timestamp: new Date(),
    };

    setCargando(true);
    setMensaje("");

    try {
      await addDoc(chatCollection, nuevoMensaje);

      const { accion, nombre, descripcion, nuevoNombre, respuesta } = await obtenerRespuestaIA(mensaje);



      if (accion === "contar") {
        const snap = await getDocs(categoriasCollection);
        await addDoc(chatCollection, {
          texto: `Tienes ${snap.size} categorías registradas.`,
          emisor: "IA",
          timestamp: new Date(),
        });

      } else if (accion === "listar") {
        const snap = await getDocs(categoriasCollection);
        const lista = snap.docs.map((d) => `• ${d.data().nombre}`).join("\n");
        await addDoc(chatCollection, {
          texto: `Categorías registradas:\n${lista}`,
          emisor: "IA",
          timestamp: new Date(),
        });

      } else if (accion === "eliminar") {
        if (!nombre) {
          await addDoc(chatCollection, {
            texto: "Debes proporcionar el nombre de la categoría a eliminar.",
            emisor: "IA",
            timestamp: new Date(),
          });
        } else {
          const snap = await getDocs(categoriasCollection);
          const docBorrar = snap.docs.find(
            (d) => d.data().nombre.toLowerCase() === nombre.toLowerCase()
          );
          if (docBorrar) {
            await deleteDoc(doc(db, "categorias", docBorrar.id));
            await addDoc(chatCollection, {
              texto: `Categoría "${nombre}" eliminada exitosamente.`,
              emisor: "IA",
              timestamp: new Date(),
            });
          } else {
            await addDoc(chatCollection, {
              texto: `No se encontró la categoría "${nombre}".`,
              emisor: "IA",
              timestamp: new Date(),
            });
          }
        }

      } else if (accion === "editar") {
        if (!nombre) {
          await addDoc(chatCollection, {
            texto: "Debes proporcionar el nombre de la categoría a editar.",
            emisor: "IA",
            timestamp: new Date(),
          });
        } else {
          const snap = await getDocs(categoriasCollection);
          const docEditar = snap.docs.find(
            (d) => d.data().nombre.toLowerCase() === nombre.toLowerCase()
          );
          if (docEditar) {
            const updates = {};
            if (nuevoNombre) updates.nombre = nuevoNombre;


            if (descripcion) updates.descripcion = descripcion;

            if (Object.keys(updates).length === 0) {
              await addDoc(chatCollection, {
                texto: "No se proporcionó ningún dato nuevo para actualizar.",
                emisor: "IA",
                timestamp: new Date(),
              });
            } else {
              await updateDoc(doc(db, "categorias", docEditar.id), updates);
              await addDoc(chatCollection, {
                texto: `Se actualizó la categoría "${nombre}". ${nuevoNombre ? `Nuevo nombre: "${nuevoNombre}". ` : ""
                  }${descripcion ? `Nueva descripción: "${descripcion}".` : ""}`,

                emisor: "IA",
                timestamp: new Date(),
              });
            }
          } else {
            await addDoc(chatCollection, {
              texto: `No se encontró la categoría "${nombre}".`,
              emisor: "IA",
              timestamp: new Date(),
            });
          }
        }


      } else if (accion === "crear") {
        if (!nombre || !descripcion) {
          await addDoc(chatCollection, {
            texto: "Faltan datos para crear la categoría.",
            emisor: "IA",
            timestamp: new Date(),
          });
        } else {
          await addDoc(categoriasCollection, {
            nombre,
            descripcion,
            timestamp: new Date(),
          });
          await addDoc(chatCollection, {
            texto: `Categoría "${nombre}" creada exitosamente.`,
            emisor: "IA",
            timestamp: new Date(),
          });
        }

      } else {
        await addDoc(chatCollection, {
          texto:
            respuesta ||
            'Hola, puedes decirme cosas como: "crea una categoría", "elimina una", "cuántas hay", "edita la descripción de..."',
          emisor: "IA",
          timestamp: new Date(),
        });
      }

    } catch {
      await addDoc(chatCollection, {
        texto: "Ocurrió un error inesperado. Intenta de nuevo.",
        emisor: "IA",
        timestamp: new Date(),
      });
    } finally {
      setCargando(false);
    }
  };

  const obtenerRespuestaIA = async (promptUsuario) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const prompt = `
Eres un asistente que gestiona categorías de una base de datos. Tu tarea es analizar el siguiente mensaje del usuario y devolver una respuesta en formato JSON con la intención.

Posibles acciones: "crear", "eliminar", "listar", "contar", "editar", "ayuda".

Estructura del JSON de respuesta:
{
  "accion": "crear" | "eliminar" | "listar" | "contar" | "editar" | "ayuda",
  "nombre": "nombre de la categoría (si aplica)",
  "descripcion": "nueva descripción (si aplica)",
  + "nuevoNombre": "nuevo nombre si desea cambiarlo",
  "respuesta": "mensaje para mostrar al usuario"
}

Mensaje del usuario: "${promptUsuario}"
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" },
          }),
        }
      );

      const data = await response.json();
      return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    } catch (error) {
      console.error("Error al obtener respuesta IA:", error);
      return { accion: "error", respuesta: "No se pudo conectar con la IA." };
    }
  };


  const limpiarChat = async () => {
    try {
      const snap = await getDocs(chatCollection);
      const eliminaciones = snap.docs.map((docu) =>
        deleteDoc(doc(db, "chat", docu.id))
      );
      await Promise.all(eliminaciones);
      await addDoc(chatCollection, {
        texto: "🧹 Chat limpiado exitosamente.",
        emisor: "IA",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error al limpiar el chat:", error);
      await addDoc(chatCollection, {
        texto: "Ocurrió un error al intentar limpiar el chat.",
        emisor: "IA",
        timestamp: new Date(),
      });
    }
  };


  return (
    <Modal
      show={showChatModal}
      onHide={() => setShowChatModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Chat con IA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup style={{ maxHeight: "300px", overflowY: "auto" }}>
          {mensajes.map((msg) => (
            <ListGroup.Item
              key={msg.id}
              className={`d-flex flex-column ${msg.emisor === "IA"
                ? "align-self-start bg-light text-dark"
                : "align-self-end bg-primary text-white"
                }`}
              style={{
                borderRadius: "10px",
                marginBottom: "10px",
                maxWidth: "80%",
                padding: "10px",
                whiteSpace: "pre-wrap",
              }}
            >
              <strong>{msg.emisor === "IA" ? "🤖 IA" : "👤 Tú"}:</strong>
              <span>
                {typeof msg.texto === "string"
                  ? msg.texto
                  : JSON.stringify(msg.texto)}
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <Form.Control
          className="mt-3"
          type="text"
          placeholder="Escribe tu mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={limpiarChat}>
          🧹 Limpiar Chat
        </Button>
        <Button variant="secondary" onClick={() => setShowChatModal(false)}>
          Cerrar
        </Button>
        <Button onClick={enviarMensaje} disabled={cargando}>
          {cargando ? <Spinner size="sm" animation="border" /> : "Enviar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatIA;