import { MessageSquare, Users, Settings } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
	const [panel, setPanel] = useState<"contacts" | "conversations">("conversations");

	const navButton = `
		relative grid h-12 w-full place-items-center
		border shadow-[2px_2px_0_#160707]
		transition-none
	`;

	const activeButton = `
		border-red-600
		bg-[#651414]
		text-red-100
	`;

	const inactiveButton = `
		border-red-950
		bg-[#351b1b]
		text-red-400
		hover:border-red-700
		hover:bg-[#4b1717]
		hover:text-red-100
	`;

	return (
		<aside className="flex h-screen">
			<nav
				className="
					flex w-19 flex-col items-center
					border-r-2 border-red-900
					bg-[#2a1b1b]
					py-3
					shadow-[inset_-8px_0_18px_rgba(0,0,0,0.35)]
				"
			>
				<div
					className="
						mb-8 flex h-12 w-12 flex-col items-center justify-center
						border-2 border-red-700
						bg-[#4a1212]
						font-mono font-black
						text-red-100
						shadow-[3px_3px_0_#160707]
					"
				>
					<span className="text-[9px] tracking-[0.2em] text-red-400">
						CACO
					</span>

					<span className="-mt-1 text-2xl leading-none">
						C
					</span>
				</div>

				<div className="flex w-full flex-col gap-2 px-2">
					<button
						className={`${navButton} ${
							panel === "conversations"
								? activeButton
								: inactiveButton
						}`}
						onClick={() => setPanel("conversations")}
						aria-label="Conversations"
					>
						{panel === "conversations" && (
							<span className="absolute left-0 top-0 h-full w-1 bg-red-500" />
						)}

						<MessageSquare size={22} strokeWidth={2.2} />
					</button>

					<button
						className={`${navButton} ${
							panel === "contacts"
								? activeButton
								: inactiveButton
						}`}
						onClick={() => setPanel("contacts")}
						aria-label="Contacts"
					>
						{panel === "contacts" && (
							<span className="absolute left-0 top-0 h-full w-1 bg-red-500" />
						)}

						<Users size={22} strokeWidth={2.2} />
					</button>
				</div>

				<div className="mt-auto flex w-full flex-col gap-2 px-2">
					<button
						className={`${navButton} ${inactiveButton}`}
						aria-label="Settings"
					>
						<Settings size={22} strokeWidth={2.2} />
					</button>
				</div>
			</nav>

			<section
				className="
					w-80
					border-r-2 border-red-950
					bg-[#201313]
				"
			>
				{panel === "conversations" ? (
					<div>Conversations</div>
				) : (
					<div>Contacts</div>
				)}
			</section>
		</aside>
	);
}
