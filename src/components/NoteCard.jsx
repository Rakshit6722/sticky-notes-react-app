import { useContext, useEffect, useRef, useState } from "react";
import DeleteButton from "./DeleteButton";
import Spinner from "../icons/Spinner";
import { setNewOffset, setZIndex, bodyParser } from "../utils";
import db from "../appwrite/databases";
import { NoteContext } from "../context/NoteContext";

const NoteCard = ({ note, setNotes }) => {
    const [saving, setSaving] = useState(false);
    const keyUpTimer = useRef(null);
    const textAreaRef = useRef(null);
    const cardRef = useRef(null);

    const initialPosition = note?.position ? JSON.parse(note.position) : { x: 0, y: 0 };
    const [position, setPosition] = useState(initialPosition);

    const { setSelectedNote } = useContext(NoteContext)

    let mouseStartPos = { x: 0, y: 0 };

    const handleKeyUp = () => {
        setSaving(true);

        if (keyUpTimer.current) {
            clearTimeout(keyUpTimer.current);
        }

        keyUpTimer.current = setTimeout(() => {
            saveData("body", textAreaRef.current.value);
        }, 2000); // Delay for debounce
    };

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };
        try {
            await db.notes.update(note.$id, payload);
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    const startMove = (e) => {
        e.preventDefault();
        setSelectedNote(note)
        if (e.type === 'mousedown') {
            mouseStartPos.x = e.clientX;
            mouseStartPos.y = e.clientY;
        } else if (e.type === 'touchstart') {
            mouseStartPos.x = e.touches[0].clientX;
            mouseStartPos.y = e.touches[0].clientY;
        }

        document.addEventListener("mousemove", moveCard);
        document.addEventListener("mouseup", stopMove);
        document.addEventListener("touchmove", moveCard);
        document.addEventListener("touchend", stopMove);
    };

    const moveCard = (e) => {
        setZIndex(cardRef.current);

        let mouseMoveDir;

        if (e.type === 'mousemove') {
            mouseMoveDir = {
                x: mouseStartPos.x - e.clientX,
                y: mouseStartPos.y - e.clientY,
            };
            mouseStartPos.x = e.clientX;
            mouseStartPos.y = e.clientY;
        } else if (e.type === 'touchmove') {
            mouseMoveDir = {
                x: mouseStartPos.x - e.touches[0].clientX,
                y: mouseStartPos.y - e.touches[0].clientY,
            };
            mouseStartPos.x = e.touches[0].clientX;
            mouseStartPos.y = e.touches[0].clientY;
        }

        let newPosition = setNewOffset(cardRef.current, mouseMoveDir);

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get card dimensions
        const cardWidth = cardRef.current.offsetWidth;
        const cardHeight = cardRef.current.offsetHeight;

        // Constrain the new position to the viewport boundaries
        newPosition.x = Math.max(0, Math.min(newPosition.x, viewportWidth - cardWidth));
        newPosition.y = Math.max(0, Math.min(newPosition.y, viewportHeight - cardHeight));

        setPosition(newPosition);
    };

    const stopMove = () => {
        document.removeEventListener("mousemove", moveCard);
        document.removeEventListener("mouseup", stopMove);
        document.removeEventListener("touchmove", moveCard);
        document.removeEventListener("touchend", stopMove);

        const newPosition = setNewOffset(cardRef.current);
        saveData("position", newPosition);
    };

    useEffect(() => {
        const autoGrow = (textarea) => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        };

        if (textAreaRef.current) {
            autoGrow(textAreaRef.current);
        }
    }, []);

    const body = bodyParser(note.body);
    const colors = JSON.parse(note.colors);

    return (
        <div
            ref={cardRef}
            className="card"
            style={{
                backgroundColor: colors.colorBody,
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div
                onMouseDown={startMove}
                onTouchStart={startMove}
                className="card-header"
                style={{ backgroundColor: colors.colorHeader }}
            >
                <DeleteButton noteId={note.$id} setNotes={setNotes} />
                {saving && (
                    <div className="card-saving">
                        <Spinner color={colors.colorText} />
                        <span style={{ color: colors.colorText }}>Saving...</span>
                    </div>
                )}
            </div>
            <div className="card-body">
                <textarea
                    onKeyUp={handleKeyUp}
                    onFocus={() => {
                        setZIndex(cardRef.current)
                        setSelectedNote(note)
                    }
                    }
                    onInput={() => {
                        const textarea = textAreaRef.current;
                        textarea.style.height = "auto";
                        textarea.style.height = textarea.scrollHeight + "px";
                    }}
                    ref={textAreaRef}
                    style={{ color: colors.colorText }}
                    defaultValue={body}
                />
            </div>
        </div>
    );
};

export default NoteCard;
