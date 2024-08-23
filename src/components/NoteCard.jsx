import { useEffect, useRef, useState, useContext } from "react";
import Trash from "../icons/Trash";
import { setNewOffset, setZIndex, bodyParser } from "../utils";
import db from "../appwrite/databases";
import Spinner from "../icons/Spinner";
// import { handleDelete } from "../pages/NotesPage";
import DeleteButton from "./DeleteButton";
import { NoteContext } from "../context/NoteContext";

const NoteCard = ({ note }) => {

    const { setSelectedNote } = useContext(NoteContext)

    const [saving, setSaving] = useState(false)
    const keyUpTimer = useRef(null)


    //debounced function to save what user is writing in the textarea once he stops after keyUp event occurred after 2 sec
    const handleKeyUp = () => {
        setSaving(true);

        if (keyUpTimer.current) {
            // console.log(keyUpTimer.current)
            clearInterval(keyUpTimer.current)
        }

        keyUpTimer.current = setTimeout(() => {
            saveData("body", textAreaRef.current.value)
        }, 2000)
    }

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };
        try {
            await db.notes.update(note.$id, payload)
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
    }

    //to dynamically change the position of cards ans move them on screen
    const initialPosition = note?.position ? JSON.parse(note.position) : { x: 0, y: 0 };
    const [position, setPosition] = useState(initialPosition);
    let mouseStartPos = { x: 0, y: 0 };

    const cardRef = useRef(null)

    const mouseDown = (e) => {
        if (e.target.className === 'card-header') {
            mouseStartPos.x = e.clientX;
            mouseStartPos.y = e.clientY;

            document.addEventListener("mousemove", mouseMove)
            document.addEventListener("mouseup", mouseUp)

            setSelectedNote(note)
        }
    }

    const mouseUp = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);

        const newPosition = setNewOffset(cardRef.current)
        saveData("position", newPosition)
    }

    const mouseMove = (e) => {
        setZIndex(cardRef.current)
        // console.log(cardRef.current)
        let mouseMoveDir = {
            x: mouseStartPos.x - e.clientX,
            y: mouseStartPos.y - e.clientY,
        }

        mouseStartPos.x = e.clientX,
            mouseStartPos.y = e.clientY

        const newPosition = setNewOffset(cardRef.current, mouseMoveDir)

        setPosition(newPosition)
    }


    const body = bodyParser(note.body);
    // let position = JSON.parse(note.position);
    const colors = JSON.parse(note.colors)

    const textAreaRef = useRef(null)

    useEffect(() => {
        autoGrow(textAreaRef);
        setZIndex(cardRef.current);
    }, [])

    function autoGrow(textAreaRef) {
        const { current } = textAreaRef;
        console.log(current)
        current.style.height = "auto";
        current.style.height = current.scrollHeight + "px";
    }

    return (
        <div ref={cardRef} className="card"
            style={{
                backgroundColor: colors.colorBody,
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
        >

            <div onMouseDown={mouseDown} className="card-header"
                style={{
                    backgroundColor: colors.colorHeader
                }}>

                {/* {
                    saving && (
                        <div className="card-saving">
                            <span style={{ color: colors.colorText }}>Saving...</span>
                        </div>
                    )
                } */}
                <DeleteButton noteId={note.$id} />
                {saving && (
                    <div className="card-saving">
                        <Spinner color={colors.colorText} />
                        <span style={{ color: colors.colorText }}>
                            Saving...
                        </span>
                    </div>
                )}
            </div>

            <div className="card-body">
                <textarea onKeyUp={() => handleKeyUp()} onFocus={() => {
                    setZIndex(cardRef.current);
                    setSelectedNote(note)
                }} onInput={() => {
                    autoGrow(textAreaRef);
                }} ref={textAreaRef} style={{ color: colors.colorText }}
                    defaultValue={body}>
                </textarea>
            </div>
        </div>
    );
};

export default NoteCard