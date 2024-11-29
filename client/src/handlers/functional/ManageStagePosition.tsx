import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useElements } from "../../providers/ElementsProvider";
import { IPoint } from "../../utils/types";

export default function ManageStagePos({
	stagePos,
	setStagePos,
	setStageScale,
}: {
	stagePos: IPoint;
	setStagePos: Dispatch<SetStateAction<IPoint>>;
	setStageScale: Dispatch<SetStateAction<number>>;
}) {
	const [inputPos, setInputPos] = useState({ x: 0, y: 0 });
	const { elementsArrRef } = useElements();

	const [len, setLen] = useState(0);
	const [curr, setCurr] = useState(-1);

	useEffect(() => {
		setInputPos(stagePos);
	}, [stagePos]);

	useEffect(() => {
		const newLen = elementsArrRef.current.length;
		setLen(newLen);
	}, [elementsArrRef.current.length]);

	useEffect(() => {
		if (len <= 1) setCurr(-1);
	}, [len]);

	useEffect(() => {
		if (curr > -1 && curr < elementsArrRef.current.length) {
			setStagePos(elementsArrRef.current[curr].stagePos);
			setStageScale(elementsArrRef.current[curr].stageScale);
		}
	}, [curr]);

	const handleBack = () => {
		let x = curr;
		const thisPos = elementsArrRef.current[x].stagePos;
		while (x >= 1) {
			const prevPos = elementsArrRef.current[x - 1].stagePos;
			if (thisPos.x !== prevPos.x || thisPos.y !== prevPos.y) {
				setCurr(x - 1);
				return;
			}
			x--;
		}
		setCurr(curr - 1);
	};
	// const handleNext = () => {
	// 	let x = curr;
	// 	const thisPos = elementsArrRef.current[x].stagePos;
	// 	while (x <= len - 2) {
	// 		const nextPos = elementsArrRef.current[x + 1].stagePos;
	// 		if (thisPos.x !== nextPos.x || thisPos.y !== nextPos.y) {
	// 			setCurr(x + 1);
	// 			return;
	// 		}
	// 		x++;
	// 	}
	// 	setCurr(curr + 1);
	// };

	return (
		<div
			className="absolute top-4 right-4 flex flex-col items-end gap-4 select-none z-50"
			onMouseDown={(e) => e.stopPropagation()}
		>
			<div className="[&>input]:text-black [&>input]:px-1 [&>input]:w-16 [&>input]:text-center flex gap-2 font-semibold">
				<p className="font-normal">Change: </p>
				<p>x</p>
				<input
					value={inputPos.x.toFixed()}
					onChange={(e) => {
						const val = parseInt(e.target.value);
						setStagePos((p) => ({
							...p,
							x: Number.isNaN(val) ? 0 : val,
						}));
					}}
				/>
				<p>y</p>
				<input
					value={inputPos.y.toFixed()}
					onChange={(e) => {
						const val = parseInt(e.target.value);
						setStagePos((p) => ({
							...p,
							y: Number.isNaN(val) ? 0 : val,
						}));
					}}
				/>
			</div>
			{len ? (
				<div className="[&>button]:bg-blue-700 [&>button]:p-2 flex gap-2 [&>button]:font-semibold items-center">
					<p>Teleport: </p>
					{curr >= 1 && <button onClick={handleBack}>Back</button>}
					{/* {curr < len - 1 && <button onClick={handleNext}>Next</button>} */}
					<button
						onClick={() => {
							setStagePos(elementsArrRef.current[len - 1].stagePos);
							setStageScale(elementsArrRef.current[len - 1].stageScale);
							setCurr(len - 1);
						}}
					>
						Last
					</button>
				</div>
			) : null}
		</div>
	);
}
