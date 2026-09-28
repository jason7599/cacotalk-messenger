import { SearchX, Skull, UserPlus } from "lucide-react";
import ContactListItem from "./ContactListItem";
import { useContactsStore } from "../contactsStore";
import { useModal } from "../../../components/ModalProvider";
import UserSearchModal from "./UserSearchModal";
import { useMemo, useState } from "react";
import { EmptyState, IconButton, SearchInput, SidebarList } from "../../../components/ui";

export default function ContactList() {
    const { openModal } = useModal();

    const contactsById = useContactsStore((s) => s.contactsById);
    const contactCount = Object.keys(contactsById).length;

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        return Object.values(contactsById)
            .filter((contact) =>
                !normalized
                || contact.username.toLowerCase().includes(normalized)
            )
            .sort((a, b) =>
                a.username.localeCompare(b.username)
            );
    }, [contactsById, query]);

    return (
        <SidebarList
            eyebrow="COMMUNICATIONS // ACTIVE"
            title="SOUL DIRECTORY"
            meta={
                <>
                    <span>{contactCount} {contactCount === 1 ? "SOUL" : "SOULS"}</span>
                    <span className="text-edge">//</span>
                    <span>UNIT 02</span>
                </>
            }
            toolbar={
                <div className="flex gap-2">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="LOCATE A SOUL..."
                        className="flex-1"
                    />

                    <IconButton
                        variant="accent"
                        size="xl"
                        aria-label="Add contact"
                        onClick={() => openModal(<UserSearchModal />)}
                    >
                        <UserPlus size={19} strokeWidth={2.4} />
                    </IconButton>
                </div>
            }
            footer={<>REGISTERED SOULS // {contactCount} TOTAL // DIRECTORY ONLINE</>}
        >
            {filtered.length === 0 ? (
                contactCount === 0 ? (
                    <EmptyState
                        icon={<Skull size={22} strokeWidth={2.2} />}
                        title="NO SOULS ON RECORD"
                        subtitle="YOUR CIRCLE OF DAMNATION IS EMPTY."
                    />
                ) : (
                    <EmptyState
                        icon={<SearchX size={22} strokeWidth={2.2} />}
                        title="NO MATCHING SOULS"
                        subtitle="THE DIRECTORY YIELDS NOTHING."
                    />
                )
            ) : (
                filtered.map((contact) => (
                    <ContactListItem
                        key={contact.userId}
                        contact={contact}
                    />
                ))
            )}
        </SidebarList>
    );
}
