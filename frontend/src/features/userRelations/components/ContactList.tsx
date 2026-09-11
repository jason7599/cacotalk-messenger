import { Search, UserPlus } from "lucide-react";
import ContactListItem from "./ContactListItem";
import { useContactsStore } from "../contactsStore";
import { useMemo } from "react";

export default function ContactList() {
    const contactsById = useContactsStore((state) => state.contacts);
    const contacts = useMemo(
        () =>
            Object.values(contactsById).sort((a, b) =>
                a.username.localeCompare(b.username)
            ),
        [contactsById]
    );

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
                {contacts.map(contact => (
                    <ContactListItem
                        key={contact.userId}
                        contact={contact}
                    />
                ))}
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