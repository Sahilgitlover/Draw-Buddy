import { io, Socket } from "socket.io-client";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { SOCKET_URL, ENSURE_SOCKET_SERVER_API } from "../utils/apiRoutes";
import axios from "axios";
import toast from "react-hot-toast";

const context = createContext<{ socket: Socket | null }>({
	socket: null,
});

export default function SocketProvider({ children }: { children: ReactNode }) {
	const socketRef = useRef(
		io(SOCKET_URL, { autoConnect: false, transports: ["websocket"] })
	);

	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		axios.get(ENSURE_SOCKET_SERVER_API).then(() => socketRef.current.connect());

		socketRef.current.on("connect", () => {
			toast.success("Socket server connected!");
			setIsConnected(true);
		});
		return () => {
			setIsConnected(false);
			socketRef.current.disconnect();
		};
	}, []);
	return (
		<context.Provider value={{ socket: socketRef.current }}>
			{isConnected && children}
		</context.Provider>
	);
}

export const useSocket = () => useContext(context) as { socket: Socket };
