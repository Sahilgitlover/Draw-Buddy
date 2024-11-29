import {
	createContext,
	MutableRefObject,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	deserializeKonvaElement,
	serializeKonvaElement,
} from "../utils/konva/convertKonva";
import axios from "axios";
import { RETRIVE_ROOM_ELEMENTS_API } from "../utils/apiRoutes";
import toast from "react-hot-toast";

const OFFLINE_SHAPES = "OFFLINE_SHAPES";

const context = createContext<{
	elementsArrRef: MutableRefObject<JSX.Element[]>;
	addElementToStage: (element: JSX.Element | null) => void;
	setMainElements: (element: JSX.Element[]) => void;
	flickerForLocalCreation: boolean;
	updateProject: (newId: string) => void;
	projectId: string;
}>({
	elementsArrRef: { current: [] },
	addElementToStage: () => {},
	setMainElements: () => {},
	flickerForLocalCreation: false,
	updateProject: () => {},
	projectId: OFFLINE_SHAPES,
});

export default function ElementsProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [projectId, setProjectId] = useState(OFFLINE_SHAPES);
	const elementsArrRef = useRef<JSX.Element[]>(
		(() => {
			if (projectId !== OFFLINE_SHAPES) return [];
			return (
				JSON.parse(localStorage.getItem(projectId) || "[]") as JSX.Element[]
			).map((elem) => deserializeKonvaElement(elem));
		})()
	);

	const [flickerForLocalCreation, setFlickerForLocalCreation] = useState(false);

	const addElementToStage = (element: JSX.Element | null) => {
		if (!element) return;
		elementsArrRef.current.push(element);
		setFlickerForLocalCreation((p) => !p);
	};
	const setMainElements = (elements: JSX.Element[]) => {
		elementsArrRef.current = elements || [];
		setFlickerForLocalCreation((p) => !p);
	};
	const updateProject = async (newId: string) => {
		console.log({ newId });

		toast.loading("Making room ready for you...");
		const { data } = await axios.post(RETRIVE_ROOM_ELEMENTS_API, {
			roomId: newId,
		});
		const elements = data.elements as JSX.Element[];
		setMainElements(elements.map((elem) => deserializeKonvaElement(elem)));
		toast.dismiss();
		toast.success("Room is ready");
		setProjectId(newId);
	};

	useEffect(() => {
		if (projectId === OFFLINE_SHAPES)
			localStorage.setItem(
				OFFLINE_SHAPES,
				JSON.stringify(
					elementsArrRef.current.map((elem) => serializeKonvaElement(elem))
				)
			);
	}, [elementsArrRef.current.length]);

	return (
		<context.Provider
			value={{
				elementsArrRef,
				addElementToStage,
				setMainElements,
				flickerForLocalCreation,
				updateProject,
				projectId,
			}}
		>
			{children}
		</context.Provider>
	);
}

export const useElements = () => useContext(context);
