import { Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js/auto";

const GraficoProductos = ({ nombres, precios }) => {
  const data = {
    labels: nombres,
    datasets: [
      {
        label: "Precios (C$)",
        data: precios,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // negro opaco
        borderColor: "rgba(0, 0, 0, 1)",       // negro puro
        borderWidth: 1,
      },
    ],
  };

    const options = {
        responsive: true,
        plugins: {
            legend: {
            position: "top",
            labels: {
                color: "#000", // color negro para leyenda
                },
                },
                title: {
                display: true,
                text: "Precios de Productos",
                color: "#000",
                font: {
                    size: 16,
            },
                },
            },
            scales: {
                x: {
                ticks: {
                    color: "#000", // negro para etiquetas X
                },
                title: {
                    display: true,
                    text: "Productos",
                    color: "#000",
                },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                color: "#000", // negro para etiquetas Y
                },
                title: {
                    display: true,
                    text: "Precio (C$)",
                    color: "#000",
                },
            },
        },
    };

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Card>
                <Card.Body>
                    <Card.Title className="text-center text-dark">Gráfico de Productos</Card.Title>
                    <Bar data={data} options={options} />
                </Card.Body>
            </Card>
         </div>
  );
};

export default GraficoProductos