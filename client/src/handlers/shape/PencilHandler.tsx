import { useEffect, useState } from "react";
import { Line } from "react-konva";
import { useStage } from "../../providers/StageProvider";
import { useElements } from "../../providers/ElementsProvider";
import { useToolSettings } from "../../providers/ToolSettingsProvider";
import { useMyNewElement } from "../../providers/MyNewElementProvider";

export default function PencilHandler() {
	const [pointsArr, setPointsArr] = useState<number[]>([]);
	const [drawing, setDrawing] = useState(false);
	const { getMousePos } = useStage();

	const { elementsArrRef, addElementToStage } = useElements();
	const { myNewElement, setMyNewElement } = useMyNewElement();

	const { strokeColor, strokeWidth, opacity, dashGap } = useToolSettings();

	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return;
			setDrawing(true);
			const { x, y } = getMousePos(e.clientX, e.clientY);
			setPointsArr([x, y]);
		};
		const handleMouseMove = (e: MouseEvent) => {
			if (!drawing) return;
			const { x, y } = getMousePos(e.clientX, e.clientY);
			setPointsArr([...pointsArr, x, y]);
			setMyNewElement(
				<Line
					key={"Pencil" + elementsArrRef.current.length}
					points={pointsArr}
					strokeEnabled
					strokeWidth={strokeWidth}
					stroke={strokeColor}
					lineCap="round"
					opacity={opacity}
					dashEnabled={dashGap > 0}
					dash={[dashGap]}
				/>
			);
		};
		const handleMouseUp = () => {
			addElementToStage(myNewElement);
			setDrawing(false);
			setMyNewElement(null);
		};
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [drawing, myNewElement, pointsArr]);

	return null;
}
