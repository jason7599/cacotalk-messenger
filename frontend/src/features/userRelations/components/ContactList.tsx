import { Search, SearchX, Skull, UserPlus } from "lucide-react";
import ContactListItem from "./ContactListItem";
import { useContactsStore } from "../contactsStore";
import { useModal } from "../../../components/ModalProvider";
import UserSearchModal from "./UserSearchModal";
import { useMemo, useState } from "react";

export default function ContactList() {
    const { openModal } = useModal();
    const contacts = useContactsStore((state) => state.contacts);

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return contacts;
        }

        return contacts.filter((c) => c.username.toLowerCase().includes(normalized));
    }, [contacts, query]);

    return (
        <div className="flex h-full min-h-0 flex-col">

            <header
                className="
                    border-b-2 border-[#4b1b1f]
                    bg-[#100708]
                    px-5 py-4
                "
            >
                <p className="mb-1 text-[10px] tracking-[0.22em] text-[#a71924]">
                    COMMUNICATIONS // ACTIVE
                </p>

                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl font-black tracking-[-0.02em]">
                        SOUL DIRECTORY
                    </h2>

                    <span className="text-[9px] tracking-[0.16em] text-[#7f6668]">
                        UNIT 02
                    </span>
                </div>
            </header>

            <div className="border-b-2 border-[#4b1b1f] bg-[#190b0d] p-3">
                <div className="flex gap-2">

                    <label
                        className="
                            flex flex-1 items-center gap-2
                            border-2 border-[#4b1b1f]
                            bg-[#0c0506]
                            px-3
                            focus-within:border-[#a71924]
                        "
                    >
                        <Search
                            size={16}
                            strokeWidth={2.3}
                            className="shrink-0 text-[#7f6668]"
                        />

                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="LOCATE A SOUL..."
                            className="
                                min-w-0 flex-1
                                bg-transparent
                                py-2.5
                                text-xs
                                text-[#eee2d5]
                                outline-none
                                placeholder:text-[#5f4548]
                            "
                        />
                    </label>

                    <button
                        type="button"
                        aria-label="Add contact"
                        onClick={() => openModal(<UserSearchModal />)}
                        className="
                            grid w-11 place-items-center
                            border-2 border-[#64141b]
                            bg-[#2b0e12]
                            text-[#a71924]
                            shadow-[3px_3px_0_#48090e]
                            hover:border-[#e02632]
                            hover:bg-[#a71924]
                            hover:text-[#eee2d5]
                            active:translate-x-0.75
                            active:translate-y-0.75
                            active:shadow-[1px_1px_0_#48090e]
                        "
                    >
                        <UserPlus size={19} strokeWidth={2.4} />
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
                        {contacts.length === 0 ? (
                            <>
                                <div
                                    className="
                                        mb-3 grid h-12 w-12 place-items-center
                                        border-2 border-[#64141b]
                                        bg-[#100708]
                                        text-[#a71924]
                                        shadow-[3px_3px_0_#48090e]
                                    "
                                >
                                    <Skull size={22} strokeWidth={2.2} />
                                </div>

                                <p className="text-xs font-bold tracking-[0.12em] text-[#9f8581]">
                                    NO SOULS ON RECORD
                                </p>

                                <p className="mt-1 text-[10px] text-[#7f6668]">
                                    YOUR CIRCLE OF DAMNATION IS EMPTY.
                                </p>
                            </>
                        ) : (
                            <>
                                <div
                                    className="
                                        mb-3 grid h-12 w-12 place-items-center
                                        border-2 border-[#4b1b1f]
                                        bg-[#0c0506]
                                        text-[#7f6668]
                                    "
                                >
                                    <SearchX size={22} />
                                </div>

                                <p className="text-xs font-bold tracking-[0.12em] text-[#9f8581]">
                                    NO MATCHING SOULS
                                </p>

                                <p className="mt-1 text-[10px] text-[#7f6668]">
                                    THE DIRECTORY YIELDS NOTHING.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    filtered.map((contact) => (
                        <ContactListItem
                            key={contact.userId}
                            contact={contact}
                        />
                    ))
                )}
            </div>

            <footer
                className="
                    border-t border-[#4b1b1f]
                    bg-[#100708]
                    px-4 py-2
                    text-[9px]
                    tracking-[0.16em]
                    text-[#7f6668]
                "
            >
                REGISTERED SOULS // DIRECTORY ONLINE
            </footer>
        </div>
    );
}