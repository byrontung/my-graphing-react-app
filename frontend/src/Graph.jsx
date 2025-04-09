import { Chart as ChartJS } from "chart.js/auto";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import revenueData from "./assets/revenueData.json";
import "./Graph.css";
import { useState, useEffect } from "react";
import axios from "axios";

function Graph() {
    const [carData, setCarData] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:3000/api/makes?order_by=count&limit=10")
            .then((res) => setCarData(res.data))
            .catch((err) => console.error(err));
    }, []);

    if (!carData){
        return
    }
    console.log(JSON.stringify(carData));
    return (
        <>
            <Bar
                data={{
                    labels: carData.map((data) => data.make),
                    datasets: [
                        {
                            label: "count",
                            data: carData.map((data) => data.count),
                            backgroundColor: "#85BB65",
                            borderColor: "#85BB65",
                        },
                    ],
                }}
            />
            <Bar
                data={{
                    labels: carData.map((data) => data.make),
                    datasets: [
                        {
                            label: "count",
                            data: carData.map((data) => Math.log(data.count)),
                            backgroundColor: "#85BB65",
                            borderColor: "#85BB65",
                        },
                    ],
                }}
            />
            <Pie
                data={{
                    labels: carData.map((data) => data.make),
                    datasets: [
                        {
                            label: "count",
                            data: carData.map((data) => data.count)
                        },
                    ],
                }}
            />
            <Doughnut
                data={{
                    labels: carData.map((data) => data.make),
                    datasets: [
                        {
                            label: "count",
                            data: carData.map((data) => data.count)
                        },
                    ],
                }}
            />
            {/* <Bar
                data={{
                    labels: revenueData.map((data) => data.label),
                    datasets: [
                        {
                            label: "Revenue",
                            data: revenueData.map((data) => data.revenue),
                            backgroundColor: "#85BB65",
                            borderColor: "#85BB65",
                        },
                        {
                            label: "Cost",
                            data: revenueData.map((data) => data.cost),
                            backgroundColor: "#E5446D",
                            borderColor: "#E5446D",
                        },
                    ],
                }}
            /> */}
        </>
    );
}

// function Graph() {
//   return (
//     <>
//       <Line
//         data={{
//           labels: revenueData.map((data) => data.label),
//           datasets: [{
//             label: "Revenue",
//             data: revenueData.map((data) => data.revenue),
//             backgroundColor: "#85BB65",
//             borderColor: "#85BB65"
//           },
//           {
//             label: "Cost",
//             data: revenueData.map((data) => data.cost),
//             backgroundColor: "#E5446D",
//             borderColor: "#E5446D"
//           }]
//         }}/>
//       <Bar
//         data={{
//           labels: revenueData.map((data) => data.label),
//           datasets: [{
//             label: "Revenue",
//             data: revenueData.map((data) => data.revenue),
//             backgroundColor: "#85BB65",
//             borderColor: "#85BB65"
//           },
//           {
//             label: "Cost",
//             data: revenueData.map((data) => data.cost),
//             backgroundColor: "#E5446D",
//             borderColor: "#E5446D"
//           }]
//         }}/>
//       <Doughnut
//         data={{
//           labels: revenueData.map((data) => data.label),
//           datasets: [{
//             label: "Revenue",
//             data: revenueData.map((data) => data.revenue),
//           },
//           {
//             label: "Cost",
//             data: revenueData.map((data) => data.cost),
//           }]
//         }}/>
//     </>
//     );
// }

// function Graph() {
//   return (
//     <>
//       <Line
//         datasetIdKey="id"
//         data={{
//           labels: ["Jun", "Jul", "Aug"],
//           datasets: [
//             {
//               id: 1,
//               label: "",
//               data: [5, 6, 7],
//             },
//             {
//               id: 2,
//               label: "",
//               data: [3, 2, 1],
//             },
//           ],
//         }}
//       />
//     </>
//   );
// }

export default Graph;
