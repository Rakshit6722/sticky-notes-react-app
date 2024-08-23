import { createContext, useEffect, useState } from "react";
import db from "../appwrite/databases";
import Spinner from "../icons/Spinner";

export const NoteContext = createContext();

const NotesProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const[selectedNote,setSelectedNote] = useState(null)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const response = await db.notes.list();
        console.log(response);
        setNotes(response.documents);
        setLoading(false);
    }

    const value = {
        notes, setNotes, selectedNote, setSelectedNote
    }

    return (
        <NoteContext.Provider value={value}>
            {
                loading ?
                    (<>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100vh",
                            }}
                        >
                            <Spinner size="100" />
                        </div>
                    </>)
                    :
                    (<>
                        {children}
                    </>)
            }
        </NoteContext.Provider >
    )
}

export default NotesProvider