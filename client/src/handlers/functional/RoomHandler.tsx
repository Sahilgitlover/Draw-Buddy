import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../providers/SocketProvider";
import { useElements } from "../../providers/ElementsProvider";
import {
	deserializeKonvaElement,
	serializeKonvaElement,
} from "../../utils/konva/convertKonva";
import toast from "react-hot-toast";
import { IPeers } from "../../utils/types";
import { useMyNewElement } from "../../providers/MyNewElementProvider";
import { Circle, Group } from "react-konva";
import { useStage } from "../../providers/StageProvider";

export default function RoomHandler() {
	const { id: roomId } = useParams();
	const { socket } = useSocket();

	const username = (() => {
		const x = localStorage.getItem("username");
		if (x) return x;
		const newName = "InstantUser " + (Math.random() * 1000).toFixed();
		localStorage.setItem("username", newName);
		return newName;
	})();

	const { getMousePos } = useStage();
	const { elementsArrRef, addElementToStage, setMainElements } = useElements();

	const { myNewElement } = useMyNewElement();
	const [peers, setPeers] = useState<IPeers>({});

	useEffect(() => {
		socket.emit("creating new element", {
			element: myNewElement ? serializeKonvaElement(myNewElement) : null,
			roomId,
		});
		if (!myNewElement && elementsArrRef.current.length)
			socket.emit("finalized new element", {
				element: serializeKonvaElement(
					elementsArrRef.current[elementsArrRef.current.length - 1]
				),
				roomId,
			});
	}, [myNewElement]);

	useEffect(() => {
		socket.emit("i arrived at room", {
			roomId,
			username,
			havingElements: elementsArrRef.current.length,
		});

		socket.on("previous_users", (prevUsers: IPeers) => {
			setPeers(prevUsers);
			toast(`Joined in a room with ${Object.keys(prevUsers).length} other(s)`);
			console.log(prevUsers);
		});

		socket.on("update_elements", (prevElements: JSX.Element[]) => {
			setMainElements(
				prevElements.map((elem) => deserializeKonvaElement(elem))
			);
		});

		socket.on("new_user", (userObj: { userid: string; username: string }) => {
			setPeers((p) => {
				p[userObj.userid] = {
					tempElement: null,
					username: userObj.username,
					mousePos: { x: 0, y: 0 },
				};
				return p;
			});
			toast(userObj.username + " joined!");
		});

		socket.on("incoming_finalized_element", (element: JSX.Element) => {
			addElementToStage(deserializeKonvaElement(element));
		});

		socket.on(
			"incoming_element_in_making",
			({
				element,
				userid,
			}: {
				element: JSX.Element | null;
				userid: string;
			}) => {
				setPeers((p) => ({
					...p,
					[userid]: { ...p[userid], tempElement: element },
				}));
			}
		);

		socket.on("user_left", (userid) => {
			setPeers((p) => {
				if (!p[userid]) return p;
				toast(p[userid].username + " left the room");
				delete p[userid];
				return p;
			});
		});
		socket.on(
			"incoming_peer_mouse_position",
			({
				mousePos,
				userid,
			}: {
				mousePos: { x: number; y: number };
				userid: string;
			}) => {
				setPeers((p) => ({ ...p, [userid]: { ...p[userid], mousePos } }));
			}
		);
		document.addEventListener("mousemove", handleMouseMove);
		return () => {
			socket.removeAllListeners();
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	const handleMouseMove = (e: MouseEvent) => {
		const { x, y } = getMousePos(e.clientX, e.clientY);
		const mousePos = { x, y };
		socket.emit("my mouse position", {
			mousePos,
			roomId,
		});
	};

	return Object.keys(peers).map((userid) => {
		const { username, tempElement, mousePos } = peers[userid];
		return (
			<Group key={userid}>
				{tempElement ? deserializeKonvaElement(tempElement) : null}
				{mousePos && (
					<Circle x={mousePos.x} y={mousePos.y} radius={10} fill={"red"} />
				)}
			</Group>
		);
	});
}
