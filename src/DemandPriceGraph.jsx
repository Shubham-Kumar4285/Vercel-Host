import React, { useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Import the CSS file
import './DemandPriceGraph.css';

const DemandPriceGraph = () => {
  const [totalDemand, setTotalDemand] = useState(0);
  const [highlightedRange, setHighlightedRange] = useState([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const chartRef = useRef(null);
  const [shadedData, setShadedData] = useState([]);

  // Demand curve data
  const originalData = [100, 80, 60, 40, 20, 0]; // The main demand curve
  const data = {
    labels: ["0", "10", "20", "30", "40", "50"],
    datasets: [
      {
        label: "Demand Curve",
        data: originalData,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
      },
      {
        label: "Selected Area",
        data: shadedData,
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.3)", // Shading color
        borderWidth: 0, // No border for the shaded area
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Price" } },
      y: { title: { display: true, text: "Demand" } },
    },
    plugins: {
      annotation: {
        annotations: {
          totalText: {
            type: "label",
            xValue: (highlightedRange[0] + highlightedRange[1]) / 2, // Midpoint of selection
            yValue: Math.max(...originalData) / 2, // Position at half the max demand
            content: totalDemand > 0 ? `Total: ${totalDemand}` : "",
            color: "black",
            font: { size: 14, weight: "bold" },
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            borderRadius: 4,
            padding: 6,
          },
        },
      },
    },
  };

  const handleMouseDown = (event) => {
    const chart = chartRef.current;
    if (!chart) return;

    const startIndex = getIndexFromEvent(event, chart);
    setIsDragging(true);
    setHighlightedRange([startIndex, startIndex]); // Start with a single-point selection
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    const chart = chartRef.current;
    if (!chart) return;

    const endIndex = getIndexFromEvent(event, chart);
    if (endIndex >= highlightedRange[0]) {
      setHighlightedRange([highlightedRange[0], endIndex]);
      updateShading(highlightedRange[0], endIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    updateChartAnnotations(); // Update annotation text when selection stops
  };

  const getIndexFromEvent = (event, chart) => {
    const { offsetX } = event.nativeEvent;
    const { left, right } = chart.chartArea;
    const index = Math.round(
      ((offsetX - left) / (right - left)) * (data.labels.length - 1)
    );
    return Math.min(Math.max(index, 0), data.labels.length - 1);
  };

  const updateShading = (startIndex, endIndex) => {
    const newShadedData = originalData.map((value, index) =>
      index >= startIndex && index <= endIndex ? value : null
    );

    setShadedData(newShadedData);

    // Calculate total demand
    const total = originalData
      .slice(startIndex, endIndex + 1)
      .reduce((acc, value) => acc + value, 0);
    setTotalDemand(total);
  };

  const updateChartAnnotations = () => {
    const chart = chartRef.current;
    if (!chart) return;

    // Set annotation at the midpoint
    const midpointIndex = Math.floor(
      (highlightedRange[0] + highlightedRange[1]) / 2
    );
    const midpointX = data.labels[midpointIndex];
    const midpointY = totalDemand / 2; // Position label in the middle

    chart.options.plugins.annotation.annotations = {
      totalText: {
        type: "label",
        xValue: midpointX,
        yValue: midpointY,
        content: `Total: ${totalDemand}`,  // Always display total
        color: "black",
        font: { size: 14, weight: "bold" },
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 4,
        padding: 6,
      },
    };

    chart.update();
  };

  return (
    <div className="card">
      <h2>Interactive Demand-Price Graph</h2>
      <div
        style={{
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          width: "500px",
          height: "400px",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Line ref={chartRef} data={data} options={chartOptions} />
      </div>
      <div style={{ marginTop: "20px" }}>
        <strong>Total Demand for Highlighted Range:</strong> {totalDemand}
      </div>
      {highlightedRange[1] > 0 && (
        <div>
          Highlighted Range: {data.labels[highlightedRange[0]]} to{" "}
          {data.labels[highlightedRange[1]]}
        </div>
      )}
    </div>
  );
};

export default DemandPriceGraph;
