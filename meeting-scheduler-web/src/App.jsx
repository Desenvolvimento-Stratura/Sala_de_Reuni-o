import { useEffect, useState } from "react";

function App() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetch("https://localhost:5087/api/Rooms")
            .then((response) => response.json())
            .then((data) => setRooms(data))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div>
            <h1>Salas</h1>

            <ul>
                {rooms.map((room) => (
                    <li key={room.id}>
                        {room.name} - Capacidade: {room.capacity}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;